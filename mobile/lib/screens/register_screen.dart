import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../providers/auth_provider.dart';
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
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _mobileController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_acceptTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please accept the Terms & Conditions to register.'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.signup(
      email: _emailController.text.trim(),
      password: _passwordController.text.trim(),
      confirmPassword: _confirmPasswordController.text.trim(),
      username: _usernameController.text.trim(),
      mobileNo: _mobileController.text.trim(),
    );

    if (!mounted) return;

    if (success) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('is_guest_user', false);
      await prefs.setBool('has_completed_onboarding', true);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🎉 Welcome! Account created successfully.'),
          backgroundColor: Color(0xFF10B981),
          duration: Duration(seconds: 3),
        ),
      );
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (_) => const MobileWebViewScreen(
            initialUrl: ApiConfig.productionServerUrl,
            destinationPath: '/user-profile',
          ),
        ),
        (route) => false,
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.errorMessage ?? 'Registration Failed'),
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
        pageBuilder: (context, anim, secAnim) => const MobileWebViewScreen(
          initialUrl: ApiConfig.productionServerUrl,
        ),
        transitionsBuilder: (context, animation, secAnim, child) =>
            FadeTransition(opacity: animation, child: child),
        transitionDuration: const Duration(milliseconds: 400),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              physics: const ClampingScrollPhysics(),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // 1. Top Bar: Back Button (Circle) & Guest > Pill
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            GestureDetector(
                              onTap: () => Navigator.of(context).pop(),
                              child: Container(
                                width: 34,
                                height: 34,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: const Color(0xFFF1F5F9),
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                ),
                                child: const Icon(
                                  Icons.arrow_back_rounded,
                                  size: 18,
                                  color: Color(0xFF075C2A),
                                ),
                              ),
                            ),
                            GestureDetector(
                              onTap: _continueAsGuest,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(20),
                                  color: Colors.white,
                                  border: Border.all(color: const Color(0xFF86EFAC)),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      'Guest',
                                      style: GoogleFonts.outfit(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w800,
                                        color: const Color(0xFF075C2A),
                                      ),
                                    ),
                                    const SizedBox(width: 3),
                                    const Icon(
                                      Icons.arrow_forward_ios_rounded,
                                      size: 10,
                                      color: Color(0xFF075C2A),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 6),

                        // 2. Brand Emblem Logo & Subtitle
                        Center(
                          child: Column(
                            children: [
                              Image.asset(
                                'assets/images/logoLightMode.png',
                                height: 58,
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) => Image.asset(
                                  'assets/images/cowLogo.png',
                                  height: 58,
                                  fit: BoxFit.contain,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                'Farm-fresh milk & daily needs delivered to your door',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.outfit(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                  color: const Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 10),

                        // 3. Title & Subtitle (Left-aligned)
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Create an Account 🚀',
                              style: GoogleFonts.outfit(
                                fontSize: 21,
                                fontWeight: FontWeight.w900,
                                color: const Color(0xFF0F2742),
                                letterSpacing: -0.3,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Join Natural Milk Dairy for farm-fresh dairy delivered daily',
                              style: GoogleFonts.outfit(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w500,
                                color: const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 8),

                        // 4. White Rounded Card Container with 5 Fields
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(22),
                            border: Border.all(color: const Color(0xFFF1F5F9)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.04),
                                blurRadius: 14,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // 1. User Name
                              _buildInputField(
                                label: 'User Name',
                                hint: 'e.g. John Doe',
                                prefixIcon: Icons.person_outline_rounded,
                                controller: _usernameController,
                                validator: (val) {
                                  if (val == null || val.trim().isEmpty) return 'Please enter your name';
                                  return null;
                                },
                              ),
                              const SizedBox(height: 7),

                              // 2. Mobile Number
                              _buildInputField(
                                label: 'Mobile Number',
                                hint: '10-digit mobile',
                                prefixIcon: Icons.phone_outlined,
                                controller: _mobileController,
                                keyboardType: TextInputType.phone,
                                validator: (val) {
                                  if (val == null || val.trim().isEmpty) return 'Please enter mobile number';
                                  final clean = val.replaceAll(RegExp(r'\D'), '');
                                  if (clean.length != 10) return 'Must be 10 digits';
                                  return null;
                                },
                              ),
                              const SizedBox(height: 7),

                              // 3. Email Address
                              _buildInputField(
                                label: 'Email Address',
                                hint: 'name@example.com',
                                prefixIcon: Icons.mail_outline_rounded,
                                controller: _emailController,
                                keyboardType: TextInputType.emailAddress,
                                validator: (val) {
                                  if (val == null || val.trim().isEmpty) return 'Please enter email';
                                  if (!val.contains('@')) return 'Enter a valid email';
                                  return null;
                                },
                              ),
                              const SizedBox(height: 7),

                              // 4. Password
                              _buildInputField(
                                label: 'Password',
                                hint: 'At least 8 chars',
                                prefixIcon: Icons.lock_outline_rounded,
                                controller: _passwordController,
                                isPassword: true,
                                obscureText: _obscurePassword,
                                onToggleObscure: () {
                                  setState(() => _obscurePassword = !_obscurePassword);
                                },
                                validator: (val) {
                                  if (val == null || val.isEmpty) return 'Please enter password';
                                  if (val.length < 8) return 'Minimum 8 characters';
                                  if (!val.contains(RegExp(r'\d'))) return 'Must contain at least 1 number';
                                  return null;
                                },
                              ),
                              const SizedBox(height: 7),

                              // 5. Confirm Password
                              _buildInputField(
                                label: 'Confirm Password',
                                hint: 'Re-enter password',
                                prefixIcon: Icons.lock_outline_rounded,
                                controller: _confirmPasswordController,
                                isPassword: true,
                                obscureText: _obscureConfirmPassword,
                                onToggleObscure: () {
                                  setState(() => _obscureConfirmPassword = !_obscureConfirmPassword);
                                },
                                validator: (val) {
                                  if (val == null || val.isEmpty) return 'Please confirm password';
                                  if (val != _passwordController.text) return 'Passwords do not match';
                                  return null;
                                },
                              ),
                              const SizedBox(height: 6),

                              // Password rule bullet
                              Row(
                                children: [
                                  Container(
                                    width: 5,
                                    height: 5,
                                    decoration: const BoxDecoration(
                                      color: Color(0xFF0284C7),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    'Must be at least 8 characters and contain at least 1 number',
                                    style: GoogleFonts.outfit(
                                      fontSize: 10.5,
                                      fontWeight: FontWeight.w500,
                                      color: const Color(0xFF64748B),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),

                              // Terms & Conditions Checkbox
                              Row(
                                children: [
                                  SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: Checkbox(
                                      value: _acceptTerms,
                                      activeColor: const Color(0xFF0284C7),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                                      side: const BorderSide(color: Color(0xFFCBD5E1), width: 1.3),
                                      onChanged: (val) {
                                        setState(() => _acceptTerms = val ?? true);
                                      },
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: RichText(
                                      text: TextSpan(
                                        style: GoogleFonts.outfit(
                                          fontSize: 10.5,
                                          color: const Color(0xFF64748B),
                                        ),
                                        children: const [
                                          TextSpan(text: 'I agree to the '),
                                          TextSpan(
                                            text: 'Terms & Conditions',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF0284C7),
                                            ),
                                          ),
                                          TextSpan(text: ' and '),
                                          TextSpan(
                                            text: 'Privacy Policy',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF0284C7),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),

                              // Create Account Button (Soft sky blue pill)
                              SizedBox(
                                width: double.infinity,
                                height: 44,
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(25),
                                    gradient: const LinearGradient(
                                      colors: [Color(0xFFE0F2FE), Color(0xFFEBF5FF)],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    border: Border.all(color: const Color(0xFFBAE6FD)),
                                    boxShadow: [
                                      BoxShadow(
                                        color: const Color(0xFF0284C7).withValues(alpha: 0.12),
                                        blurRadius: 10,
                                        offset: const Offset(0, 3),
                                      ),
                                    ],
                                  ),
                                  child: Material(
                                    color: Colors.transparent,
                                    child: InkWell(
                                      borderRadius: BorderRadius.circular(25),
                                      onTap: authProvider.isLoading ? null : _handleRegister,
                                      child: Center(
                                        child: authProvider.isLoading
                                            ? const SizedBox(
                                                width: 18,
                                                height: 18,
                                                child: CircularProgressIndicator(
                                                  strokeWidth: 2,
                                                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0284C7)),
                                                ),
                                              )
                                            : Text(
                                                'Create Account',
                                                style: GoogleFonts.outfit(
                                                  fontSize: 13.5,
                                                  fontWeight: FontWeight.w800,
                                                  color: const Color(0xFF0284C7),
                                                  letterSpacing: 0.2,
                                                ),
                                              ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 8),

                        // 5. Footer: Already have an account? Sign In >
                        Padding(
                          padding: const EdgeInsets.only(bottom: 6.0),
                          child: Center(
                            child: GestureDetector(
                              onTap: () {
                                Navigator.of(context).pushReplacement(
                                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                                );
                              },
                              child: RichText(
                                text: TextSpan(
                                  style: GoogleFonts.outfit(
                                    fontSize: 11.5,
                                    color: const Color(0xFF64748B),
                                  ),
                                  children: const [
                                    TextSpan(text: 'Already have an account? '),
                                    TextSpan(
                                      text: 'Sign In >',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w800,
                                        color: Color(0xFF0284C7),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildInputField({
    required String label,
    required String hint,
    required IconData prefixIcon,
    required TextEditingController controller,
    bool isPassword = false,
    bool obscureText = false,
    VoidCallback? onToggleObscure,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF1E293B),
          ),
        ),
        const SizedBox(height: 3),
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          validator: validator,
          style: GoogleFonts.outfit(
            fontSize: 12.5,
            fontWeight: FontWeight.w500,
            color: const Color(0xFF0F2742),
          ),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: GoogleFonts.outfit(
              fontSize: 12,
              color: const Color(0xFF94A3B8),
              fontWeight: FontWeight.w400,
            ),
            prefixIcon: Icon(
              prefixIcon,
              size: 16,
              color: const Color(0xFF94A3B8),
            ),
            suffixIcon: isPassword
                ? GestureDetector(
                    onTap: onToggleObscure,
                    child: Icon(
                      obscureText
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      size: 17,
                      color: const Color(0xFF94A3B8),
                    ),
                  )
                : null,
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8.5),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF0284C7), width: 1.5),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.redAccent),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.redAccent, width: 1.5),
            ),
            errorStyle: GoogleFonts.outfit(fontSize: 9.5, height: 0.7),
          ),
        ),
      ],
    );
  }
}
