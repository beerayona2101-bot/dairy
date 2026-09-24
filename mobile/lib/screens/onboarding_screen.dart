import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'login_screen.dart';

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
      'category': 'FARM TO TABLE',
      'badgeIcon': '🌿',
      'badgeText': '100% PURE A2 MILK',
      'metric': '⭐ 4.9 Farm Verified',
      'badgeColor': const Color(0xFF0284C7), // Dairy Blue
      'title': 'Pure & Farm-Fresh Milk',
      'subtitle':
          '100% pure, unadulterated cow & buffalo milk sourced directly from ethical village dairy farms every single morning.',
      'benefits': [
        {
          'icon': Icons.water_drop_rounded,
          'title': 'Zero Adulteration',
          'desc': 'No added water, synthetic hormones, or chemical preservatives.',
        },
        {
          'icon': Icons.schedule_rounded,
          'title': 'Under 4-Hour Fresh',
          'desc': 'Milked at dawn and packaged within hours of collection.',
        },
        {
          'icon': Icons.eco_rounded,
          'title': 'Rich in A2 Proteins',
          'desc': 'Naturally nutritious, easy to digest, and rich in natural calcium.',
        },
      ],
    },
    {
      'image': 'assets/images/hygienicProcessing.jpg',
      'category': 'QUALITY ASSURED',
      'badgeIcon': '🛡️',
      'badgeText': '4°C COLD CHAIN',
      'metric': '❄️ 24+ Lab Tests',
      'badgeColor': const Color(0xFF0284C7), // Dairy Blue
      'title': 'Untouched Cold-Chain Hygiene',
      'subtitle':
          'Chilled to 4°C within 45 minutes of milking and maintained in continuous cold chain with automated packaging.',
      'benefits': [
        {
          'icon': Icons.biotech_rounded,
          'title': '24+ Lab Quality Checks',
          'desc': 'Rigorous daily lab testing for fat, SNF, and chemical purity.',
        },
        {
          'icon': Icons.ac_unit_rounded,
          'title': 'Sealed Cold Chain',
          'desc': 'Held consistently at 4°C from farm chiller to your doorstep.',
        },
        {
          'icon': Icons.clean_hands_rounded,
          'title': 'Touchless Packaging',
          'desc': 'Automated, untouched filling in sterile food-grade packs.',
        },
      ],
    },
    {
      'image': 'assets/images/deliveryTruck.jpg',
      'category': 'FAST & PUNCTUAL',
      'badgeIcon': '⚡',
      'badgeText': 'BEFORE 7:00 AM',
      'metric': '🚚 Sunrise Guarantee',
      'badgeColor': const Color(0xFF0284C7), // Dairy Blue
      'title': 'Guaranteed Sunrise Delivery',
      'subtitle':
          'Sunrise doorstep delivery before 7:00 AM 365 days a year so your morning chai, coffee, and breakfast are never delayed.',
      'benefits': [
        {
          'icon': Icons.alarm_on_rounded,
          'title': 'Prompt 7:00 AM Drop',
          'desc': 'Punctual arrival at your doorstep before your household wakes up.',
        },
        {
          'icon': Icons.notifications_off_outlined,
          'title': 'Silent Ring-Free Drop',
          'desc': 'Delivered quietly without disturbing your family sleep.',
        },
        {
          'icon': Icons.calendar_month_rounded,
          'title': 'Flexible Subscriptions',
          'desc': 'Easily pause, modify, or add quantities with one tap.',
        },
      ],
    },
  ];

  void _goToLogin() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
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

    return PopScope(
      canPop: _currentPage == 0,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (_currentPage > 0) {
          _pageController.previousPage(
            duration: const Duration(milliseconds: 280),
            curve: Curves.easeInOut,
          );
        }
      },
      child: Scaffold(
        backgroundColor: isDark ? const Color(0xFF0B1120) : Colors.white,
        body: SafeArea(
          child: Column(
            children: [
              // Top App Bar: Brand Logo, Step Indicator, & Skip Button
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Brand Logo Header
                    Container(
                      height: 42,
                      constraints: const BoxConstraints(maxWidth: 160),
                      child: Image.asset(
                        'assets/images/cowLogo.png',
                        fit: BoxFit.contain,
                        filterQuality: FilterQuality.high,
                        errorBuilder: (context, error, stackTrace) => Row(
                          children: [
                            Container(
                              width: 32,
                              height: 32,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: Color(0xFF10B981),
                              ),
                              child: const Icon(Icons.water_drop_rounded, size: 18, color: Colors.white),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Madhu Dairy',
                              style: GoogleFonts.outfit(
                                fontSize: 15,
                                fontWeight: FontWeight.w900,
                                color: isDark ? Colors.white : const Color(0xFF0F2742),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Step Badge + Skip Button
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: currentAccent.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: currentAccent.withValues(alpha: 0.35),
                              width: 1,
                            ),
                          ),
                          child: Text(
                            '${_currentPage + 1} of ${_slides.length}',
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: currentAccent,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        if (_currentPage < _slides.length - 1)
                          TextButton(
                            onPressed: () {
                              _pageController.animateToPage(
                                _slides.length - 1,
                                duration: const Duration(milliseconds: 320),
                                curve: Curves.easeInOut,
                              );
                            },
                            style: TextButton.styleFrom(
                              backgroundColor: isDark
                                  ? Colors.white.withValues(alpha: 0.08)
                                  : Colors.white,
                              elevation: isDark ? 0 : 1,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                                side: BorderSide(
                                  color: isDark ? Colors.white12 : Colors.grey.shade200,
                                ),
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                            ),
                            child: Text(
                              'Skip',
                              style: GoogleFonts.outfit(
                                fontSize: 12.5,
                                fontWeight: FontWeight.w700,
                                color: isDark ? Colors.grey.shade300 : const Color(0xFF64748B),
                              ),
                            ),
                          )
                        else
                          const SizedBox(width: 32),
                      ],
                    ),
                  ],
                ),
              ),

            // Onboarding Card Carousel (Page View)
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
                  final List<dynamic> benefits = slide['benefits'] as List<dynamic>;

                  return LayoutBuilder(
                    builder: (context, constraints) {
                      final availableHeight = constraints.maxHeight;
                      final isCompact = availableHeight < 580;
                      final double imageHeight = isCompact
                          ? 145.0
                          : (availableHeight * 0.28).clamp(150.0, 192.0);

                      return SingleChildScrollView(
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 4.0),
                        child: Container(
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF1E293B) : Colors.white,
                            borderRadius: BorderRadius.circular(26),
                            border: Border.all(
                              color: isDark
                                  ? slideColor.withValues(alpha: 0.3)
                                  : slideColor.withValues(alpha: 0.22),
                              width: 1.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: slideColor.withValues(alpha: 0.14),
                                blurRadius: 24,
                                offset: const Offset(0, 8),
                              ),
                              BoxShadow(
                                color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.04),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          padding: EdgeInsets.all(isCompact ? 13.0 : 16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Hero Image Container with Rounded Corners & Floating Glass Badges
                              Stack(
                                clipBehavior: Clip.none,
                                children: [
                                  Container(
                                    width: double.infinity,
                                    height: imageHeight,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(20),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.12),
                                      blurRadius: 12,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(20),
                                  child: Image.asset(
                                    slide['image'] as String,
                                    fit: BoxFit.cover,
                                    filterQuality: FilterQuality.medium,
                                    errorBuilder: (context, error, stackTrace) => Container(
                                      color: slideColor.withValues(alpha: 0.1),
                                      child: Center(
                                        child: Icon(
                                          Icons.local_shipping_rounded,
                                          size: 56,
                                          color: slideColor,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),

                              // Gradient Shade at Bottom of Image
                              Positioned(
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 60,
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: const BorderRadius.only(
                                      bottomLeft: Radius.circular(20),
                                      bottomRight: Radius.circular(20),
                                    ),
                                    gradient: LinearGradient(
                                      begin: Alignment.topCenter,
                                      end: Alignment.bottomCenter,
                                      colors: [
                                        Colors.transparent,
                                        Colors.black.withValues(alpha: 0.65),
                                      ],
                                    ),
                                  ),
                                ),
                              ),

                              // Category / Feature Badge (Top Left)
                              Positioned(
                                top: 12,
                                left: 12,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4.5),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.72),
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(
                                      color: Colors.white.withValues(alpha: 0.25),
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.2),
                                        blurRadius: 6,
                                      ),
                                    ],
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        slide['badgeIcon'] as String,
                                        style: const TextStyle(fontSize: 11),
                                      ),
                                      const SizedBox(width: 5),
                                      Text(
                                        slide['badgeText'] as String,
                                        style: GoogleFonts.outfit(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w800,
                                          color: Colors.white,
                                          letterSpacing: 0.6,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),

                              // Metric Pill Badge (Bottom Right)
                              Positioned(
                                bottom: 10,
                                right: 10,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: slideColor.withValues(alpha: 0.95),
                                    borderRadius: BorderRadius.circular(14),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.25),
                                        blurRadius: 6,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: Text(
                                    slide['metric'] as String,
                                    style: GoogleFonts.outfit(
                                      fontSize: 10.5,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.white,
                                      letterSpacing: 0.3,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 16),

                          // Category Subhead
                          Text(
                            slide['category'] as String,
                            style: GoogleFonts.outfit(
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              color: slideColor,
                              letterSpacing: 1.2,
                            ),
                          ),
                          const SizedBox(height: 2),

                          // Card Header Title
                          Text(
                            slide['title'] as String,
                            style: GoogleFonts.outfit(
                              fontSize: 21,
                              fontWeight: FontWeight.w900,
                              color: isDark ? Colors.white : const Color(0xFF0F2742),
                              letterSpacing: -0.4,
                              height: 1.2,
                            ),
                          ),

                          const SizedBox(height: 5),

                          // Card Subtitle
                          Text(
                            slide['subtitle'] as String,
                            style: GoogleFonts.outfit(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w400,
                              height: 1.4,
                              color: isDark ? Colors.grey.shade300 : const Color(0xFF475569),
                            ),
                          ),

                          const SizedBox(height: 14),

                          // Benefit Mini-Cards Grid (3 Cards per slide)
                          Column(
                            children: benefits.map<Widget>((benefit) {
                              final b = benefit as Map<String, dynamic>;
                              return Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                                decoration: BoxDecoration(
                                  color: isDark
                                      ? const Color(0xFF0F172A).withValues(alpha: 0.65)
                                      : slideColor.withValues(alpha: 0.05),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: slideColor.withValues(alpha: isDark ? 0.22 : 0.16),
                                    width: 1,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 34,
                                      height: 34,
                                      decoration: BoxDecoration(
                                        color: slideColor.withValues(alpha: 0.15),
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(
                                        b['icon'] as IconData,
                                        color: slideColor,
                                        size: 18,
                                      ),
                                    ),
                                    const SizedBox(width: 11),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            b['title'] as String,
                                            style: GoogleFonts.outfit(
                                              fontSize: 12.5,
                                              fontWeight: FontWeight.w800,
                                              color: isDark ? Colors.white : const Color(0xFF0F2742),
                                            ),
                                          ),
                                          const SizedBox(height: 1.5),
                                          Text(
                                            b['desc'] as String,
                                            style: GoogleFonts.outfit(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w400,
                                              color: isDark
                                                  ? Colors.grey.shade400
                                                  : const Color(0xFF64748B),
                                              height: 1.25,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              );
            },
              ),
            ),

            // Bottom Navigation Controls
            Padding(
              padding: const EdgeInsets.fromLTRB(18.0, 8.0, 18.0, 12.0),
              child: Column(
                children: [
                  // Smooth Dots Indicator
                  SmoothPageIndicator(
                    controller: _pageController,
                    count: _slides.length,
                    effect: ExpandingDotsEffect(
                      activeDotColor: currentAccent,
                      dotColor: isDark ? Colors.white24 : Colors.grey.shade300,
                      dotHeight: 7.5,
                      dotWidth: 7.5,
                      expansionFactor: 3.6,
                      spacing: 5,
                    ),
                  ),

                  const SizedBox(height: 12),

                  if (_currentPage == _slides.length - 1) ...[
                    // FINAL SLIDE: Single premium "Get Started" CTA
                    SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF0284C7), Color(0xFF0369A1)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF0284C7).withValues(alpha: 0.45),
                              blurRadius: 18,
                              offset: const Offset(0, 5),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: _goToLogin,
                            borderRadius: BorderRadius.circular(16),
                            child: Center(
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(
                                    Icons.rocket_launch_rounded,
                                    color: Colors.white,
                                    size: 20,
                                  ),
                                  const SizedBox(width: 10),
                                  Text(
                                    'Get Started',
                                    style: GoogleFonts.outfit(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 0.5,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),

                  ] else ...[
                    // SLIDES 1 & 2 — Full-width Continue button (no back arrow)
                    SizedBox(
                      width: double.infinity,
                      child: Container(
                        height: 52,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [currentAccent, currentAccent.withValues(alpha: 0.85)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: currentAccent.withValues(alpha: 0.38),
                              blurRadius: 16,
                              offset: const Offset(0, 5),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              _pageController.nextPage(
                                duration: const Duration(milliseconds: 300),
                                curve: Curves.easeInOut,
                              );
                            },
                            borderRadius: BorderRadius.circular(16),
                            child: Center(
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'Continue',
                                    style: GoogleFonts.outfit(
                                      fontSize: 15.5,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.white,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  const Icon(
                                    Icons.arrow_forward_rounded,
                                    color: Colors.white,
                                    size: 19,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    ),
  );
}
}
