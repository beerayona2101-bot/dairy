import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'mobile_web_view_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<Map<String, dynamic>> _slides = [
    {
      'image': 'assets/images/freshMilk.jpg',
      'badgeIcon': '🌿',
      'badgeText': '100% PURE A2 MILK',
      'badgeColor': const Color(0xFF10B981),
      'title': 'Pure & Farm-Fresh Daily',
      'subtitle':
          'Pure, unadulterated milk sourced directly from local village farms with healthy, well-cared cows and delivered within hours of milking.',
      'chip': 'Zero Adulteration • Ethically Sourced',
    },
    {
      'image': 'assets/images/hygienicProcessing.jpg',
      'badgeIcon': '🛡️',
      'badgeText': 'STRICT LAB PURITY',
      'badgeColor': const Color(0xFF00ACC1),
      'title': 'Untouched Cold-Chain Hygiene',
      'subtitle':
          'Chilled within 45 minutes of milking. Strict multi-stage purity testing with zero preservatives or artificial chemicals.',
      'chip': 'Multi-Stage Tested • Sealed Cold-Chain',
    },
    {
      'image': 'assets/images/deliveryTruck.jpg',
      'badgeIcon': '⚡',
      'badgeText': 'BEFORE 7:00 AM',
      'badgeColor': const Color(0xFF1E88E5),
      'title': 'Morning Doorstep Delivery',
      'subtitle':
          'Guaranteed sunrise delivery 365 days a year right at your doorstep so your morning chai, coffee, and breakfast are never delayed.',
      'chip': '365 Days • Dependable Sunrise Delivery',
    },
    {
      'image': 'assets/images/freshProducts.jpg',
      'badgeIcon': '🧀',
      'badgeText': 'DELICIOUS RANGE',
      'badgeColor': const Color(0xFF6C5CE7),
      'title': 'From Milk to Desi Ghee',
      'subtitle':
          'Fresh Malai Paneer, thick dahi, golden A2 Desi Cow Ghee, creamy sweets, and daily breakfast essentials ordered with one tap.',
      'chip': 'Paneer • Ghee • Curd • Sweets',
    },
  ];

  Future<void> _finishOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('has_seen_onboarding', true);

    if (!mounted) return;

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, anim, secAnim) => const MobileWebViewScreen(),
        transitionsBuilder: (context, animation, secAnim, child) =>
            FadeTransition(opacity: animation, child: child),
        transitionDuration: const Duration(milliseconds: 500),
      ),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currentSlide = _slides[_currentPage];
    final Color currentAccent = currentSlide['badgeColor'] as Color;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar: Brand Mini Header & Skip Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Brand Mini Logo + Title
                  Row(
                    children: [
                      Container(
                        height: 42,
                        constraints: const BoxConstraints(maxWidth: 160),
                        child: Image.asset(
                          'assets/images/madhur_dairy_logo.png',
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) => Row(
                            children: [
                              Container(
                                width: 34,
                                height: 34,
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Color(0xFF10B981),
                                ),
                                child: const Icon(Icons.water_drop_rounded, size: 18, color: Colors.white),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Madhur Dairy',
                                style: GoogleFonts.outfit(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w900,
                                  color: isDark ? Colors.white : const Color(0xFF0F2742),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Skip Button
                  if (_currentPage < _slides.length - 1)
                    TextButton(
                      onPressed: _finishOnboarding,
                      style: TextButton.styleFrom(
                        backgroundColor: isDark
                            ? Colors.white.withValues(alpha: 0.08)
                            : Colors.black.withValues(alpha: 0.04),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      ),
                      child: Text(
                        'Skip',
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.grey.shade300 : const Color(0xFF64748B),
                        ),
                      ),
                    )
                  else
                    const SizedBox(width: 60),
                ],
              ),
            ),

            // Main PageView Carousel
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (index) {
                  setState(() {
                    _currentPage = index;
                  });
                },
                itemCount: _slides.length,
                itemBuilder: (context, index) {
                  final slide = _slides[index];
                  final Color slideColor = slide['badgeColor'] as Color;

                  return SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(height: 12),

                        // Hero Visual Image Card with Badge
                        Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Container(
                              width: double.infinity,
                              height: 240,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(26),
                                boxShadow: [
                                  BoxShadow(
                                    color: slideColor.withValues(alpha: 0.22),
                                    blurRadius: 28,
                                    offset: const Offset(0, 10),
                                  ),
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.08),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(26),
                                child: Image.asset(
                                  slide['image'] as String,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => Container(
                                    color: slideColor.withValues(alpha: 0.1),
                                    child: Center(
                                      child: Icon(
                                        Icons.local_shipping_rounded,
                                        size: 64,
                                        color: slideColor,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),

                            // Floating Top Pill Badge
                            Positioned(
                              top: 14,
                              left: 14,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.65),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: Colors.white.withValues(alpha: 0.25),
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      slide['badgeIcon'] as String,
                                      style: const TextStyle(fontSize: 12),
                                    ),
                                    const SizedBox(width: 5),
                                    Text(
                                      slide['badgeText'] as String,
                                      style: GoogleFonts.outfit(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w800,
                                        color: Colors.white,
                                        letterSpacing: 0.8,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 32),

                        // Title
                        Text(
                          slide['title'] as String,
                          textAlign: TextAlign.center,
                          style: GoogleFonts.outfit(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: isDark ? Colors.white : const Color(0xFF0F2742),
                            letterSpacing: -0.5,
                            height: 1.2,
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Subtitle
                        Text(
                          slide['subtitle'] as String,
                          textAlign: TextAlign.center,
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            fontWeight: FontWeight.w400,
                            height: 1.55,
                            color: isDark ? Colors.grey.shade300 : const Color(0xFF475569),
                          ),
                        ),

                        const SizedBox(height: 18),

                        // Feature Chip
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                          decoration: BoxDecoration(
                            color: slideColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: slideColor.withValues(alpha: 0.3),
                            ),
                          ),
                          child: Text(
                            slide['chip'] as String,
                            style: GoogleFonts.outfit(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: slideColor,
                              letterSpacing: 0.4,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            // Bottom Navigation & Actions
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
              child: Column(
                children: [
                  // Expanding Page Indicator
                  SmoothPageIndicator(
                    controller: _pageController,
                    count: _slides.length,
                    effect: ExpandingDotsEffect(
                      activeDotColor: currentAccent,
                      dotColor: isDark ? Colors.white24 : Colors.grey.shade300,
                      dotHeight: 8,
                      dotWidth: 8,
                      expansionFactor: 3.5,
                      spacing: 6,
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Action Buttons
                  Row(
                    children: [
                      // Back Button (shown from page 1 onwards)
                      if (_currentPage > 0) ...[
                        Container(
                          height: 52,
                          width: 52,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.08)
                                : Colors.grey.shade200,
                          ),
                          child: IconButton(
                            icon: Icon(
                              Icons.arrow_back_rounded,
                              color: isDark ? Colors.white : const Color(0xFF0F2742),
                            ),
                            onPressed: () {
                              _pageController.previousPage(
                                duration: const Duration(milliseconds: 300),
                                curve: Curves.easeInOut,
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 14),
                      ],

                      // Next / Get Started Button
                      Expanded(
                        child: Container(
                          height: 52,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: _currentPage == _slides.length - 1
                                  ? const [Color(0xFF10B981), Color(0xFF059669)]
                                  : [currentAccent, currentAccent.withValues(alpha: 0.85)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: (_currentPage == _slides.length - 1
                                        ? const Color(0xFF10B981)
                                        : currentAccent)
                                    .withValues(alpha: 0.35),
                                blurRadius: 16,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              onTap: () {
                                if (_currentPage == _slides.length - 1) {
                                  _finishOnboarding();
                                } else {
                                  _pageController.nextPage(
                                    duration: const Duration(milliseconds: 320),
                                    curve: Curves.easeInOut,
                                  );
                                }
                              },
                              borderRadius: BorderRadius.circular(16),
                              child: Center(
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      _currentPage == _slides.length - 1
                                          ? 'Get Started'
                                          : 'Continue',
                                      style: GoogleFonts.outfit(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w800,
                                        color: Colors.white,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Icon(
                                      _currentPage == _slides.length - 1
                                          ? Icons.arrow_forward_rounded
                                          : Icons.arrow_forward_ios_rounded,
                                      color: Colors.white,
                                      size: _currentPage == _slides.length - 1 ? 20 : 14,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
