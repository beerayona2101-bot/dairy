import 'dart:async';
import 'package:flutter/material.dart';
import '../config/app_theme.dart';
import '../services/auth_service.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_input.dart';
import 'login_screen.dart';

class ForgetScreen extends StatefulWidget {
  const ForgetScreen({super.key});

  @override
  State<ForgetScreen> createState() => _ForgetScreenState();
}

class _ForgetScreenState extends State<ForgetScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController();

  bool _otpSent = false;
  bool _isLoading = false;
  int _resendCountdown = 60;
  Timer? _timer;

  @override
  void dispose() {
    _emailController.dispose();
    _otpController.dispose();
    _newPasswordController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _resendCountdown = 60;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendCountdown > 0) {
        setState(() {
          _resendCountdown--;
        });
      } else {
        _timer?.cancel();
      }
    });
  }

  Future<void> _handleSendOtp() async {
    if (_emailController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your email or phone number')),
      );
      return;
    }

    setState(() => _isLoading = true);
    final res = await AuthService.sendOtp(_emailController.text.trim(), '492015');
    setState(() => _isLoading = false);

    if (!mounted) return;

    if (res['success'] == true) {
      setState(() => _otpSent = true);
      _startTimer();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message'] ?? 'OTP sent successfully to your inbox!'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message'] ?? 'Failed to send OTP.'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  Future<void> _handleResetPassword() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    final res = await AuthService.verifyOtp(
      _emailController.text.trim(),
      _newPasswordController.text.trim(),
      _otpController.text.trim(),
    );
    setState(() => _isLoading = false);

    if (!mounted) return;

    if (res['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🎉 Password Reset Successfully! Please log in.'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message'] ?? 'Password reset failed.'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Forgot Password'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Account Recovery 🔐',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: isDark ? Colors.white : AppTheme.textDark,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Enter your registered email address or phone number to receive your OTP verification code.',
                  style: TextStyle(
                    fontSize: 13,
                    height: 1.4,
                    color: isDark ? Colors.grey.shade400 : AppTheme.textMuted,
                  ),
                ),
                const SizedBox(height: 28),

                // Email Field
                CustomInput(
                  label: 'Email / Phone',
                  hint: 'Enter registered email or mobile',
                  prefixIcon: Icons.contact_mail_outlined,
                  controller: _emailController,
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) return 'Enter email or phone';
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                if (!_otpSent) ...[
                  CustomButton(
                    text: 'Send Verification OTP',
                    isLoading: _isLoading,
                    onPressed: _handleSendOtp,
                  ),
                ] else ...[
                  // OTP Code Input
                  CustomInput(
                    label: 'Verification OTP',
                    hint: 'Enter 6-digit OTP code',
                    prefixIcon: Icons.pin_outlined,
                    controller: _otpController,
                    keyboardType: TextInputType.number,
                    validator: (val) {
                      if (val == null || val.trim().isEmpty) return 'Enter OTP code';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // New Password Input
                  CustomInput(
                    label: 'New Password',
                    hint: 'Enter your new password',
                    prefixIcon: Icons.lock_outline,
                    controller: _newPasswordController,
                    isPassword: true,
                    validator: (val) {
                      if (val == null || val.isEmpty) return 'Enter new password';
                      if (val.length < 6) return 'Min 6 characters';
                      return null;
                    },
                  ),
                  const SizedBox(height: 8),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _resendCountdown > 0
                            ? 'Resend OTP in ${_resendCountdown}s'
                            : 'Didn\'t receive OTP?',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                        ),
                      ),
                      if (_resendCountdown == 0)
                        TextButton(
                          onPressed: _handleSendOtp,
                          child: const Text('Resend OTP'),
                        ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  CustomButton(
                    text: 'Reset & Login',
                    isLoading: _isLoading,
                    onPressed: _handleResetPassword,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
