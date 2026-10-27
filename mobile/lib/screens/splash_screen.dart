import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../config/api_config.dart';
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
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    // Powerful, smooth zoom-in scale animation
    _scaleAnimation = Tween<double>(begin: 0.35, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutBack,
      ),
    );

    // Smooth opacity fade-in
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.45, curve: Curves.easeOut),
      ),
    );

    // Radiant backdrop glow pulse expansion
    _glowAnimation = Tween<double>(begin: 0.25, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.1, 0.85, curve: Curves.easeOutCubic),
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
    final precacheFuture = mounted
        ? Future.wait([
            precacheImage(
              const AssetImage('assets/images/splash_logo.png'),
              context,
            ),
            precacheImage(
              const AssetImage('assets/images/logoLightMode.png'),
              context,
            ),
            precacheImage(
              const AssetImage('assets/images/freshMilk.jpg'),
              context,
            ),
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
          ]).catchError((_) => [])
        : Future.value([]);

    // 2. Dynamically resolve active server URL (Remote Config -> Saved -> Tunnel -> Local LAN)
    final serverFuture = ApiConfig.resolveWorkingServer().catchError((e) {
      debugPrint('[Splash] Server resolution note: $e');
      return ApiConfig.productionServerUrl;
    });

    // 3. Initialize auth provider and restore session tokens once server is resolved
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final authFuture = serverFuture.then((_) {
      return authProvider.isInitializing
          ? authProvider.initAuth()
          : Future.value(null);
    });

    // 4. Minimum display duration to ensure user experiences the full zoom-in animation smoothly
    final minDisplayFuture = Future.delayed(const Duration(milliseconds: 1800));

    // Wait for all concurrent initialization tasks
    await Future.wait([
      precacheFuture,
      serverFuture,
      authFuture,
      minDisplayFuture,
    ]);

    if (!mounted) return;

    // Routing decision:
    // - Authenticated: go directly to main app (MobileWebViewScreen). Skip onboarding completely!
    // - Not authenticated: show onboarding flow.
    final Widget targetScreen = authProvider.isAuthenticated
        ? const MobileWebViewScreen(initialUrl: ApiConfig.productionServerUrl)
        : const OnboardingScreen();

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, anim, secAnim) => targetScreen,
        transitionsBuilder: (context, animation, secAnim, child) {
          return FadeTransition(
            opacity: CurvedAnimation(
              parent: animation,
              curve: Curves.easeInOut,
            ),
            child: child,
          );
        },
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
              final maxLogoWidth = constraints.maxWidth < 460
                  ? constraints.maxWidth * 0.90
                  : 380.0;
              final maxLogoWidthByHeight =
                  (constraints.maxHeight * 0.48) / (795.0 / 1024.0);
              final logoWidth = maxLogoWidth < maxLogoWidthByHeight
                  ? maxLogoWidth
                  : maxLogoWidthByHeight;
              final logoHeight = logoWidth * (795.0 / 1024.0);

              return Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Spacer(flex: 3),

                  // Animated Hero Brand Logo with Zoom-In effect and Radiant Glow
                  ScaleTransition(
                    scale: _scaleAnimation,
                    child: FadeTransition(
                      opacity: _fadeAnimation,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          AnimatedBuilder(
                            animation: _glowAnimation,
                            builder: (context, _) {
                              return Container(
                                width: logoWidth * (0.95 + 0.15 * _glowAnimation.value),
                                height: logoHeight * (0.95 + 0.15 * _glowAnimation.value),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: RadialGradient(
                                    colors: [
                                      const Color(0xFF10B981).withValues(
                                        alpha: 0.18 * _glowAnimation.value,
                                      ),
                                      const Color(0xFF0756B5).withValues(
                                        alpha: 0.06 * _glowAnimation.value,
                                      ),
                                      Colors.transparent,
                                    ],
                                    stops: const [0.0, 0.55, 1.0],
                                  ),
                                ),
                              );
                            },
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
                    ),
                  ),

                  const Spacer(flex: 2),

                  // Bottom Loading Spinner & Slogan
                  FadeTransition(
                    opacity: _fadeAnimation,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const SpinKitThreeBounce(
                          color: Color(0xFF10B981),
                          size: 20,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Delivering Farm Purity Daily...',
                          style: GoogleFonts.outfit(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF64748B),
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
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
