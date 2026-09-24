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

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
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

    _initializeApp();
  }

  Future<void> _initializeApp() async {
    // 1. Initialize auth provider and restore session tokens
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.initAuth();

    // 2. Keep splash visible for smooth brand hero logo animation
    await Future.delayed(const Duration(milliseconds: 1800));

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
            colors: [
              Color(0xFFFFFFFF),
              Color(0xFFF6FAF8),
              Color(0xFFEFF8F3),
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          child: Column(
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
                      // Ambient Glow behind the logo
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          Container(
                            width: 240,
                            height: 240,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: RadialGradient(
                                colors: [
                                  const Color(0xFF10B981).withValues(alpha: 0.18),
                                  const Color(0xFF10B981).withValues(alpha: 0.04),
                                  Colors.transparent,
                                ],
                              ),
                            ),
                          ),

                          // Brand Logo PNG
                          Hero(
                            tag: 'app_brand_logo',
                            child: Container(
                              constraints: const BoxConstraints(
                                maxWidth: 290,
                                maxHeight: 290,
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 20),
                              child: Image.asset(
                                'assets/images/cowLogo.png',
                                fit: BoxFit.contain,
                                filterQuality: FilterQuality.high,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Quality Assurance Pill Badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(
                            color: const Color(0xFF10B981).withValues(alpha: 0.4),
                            width: 1.2,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF10B981).withValues(alpha: 0.1),
                              blurRadius: 14,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text('🌱', style: TextStyle(fontSize: 13)),
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
              const SpinKitThreeBounce(
                color: Color(0xFF10B981),
                size: 22,
              ),
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
          ),
        ),
      ),
    );
  }
}
