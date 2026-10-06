import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
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
  Timer? _timeoutTimer;

  // Candidate connection URLs ordered by likelihood
  static const String _primaryLanUrl = 'http://192.168.1.39:5173';
  static final List<String> _candidateUrls = [
    _primaryLanUrl,
    'http://10.0.2.2:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
  ];

  int _candidateIndex = 0;
  late String _currentUrl;

  @override
  void initState() {
    super.initState();
    _currentUrl = widget.initialUrl ?? _candidateUrls[0];
    _initPreferencesAndLoad();
  }

  Future<void> _initPreferencesAndLoad() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedUrl = prefs.getString('working_web_url') ?? prefs.getString('custom_web_url');
      if (savedUrl != null && savedUrl.isNotEmpty && widget.initialUrl == null) {
        if (!_candidateUrls.contains(savedUrl)) {
          _candidateUrls.insert(0, savedUrl);
        } else {
          _candidateUrls.remove(savedUrl);
          _candidateUrls.insert(0, savedUrl);
        }
        _currentUrl = savedUrl;
      }
    } catch (_) {}

    if (mounted) {
      _initWebView();
      _startTimeoutTimer();
    }
  }

  @override
  void dispose() {
    _timeoutTimer?.cancel();
    super.dispose();
  }

  void _startTimeoutTimer() {
    _timeoutTimer?.cancel();
    // 7 seconds gives Vite dev server ample time to transform and send modules
    _timeoutTimer = Timer(const Duration(milliseconds: 7000), () {
      if (mounted && _isLoading && !_hasError) {
        _tryNextCandidateOrShowError();
      }
    });
  }

  void _tryNextCandidateOrShowError() {
    if (_candidateIndex + 1 < _candidateUrls.length) {
      _candidateIndex++;
      _loadSpecificUrl(_candidateUrls[_candidateIndex]);
    } else {
      if (mounted) {
        setState(() {
          _hasError = true;
          _isLoading = false;
        });
      }
    }
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
            if (mounted && progress >= 90) {
              setState(() {
                _isLoading = false;
                _hasError = false;
                _timeoutTimer?.cancel();
              });
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
              });
              // Persist confirmed responsive URL for next launch
              SharedPreferences.getInstance().then((prefs) {
                prefs.setString('working_web_url', _currentUrl);
              });
            }
          },
          onWebResourceError: (WebResourceError error) {
            if (error.isForMainFrame ?? true) {
              _timeoutTimer?.cancel();
              if (mounted) {
                _tryNextCandidateOrShowError();
              }
            }
          },
        ),
      )
      ..loadRequest(Uri.parse(_currentUrl));
  }

  void _loadSpecificUrl(String url) {
    _timeoutTimer?.cancel();
    if (mounted) {
      setState(() {
        _currentUrl = url;
        _hasError = false;
        _isLoading = true;
      });
    }
    _startTimeoutTimer();
    _controller.loadRequest(Uri.parse(url));
  }

  Future<void> _reload() async {
    setState(() {
      _hasError = false;
      _isLoading = true;
      _candidateIndex = 0;
    });
    _loadSpecificUrl(_candidateUrls[0]);
  }

  void _showConfigureHostDialog() {
    final TextEditingController hostController = TextEditingController(text: _currentUrl);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Configure Server URL',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Enter your local machine IP or dev server URL:',
              style: GoogleFonts.outfit(fontSize: 13, color: const Color(0xFF64748B)),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: hostController,
              decoration: InputDecoration(
                hintText: 'e.g. http://192.168.1.39:5173',
                filled: true,
                fillColor: const Color(0xFFF8FAFC),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
              style: GoogleFonts.outfit(fontSize: 14),
            ),
            const SizedBox(height: 14),
            Text(
              'Quick Select:',
              style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: const Color(0xFF475569)),
            ),
            const SizedBox(height: 6),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                _buildQuickChip('Wi-Fi LAN', 'http://192.168.1.39:5173', hostController),
                _buildQuickChip('Emulator', 'http://10.0.2.2:5173', hostController),
                _buildQuickChip('USB / Local', 'http://127.0.0.1:5173', hostController),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: GoogleFonts.outfit(fontWeight: FontWeight.w600)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6C5CE7),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
              final newUrl = hostController.text.trim();
              if (newUrl.isNotEmpty) {
                final prefs = await SharedPreferences.getInstance();
                await prefs.setString('custom_web_url', newUrl);
                await prefs.setString('working_web_url', newUrl);
                if (ctx.mounted) Navigator.pop(ctx);
                _candidateUrls.remove(newUrl);
                _candidateUrls.insert(0, newUrl);
                _candidateIndex = 0;
                _loadSpecificUrl(newUrl);
              }
            },
            child: Text('Save & Connect', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickChip(String label, String url, TextEditingController controller) {
    return ActionChip(
      label: Text(label, style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w600)),
      backgroundColor: const Color(0xFFF1F5F9),
      onPressed: () {
        controller.text = url;
      },
    );
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

                // Clean Brand Loading Screen
                if (_isLoading && !_hasError)
                  Positioned.fill(
                    child: Container(
                      color: Colors.white,
                      child: Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 130,
                              height: 130,
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: const Color(0xFF6C5CE7).withValues(alpha: 0.08),
                              ),
                              child: Image.asset(
                                'assets/images/cowLogo.png',
                                fit: BoxFit.contain,
                                filterQuality: FilterQuality.high,
                                errorBuilder: (_, __, ___) => const Icon(
                                  Icons.eco_rounded,
                                  size: 60,
                                  color: Color(0xFF6C5CE7),
                                ),
                              ),
                            ),
                            const SizedBox(height: 22),
                            const SizedBox(
                              width: 32,
                              height: 32,
                              child: CircularProgressIndicator(
                                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF6C5CE7)),
                                strokeWidth: 3,
                              ),
                            ),
                            const SizedBox(height: 18),
                            Text(
                              'Madhu Dairy',
                              style: GoogleFonts.outfit(
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFF0F2742),
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Opening Fresh Storefront...',
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

                // Clean Customer-Friendly Offline/Error Screen with auto-retry and configure option
                if (_hasError)
                  Positioned.fill(
                    child: Container(
                      color: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 28.0),
                      child: Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                color: const Color(0xFF6C5CE7).withValues(alpha: 0.12),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.wifi_off_rounded,
                                size: 40,
                                color: Color(0xFF6C5CE7),
                              ),
                            ),
                            const SizedBox(height: 20),
                            Text(
                              'Unable to Open Page',
                              style: GoogleFonts.outfit(
                                fontSize: 21,
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFF0F2742),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Could not connect to the local store server.\nMake sure the dev server is active on your Wi-Fi network.',
                              textAlign: TextAlign.center,
                              style: GoogleFonts.outfit(
                                fontSize: 13.5,
                                color: const Color(0xFF64748B),
                                height: 1.4,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                _currentUrl,
                                style: GoogleFonts.jetBrainsMono(
                                  fontSize: 11,
                                  color: const Color(0xFF475569),
                                ),
                              ),
                            ),
                            const SizedBox(height: 24),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                SizedBox(
                                  height: 44,
                                  child: ElevatedButton.icon(
                                    onPressed: _reload,
                                    icon: const Icon(Icons.refresh_rounded, size: 18),
                                    label: Text(
                                      'Retry Now',
                                      style: GoogleFonts.outfit(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF6C5CE7),
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      elevation: 2,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                SizedBox(
                                  height: 44,
                                  child: OutlinedButton.icon(
                                    onPressed: _showConfigureHostDialog,
                                    icon: const Icon(Icons.settings_rounded, size: 18),
                                    label: Text(
                                      'Edit IP',
                                      style: GoogleFonts.outfit(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: const Color(0xFF6C5CE7),
                                      ),
                                    ),
                                    style: OutlinedButton.styleFrom(
                                      side: const BorderSide(color: Color(0xFF6C5CE7)),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
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
