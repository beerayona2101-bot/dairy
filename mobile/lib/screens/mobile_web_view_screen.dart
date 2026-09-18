import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../config/app_theme.dart';

class MobileWebViewScreen extends StatefulWidget {
  final String? initialUrl;

  const MobileWebViewScreen({super.key, this.initialUrl});

  @override
  State<MobileWebViewScreen> createState() => _MobileWebViewScreenState();
}

class _MobileWebViewScreenState extends State<MobileWebViewScreen> {
  late final WebViewController _controller;
  int _loadingProgress = 0;
  bool _isLoading = true;
  bool _hasError = false;
  String _errorMessage = '';
  bool _triedFallback = false;

  // Primary URLs
  static const String _wifiUrl = 'http://192.168.1.46:5173';
  static const String _usbUrl = 'http://127.0.0.1:5173';
  late String _currentUrl;
  final TextEditingController _customUrlController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _currentUrl = widget.initialUrl ?? _usbUrl;
    _customUrlController.text = _currentUrl;
    _initWebView();
  }

  @override
  void dispose() {
    _customUrlController.dispose();
    super.dispose();
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..enableZoom(false)
      ..setBackgroundColor(const Color(0xFFF9FAFB))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            if (mounted) {
              setState(() {
                _loadingProgress = progress;
                if (progress == 100) {
                  _isLoading = false;
                }
              });
            }
          },
          onPageStarted: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = true;
                _hasError = false;
              });
            }
          },
          onPageFinished: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = false;
                _hasError = false;
                _triedFallback = false; // Reset fallback on successful load
              });
            }
          },
          onWebResourceError: (WebResourceError error) {
            if (error.isForMainFrame ?? true) {
              if (mounted) {
                // If the first URL failed and we haven't tried the alternative, auto-try it!
                if (!_triedFallback) {
                  _triedFallback = true;
                  final nextUrl = (_currentUrl == _usbUrl) ? _wifiUrl : _usbUrl;
                  setState(() {
                    _currentUrl = nextUrl;
                    _customUrlController.text = nextUrl;
                    _isLoading = true;
                  });
                  _controller.loadRequest(Uri.parse(nextUrl));
                  return;
                }

                setState(() {
                  _hasError = true;
                  _errorMessage = error.description;
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
    setState(() {
      _currentUrl = url;
      _customUrlController.text = url;
      _hasError = false;
      _isLoading = true;
      _triedFallback = true; // Manual selection: do not auto-override
    });
    _controller.loadRequest(Uri.parse(url));
  }

  Future<void> _reload() async {
    setState(() {
      _hasError = false;
      _isLoading = true;
    });
    await _controller.loadRequest(Uri.parse(_currentUrl));
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
          backgroundColor: const Color(0xFFF8FAFC),
          body: SafeArea(
            child: Stack(
              children: [
                // Render WebView only when no fatal main frame error
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

                // Linear progress indicator while loading
                if (_isLoading && !_hasError)
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    child: LinearProgressIndicator(
                      value: _loadingProgress > 0 ? _loadingProgress / 100 : null,
                      backgroundColor: Colors.transparent,
                      valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary),
                      minHeight: 3,
                    ),
                  ),

                // Connection helper screen
                if (_hasError)
                  Center(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(18),
                            decoration: BoxDecoration(
                              color: AppTheme.primary.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.wifi_off_rounded,
                              size: 50,
                              color: AppTheme.primary,
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Cannot Connect to Server',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textDark,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Target URL: $_currentUrl${_errorMessage.isNotEmpty ? "\nError: $_errorMessage" : ""}',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12,
                              fontFamily: 'monospace',
                              color: Colors.grey.shade700,
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Clear instructions card
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: Colors.grey.shade300,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.04),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'How to connect:',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                                const SizedBox(height: 8),
                                _buildInstructionRow(
                                  icon: Icons.wifi,
                                  title: 'Wi-Fi Mode:',
                                  desc: 'Turn on Wi-Fi on your phone (turn off Mobile Data). Phone and laptop must be on the same Wi-Fi.',
                                ),
                                const Divider(height: 16),
                                _buildInstructionRow(
                                  icon: Icons.usb,
                                  title: 'USB Mode:',
                                  desc: 'Keep USB cable plugged into your PC with USB Debugging enabled.',
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 20),

                          // Quick Action Buttons
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () => _loadSpecificUrl(_wifiUrl),
                                  icon: const Icon(Icons.wifi, size: 16),
                                  label: const Text('Wi-Fi Mode\n192.168.1.46', textAlign: TextAlign.center, style: TextStyle(fontSize: 11)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppTheme.primary,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: () => _loadSpecificUrl(_usbUrl),
                                  icon: const Icon(Icons.usb, size: 16),
                                  label: const Text('USB Mode\nlocalhost', textAlign: TextAlign.center, style: TextStyle(fontSize: 11)),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: AppTheme.primary,
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 14),

                          // Retry Button
                          SizedBox(
                            width: double.infinity,
                            child: TextButton.icon(
                              onPressed: _reload,
                              icon: const Icon(Icons.refresh_rounded, size: 18),
                              label: const Text('Retry Current Connection'),
                              style: TextButton.styleFrom(
                                foregroundColor: AppTheme.textDark,
                              ),
                            ),
                          ),
                        ],
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

  Widget _buildInstructionRow({
    required IconData icon,
    required String title,
    required String desc,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppTheme.primary),
        const SizedBox(width: 8),
        Expanded(
          child: RichText(
            text: TextSpan(
              style: const TextStyle(fontSize: 12, color: Color(0xFF334155), height: 1.3),
              children: [
                TextSpan(text: '$title ', style: const TextStyle(fontWeight: FontWeight.bold)),
                TextSpan(text: desc),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
