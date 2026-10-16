import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../providers/auth_provider.dart';
import '../widgets/custom_input.dart';
import 'login_screen.dart';
import 'mobile_web_view_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _acceptTerms = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _mobileController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  bool _isValidPassword(String password) {
    return password.length >= 8 && RegExp(r'\d').hasMatch(password);
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_acceptTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('⚠️ Please tick the checkbox to agree to the Terms and Conditions.'),
          backgroundColor: Color(0xFFF59E0B),
          duration: Duration(seconds: 3),
        ),
      );
      return;
    }

    if (!_isValidPassword(_passwordController.text)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Password must be at least 8 characters and contain a number.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    if (_passwordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Passwords do not match.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.signup(
      _emailController.text.trim(),
      _passwordController.text.trim(),
      _confirmPasswordController.text.trim(),
      username: _usernameController.text.trim(),
      mobileNo: _mobileController.text.trim(),
    );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🎉 Account Created! Please sign in with your credentials.'),
          backgroundColor: Color(0xFF10B981),
          duration: Duration(seconds: 3),
        ),
      );
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.errorMessage ?? 'An account with this email or mobile number already exists.'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  Future<void> _continueAsGuest() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('is_guest_user', true);

    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('👋 Welcome! Continuing as Guest User.'),
        backgroundColor: Color(0xFF0284C7),
        duration: Duration(seconds: 2),
      ),
    );

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, anim, secAnim) => const MobileWebViewScreen(),
        transitionsBuilder: (context, animation, secAnim, child) =>
            FadeTransition(opacity: animation, child: child),
        transitionDuration: const Duration(milliseconds: 400),
      ),
    );
  }

  void _showTermsModal(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F172A) : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.35),
              blurRadius: 25,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Modal Header with Drag Handle
              Container(
                padding: const EdgeInsets.fromLTRB(24, 12, 16, 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Terms & Privacy Policy',
                            style: GoogleFonts.outfit(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: isDark ? Colors.white : const Color(0xFF0F2742),
                            ),
                          ),
                          Text(
                            'Natural Milk Dairy & Daily Needs',
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: const Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(ctx),
                      icon: Icon(
                        Icons.close_rounded,
                        color: isDark ? Colors.white70 : const Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 24),

              // Scrollable Terms Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildTermsSection(
                        icon: Icons.eco_rounded,
                        title: '1. 100% Purity & Farm Freshness',
                        desc:
                            'All milk and dairy products are sourced fresh from healthy cows daily. Guaranteed zero chemical preservatives, adulterants, or synthetic hormones.',
                        isDark: isDark,
                      ),
                      _buildTermsSection(
                        icon: Icons.local_shipping_outlined,
                        title: '2. Morning Doorstep Delivery',
                        desc:
                            'Fresh dairy products are delivered right to your doorstep every morning between 5:30 AM and 7:30 AM. Orders placed or modified before 10:00 PM will take effect the following morning.',
                        isDark: isDark,
                      ),
                      _buildTermsSection(
                        icon: Icons.pause_circle_outline_rounded,
                        title: '3. Flexible Vacation & Pause',
                        desc:
                            'Travelling or taking a break? You can pause, adjust quantities, or resume subscriptions anytime through your user profile before 10:00 PM with zero extra charges.',
                        isDark: isDark,
                      ),
                      _buildTermsSection(
                        icon: Icons.account_balance_wallet_outlined,
                        title: '4. Transparent Billing & Refunds',
                        desc:
                            'We support UPI, Online Payment, and Cash on Delivery. In the rare event of a missed delivery or bottle damage, refund credits are instantly applied to your account.',
                        isDark: isDark,
                      ),
                      _buildTermsSection(
                        icon: Icons.security_rounded,
                        title: '5. Privacy & Data Confidentiality',
                        desc:
                            'Your personal contact details, addresses, and transaction records are securely encrypted. We never sell, rent, or share customer data with third parties.',
                        isDark: isDark,
                      ),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
              ),

              // Accept Button Container
              Container(
                padding: const EdgeInsets.all(20.0),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.grey.shade50,
                  border: Border(
                    top: BorderSide(
                      color: isDark ? Colors.white12 : Colors.grey.shade200,
                    ),
                  ),
                ),
                child: SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0284C7),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 2,
                    ),
                    onPressed: () {
                      setState(() {
                        _acceptTerms = true;
                      });
                      Navigator.pop(ctx);
                    },
                    child: Text(
                      'I Understand & Accept',
                      style: GoogleFonts.outfit(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTermsSection({
    required IconData icon,
    required String title,
    required String desc,
    required bool isDark,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isDark ? Colors.white.withValues(alpha: 0.06) : const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 20, color: const Color(0xFF0284C7)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white : const Color(0xFF0F2742),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  desc,
                  style: GoogleFonts.outfit(
                    fontSize: 12.5,
                    color: isDark ? Colors.grey.shade400 : const Color(0xFF64748B),
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_rounded,
            color: isDark ? Colors.white : const Color(0xFF0F2742),
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: TextButton.icon(
              onPressed: _continueAsGuest,
              icon: Text(
                'Guest',
                style: GoogleFonts.outfit(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF075C2A),
                ),
              ),
              label: const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: Color(0xFF075C2A)),
              style: TextButton.styleFrom(
                backgroundColor: const Color(0xFFE8F7EE),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Brand Cow Logo + Tagline
                Center(
                  child: Column(
                    children: [
                      Container(
                        constraints: const BoxConstraints(maxHeight: 120, maxWidth: 120),
                        padding: const EdgeInsets.all(4),
                        child: Image.asset(
                          'assets/images/cowLogo.png',
                          fit: BoxFit.contain,
                          filterQuality: FilterQuality.high,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Farm-fresh milk & daily needs delivered to your door',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.outfit(
                          fontSize: 12.5,
                          color: isDark ? Colors.grey.shade400 : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Create Account Header
                Text(
                  'Create an Account 🚀',
                  style: GoogleFonts.outfit(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: isDark ? Colors.white : const Color(0xFF0F2742),
                    letterSpacing: -0.4,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Join Natural Milk Dairy for farm-fresh dairy delivered daily',
                  style: GoogleFonts.outfit(
                    fontSize: 13,
                    color: isDark ? Colors.grey.shade400 : const Color(0xFF64748B),
                  ),
                ),
                const SizedBox(height: 20),

                // Form Card Container
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(
                      color: isDark ? Colors.white10 : Colors.grey.shade200,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.04),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      // User Name
                      CustomInput(
                        label: 'User Name',
                        hint: 'e.g. John Doe',
                        prefixIcon: Icons.person_outline_rounded,
                        controller: _usernameController,
                        keyboardType: TextInputType.name,
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) return 'Please enter your name / username';
                          return null;
                        },
                      ),
                      const SizedBox(height: 14),

                      // Mobile Number
                      CustomInput(
                        label: 'Mobile Number',
                        hint: '10-digit mobile number',
                        prefixIcon: Icons.phone_outlined,
                        controller: _mobileController,
                        keyboardType: TextInputType.phone,
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) return 'Please enter mobile number';
                          final clean = val.replaceAll(RegExp(r'\D'), '');
                          if (clean.length != 10) return 'Please enter a valid 10-digit mobile number';
                          return null;
                        },
                      ),
                      const SizedBox(height: 14),

                      // Email Address
                      CustomInput(
                        label: 'Email Address',
                        hint: 'name@example.com',
                        prefixIcon: Icons.email_outlined,
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        validator: (val) {
                          if (val == null || val.trim().isEmpty) return 'Please enter your email';
                          if (!val.contains('@')) return 'Enter a valid email address';
                          return null;
                        },
                      ),
                      const SizedBox(height: 14),

                      // Password
                      CustomInput(
                        label: 'Password',
                        hint: 'At least 8 chars with a number',
                        prefixIcon: Icons.lock_outline_rounded,
                        controller: _passwordController,
                        isPassword: true,
                        validator: (val) {
                          if (val == null || val.isEmpty) return 'Please enter password';
                          if (val.length < 8) return 'Password must be at least 8 characters';
                          if (!RegExp(r'\d').hasMatch(val)) return 'Password must contain at least 1 number';
                          return null;
                        },
                      ),
                      const SizedBox(height: 14),

                      // Confirm Password
                      CustomInput(
                        label: 'Confirm Password',
                        hint: 'Re-enter your password',
                        prefixIcon: Icons.lock_outline_rounded,
                        controller: _confirmPasswordController,
                        isPassword: true,
                        validator: (val) {
                          if (val == null || val.isEmpty) return 'Please confirm password';
                          if (val != _passwordController.text) return 'Passwords do not match';
                          return null;
                        },
                      ),
                      const SizedBox(height: 10),

                      // Password Rule Guidance Note
                      Row(
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: Color(0xFF0284C7),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Must be at least 8 characters and contain at least 1 number',
                              style: GoogleFonts.outfit(
                                fontSize: 11.5,
                                color: isDark ? Colors.grey.shade400 : const Color(0xFF64748B),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      // Terms and Conditions Checklist Box
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 22,
                            child: Checkbox(
                              value: _acceptTerms,
                              activeColor: const Color(0xFF0284C7),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(4),
                              ),
                              side: BorderSide(
                                color: isDark ? Colors.white38 : const Color(0xFFCBD5E1),
                                width: 1.5,
                              ),
                              onChanged: (val) {
                                setState(() {
                                  _acceptTerms = val ?? true;
                                });
                              },
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: GestureDetector(
                              onTap: () => _showTermsModal(context),
                              child: Text.rich(
                                TextSpan(
                                  style: GoogleFonts.outfit(
                                    fontSize: 12.5,
                                    color: isDark ? Colors.grey.shade400 : const Color(0xFF64748B),
                                    height: 1.35,
                                  ),
                                  children: [
                                    const TextSpan(text: 'I agree to the '),
                                    TextSpan(
                                      text: 'Terms & Conditions',
                                      style: GoogleFonts.outfit(
                                        fontWeight: FontWeight.w700,
                                        color: const Color(0xFF0284C7),
                                        decoration: TextDecoration.underline,
                                      ),
                                    ),
                                    const TextSpan(text: ' and '),
                                    TextSpan(
                                      text: 'Privacy Policy',
                                      style: GoogleFonts.outfit(
                                        fontWeight: FontWeight.w700,
                                        color: const Color(0xFF0284C7),
                                        decoration: TextDecoration.underline,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Create Account Button (Pill Gradient matching Home Profile)
                      GestureDetector(
                        onTap: authProvider.isLoading ? null : _handleRegister,
                        child: Container(
                          width: double.infinity,
                          height: 48,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(30),
                            gradient: LinearGradient(
                              colors: isDark
                                  ? [
                                      const Color(0xFF1E293B),
                                      const Color(0xFF0F2742),
                                    ]
                                  : [
                                      const Color(0xFFE0F2FE),
                                      const Color(0xFFF0F9FF),
                                      const Color(0xFFEBF4FF),
                                    ],
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                            ),
                            border: Border.all(
                              color: isDark
                                  ? const Color(0xFF0284C7).withValues(alpha: 0.5)
                                  : const Color(0xFFBAE6FD),
                              width: 1.2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF0284C7).withValues(alpha: isDark ? 0.2 : 0.12),
                                blurRadius: 16,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Center(
                            child: authProvider.isLoading
                                ? const SpinKitThreeBounce(
                                    color: Color(0xFF0284C7),
                                    size: 20,
                                  )
                                : Text(
                                    'Create Account',
                                    style: GoogleFonts.outfit(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w900,
                                      color: const Color(0xFF0284C7),
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 18),

                // Sign In Link Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Already have an account? ',
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: isDark ? Colors.grey.shade400 : const Color(0xFF64748B),
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(builder: (_) => const LoginScreen()),
                        );
                      },
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Sign In',
                            style: GoogleFonts.outfit(
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFF0284C7),
                            ),
                          ),
                          const SizedBox(width: 2),
                          const Icon(
                            Icons.chevron_right_rounded,
                            size: 16,
                            color: Color(0xFF0284C7),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
