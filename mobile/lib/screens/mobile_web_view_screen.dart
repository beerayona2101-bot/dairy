import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../providers/auth_provider.dart';
import 'onboarding_screen.dart';

class MobileWebViewScreen extends StatefulWidget {
  final String? initialUrl;

  const MobileWebViewScreen({super.key, this.initialUrl});

  @override
  State<MobileWebViewScreen> createState() => _MobileWebViewScreenState();
}

class _MobileWebViewScreenState extends State<MobileWebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _hasError = false;
  bool _triedFallback = false;
  Timer? _timeoutTimer;

  // Candidate connection URLs (managed silently behind the scenes)
  static const String _wifiUrl = 'http://192.168.1.46:5173';
  static const String _usbUrl = 'http://127.0.0.1:5173';
  late String _currentUrl;

  @override
  void initState() {
    super.initState();
    _currentUrl = widget.initialUrl ?? _wifiUrl;
    _initWebView();
    _startTimeoutTimer();
  }

  @override
  void dispose() {
    _timeoutTimer?.cancel();
    super.dispose();
  }

  void _startTimeoutTimer() {
    _timeoutTimer?.cancel();
    _timeoutTimer = Timer(const Duration(milliseconds: 2500), () {
      if (mounted && _isLoading && !_hasError) {
        if (!_triedFallback) {
          _triedFallback = true;
          final nextUrl = (_currentUrl == _wifiUrl) ? _usbUrl : _wifiUrl;
          _loadSpecificUrl(nextUrl);
        } else {
          setState(() {
            _hasError = true;
            _isLoading = false;
          });
        }
      }
    });
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..enableZoom(false)
      ..setBackgroundColor(Colors.white)
      ..addJavaScriptChannel(
        'FlutterAuthBridge',
        onMessageReceived: (JavaScriptMessage message) async {
          if (message.message == 'logout') {
            final auth = Provider.of<AuthProvider>(context, listen: false);
            await auth.logout();
            if (mounted) {
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const OnboardingScreen()),
                (route) => false,
              );
            }
          }
        },
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            if (mounted) {
              if (progress >= 95) {
                setState(() {
                  _isLoading = false;
                  _timeoutTimer?.cancel();
                });
              }
            }
          },
          onPageStarted: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = true;
                _hasError = false;
              });
              _startTimeoutTimer();
            }
          },
          onPageFinished: (String url) {
            _timeoutTimer?.cancel();
            if (mounted) {
              setState(() {
                _isLoading = false;
                _hasError = false;
                _triedFallback = false;
              });
            }
          },
          onWebResourceError: (WebResourceError error) {
            if (error.isForMainFrame ?? true) {
              _timeoutTimer?.cancel();
              if (mounted) {
                // Auto-try fallback silently if first candidate fails
                if (!_triedFallback) {
                  _triedFallback = true;
                  final nextUrl = (_currentUrl == _usbUrl) ? _wifiUrl : _usbUrl;
                  _loadSpecificUrl(nextUrl);
                  return;
                }

                setState(() {
                  _hasError = true;
                  _isLoading = false;
                });
              }
            }
          },
        ),
      )
      ..loadRequest(Uri.parse(_currentUrl));
  }

  void _loadSpecificUrl(String url) {
    _timeoutTimer?.cancel();
    setState(() {
      _currentUrl = url;
      _hasError = false;
      _isLoading = true;
    });
    _startTimeoutTimer();
    _controller.loadRequest(Uri.parse(url));
  }

  Future<void> _reload() async {
    setState(() {
      _hasError = false;
      _isLoading = true;
      _triedFallback = false;
    });
    final nextUrl = (_currentUrl == _wifiUrl) ? _usbUrl : _wifiUrl;
    _loadSpecificUrl(nextUrl);
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        systemNavigationBarColor: Colors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, result) async {
          if (didPop) return;
          if (await _controller.canGoBack()) {
            await _controller.goBack();
          } else {
            if (context.mounted) {
              SystemNavigator.pop();
            }
          }
        },
        child: Scaffold(
          backgroundColor: Colors.white,
          body: SafeArea(
            child: Stack(
              children: [
                // Render WebView
                if (!_hasError)
                  Positioned.fill(
                    child: WebViewWidget(
                      controller: _controller,
                      gestureRecognizers: <Factory<OneSequenceGestureRecognizer>>{
                        Factory<OneSequenceGestureRecognizer>(
                          () => EagerGestureRecognizer(),
                        ),
                      },
                    ),
                  ),

                // Clean Brand Loading Screen (Zero backend URLs, IPs, or ports)
                if (_isLoading && !_hasError)
                  Positioned.fill(
                    child: Container(
                      color: Colors.white,
                      child: Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // Brand Logo with Soft Glow
                            Container(
                              width: 130,
                              height: 130,
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: const Color(0xFF0284C7).withValues(alpha: 0.08),
                              ),
                              child: Image.asset(
                                'assets/images/cowLogo.png',
                                fit: BoxFit.contain,
                                filterQuality: FilterQuality.high,
                              ),
                            ),
                            const SizedBox(height: 22),
                            const SizedBox(
                              width: 32,
                              height: 32,
                              child: CircularProgressIndicator(
                                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0284C7)),
                                strokeWidth: 3,
                              ),
                            ),
                                const SizedBox(height: 18),
                                Text(
                                  'Madhu Dairy',
                                  style: GoogleFonts.outfit(
                                    fontSize: 19,
                                    fontWeight: FontWeight.w800,
                                    color: const Color(0xFF0F2742),
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'Delivering Farm Purity Daily...',
                                  style: GoogleFonts.outfit(
                                    fontSize: 13.5,
                                    fontWeight: FontWeight.w500,
                                    color: const Color(0xFF64748B),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),

                // Clean Customer-Friendly Offline/Error Screen (Zero backend details)
                if (_hasError)
                  Positioned.fill(
                    child: Container(
                      color: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 32.0),
                      child: Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withValues(alpha: 0.12),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.cloud_off_rounded,
                                size: 40,
                                color: Color(0xFF10B981),
                              ),
                            ),
                            const SizedBox(height: 22),
                            Text(
                              'Unable to Connect',
                              style: GoogleFonts.outfit(
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFF0F2742),
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              'Please check your network connection and try again.',
                              textAlign: TextAlign.center,
                              style: GoogleFonts.outfit(
                                fontSize: 13.5,
                                color: const Color(0xFF64748B),
                                height: 1.4,
                              ),
                            ),
                            const SizedBox(height: 26),
                            SizedBox(
                              width: 170,
                              height: 46,
                              child: ElevatedButton.icon(
                                onPressed: _reload,
                                icon: const Icon(Icons.refresh_rounded, size: 18),
                                label: Text(
                                  'Retry',
                                  style: GoogleFonts.outfit(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.3,
                                  ),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF10B981),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  elevation: 2,
                                ),
                              ),
                            ),
                          ],
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
  }
}
