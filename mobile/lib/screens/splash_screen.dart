import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'mobile_web_view_screen.dart';
import 'onboarding_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.7, curve: Curves.easeOut),
      ),
    );

    _scaleAnimation = Tween<double>(begin: 0.82, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.85, curve: Curves.easeOutBack),
      ),
    );

    _controller.forward();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _initializeApp();
      }
    });
  }

  Future<void> _initializeApp() async {
    // 1. Precache onboarding and brand logo images concurrently in parallel for instant display
    if (mounted) {
      Future.wait([
        precacheImage(
          const AssetImage('assets/images/splash_logo.png'),
          context,
        ),
        precacheImage(
          const AssetImage('assets/images/logoLightMode.png'),
          context,
        ),
        precacheImage(const AssetImage('assets/images/freshMilk.jpg'), context),
        precacheImage(
          const AssetImage('assets/images/hygienicProcessing.jpg'),
          context,
        ),
        precacheImage(
          const AssetImage('assets/images/deliveryTruck.jpg'),
          context,
        ),
        precacheImage(
          const AssetImage('assets/images/freshProducts.jpg'),
          context,
        ),
      ]).catchError((_) => []);
    }

    // 2. Initialize auth provider and restore session tokens
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.initAuth();

    // 3. Fast & responsive startup delay
    await Future.delayed(const Duration(milliseconds: 400));

    if (!mounted) return;

    // Routing decision:
    // - Authenticated: go directly to main app (MobileWebViewScreen). Skip onboarding completely!
    // - Not authenticated (including new and guest users on restart): show onboarding flow.
    final Widget targetScreen = authProvider.isAuthenticated
        ? const MobileWebViewScreen()
        : const OnboardingScreen();

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, anim, secAnim) => targetScreen,
        transitionsBuilder: (context, animation, secAnim, child) =>
            FadeTransition(opacity: animation, child: child),
        transitionDuration: const Duration(milliseconds: 500),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFFFFFFF), Color(0xFFF6FAF8), Color(0xFFEFF8F3)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final maxLogoWidth = constraints.maxWidth < 422
                  ? constraints.maxWidth * 0.88
                  : 360.0;
              final maxLogoWidthByHeight =
                  (constraints.maxHeight * 0.38) / (795.0 / 1024.0);
              final logoWidth = maxLogoWidth < maxLogoWidthByHeight
                  ? maxLogoWidth
                  : maxLogoWidthByHeight;
              final logoHeight = logoWidth * (795.0 / 1024.0);

              return Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Spacer(flex: 3),

                  // Animated Hero Brand Logo
                  ScaleTransition(
                    scale: _scaleAnimation,
                    child: FadeTransition(
                      opacity: _fadeAnimation,
                      child: Column(
                        children: [
                          Stack(
                            alignment: Alignment.center,
                            children: [
                              Container(
                                width: logoWidth * 0.88,
                                height: logoHeight * 0.88,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: RadialGradient(
                                    colors: [
                                      const Color(
                                        0xFF10B981,
                                      ).withValues(alpha: 0.16),
                                      const Color(
                                        0xFF10B981,
                                      ).withValues(alpha: 0.03),
                                      Colors.transparent,
                                    ],
                                  ),
                                ),
                              ),
                              Hero(
                                tag: 'app_brand_logo',
                                child: SizedBox(
                                  width: logoWidth,
                                  height: logoHeight,
                                  child: Image.asset(
                                    'assets/images/splash_logo.png',
                                    fit: BoxFit.contain,
                                    filterQuality: FilterQuality.high,
                                    errorBuilder: (_, _, _) => Image.asset(
                                      'assets/images/logoLightMode.png',
                                      fit: BoxFit.contain,
                                      filterQuality: FilterQuality.high,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),

                          // Brand Name Typography
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'NATURAL ',
                                style: GoogleFonts.outfit(
                                  fontSize: 23,
                                  fontWeight: FontWeight.w900,
                                  color: const Color(0xFF075C2A),
                                  letterSpacing: 1.1,
                                ),
                              ),
                              Text(
                                'MILK DAIRY',
                                style: GoogleFonts.outfit(
                                  fontSize: 23,
                                  fontWeight: FontWeight.w900,
                                  color: const Color(0xFF0756B5),
                                  letterSpacing: 1.1,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 3),
                          Text(
                            "Bringing Nature's Best, Straight to Your Home",
                            style: GoogleFonts.outfit(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF64748B),
                              letterSpacing: 0.2,
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Quality Assurance Pill Badge
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 18,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(
                                0xFF10B981,
                              ).withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(30),
                              border: Border.all(
                                color: const Color(
                                  0xFF10B981,
                                ).withValues(alpha: 0.4),
                                width: 1.2,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(
                                    0xFF10B981,
                                  ).withValues(alpha: 0.1),
                                  blurRadius: 14,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Text(
                                  '🌱',
                                  style: TextStyle(fontSize: 13),
                                ),
                                const SizedBox(width: 7),
                                Text(
                                  '100% PURE & FARM-FRESH DAIRY',
                                  style: GoogleFonts.outfit(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w800,
                                    color: const Color(0xFF047857),
                                    letterSpacing: 0.9,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const Spacer(flex: 2),

                  // Bottom Loading Spinner & Slogan
                  const SpinKitThreeBounce(color: Color(0xFF10B981), size: 22),
                  const SizedBox(height: 14),
                  Text(
                    'Delivering Farm Purity Daily...',
                    style: GoogleFonts.outfit(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF475569),
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 38),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}
