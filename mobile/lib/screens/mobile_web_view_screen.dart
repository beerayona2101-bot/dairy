import 'dart:async';
import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../config/api_config.dart';
import '../providers/auth_provider.dart';
import '../services/fcm_service.dart';
import 'onboarding_screen.dart';

class MobileWebViewScreen extends StatefulWidget {
  final String? initialUrl;

  const MobileWebViewScreen({super.key, this.initialUrl});

  @override
  State<MobileWebViewScreen> createState() => _MobileWebViewScreenState();
}

class _MobileWebViewScreenState extends State<MobileWebViewScreen> {
  WebViewController? _controller;
  bool _isLoading = true;
  bool _isFirstLoad = true;
  bool _hasError = false;
  Timer? _timeoutTimer;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;
  String _networkStatusText = 'Checking network...';

  static bool _isLoopbackUrl(String url) {
    if (kIsWeb) return false;
    final lower = url.toLowerCase();
    return lower.contains('localhost') || lower.contains('127.0.0.1') || lower.contains('10.0.2.2');
  }

  late List<String> _candidateUrls;
  int _candidateIndex = 0;
  late String _currentUrl;

  @override
  void initState() {
    super.initState();
    _candidateUrls = List<String>.from(ApiConfig.candidateServers.where((u) => !_isLoopbackUrl(u)));
    if (_candidateUrls.isEmpty) {
      _candidateUrls = [ApiConfig.productionServerUrl];
    }
    _currentUrl = widget.initialUrl ?? ApiConfig.baseUrl;

    _initWebView();
    _startTimeoutTimer();
    _initPreferencesAndLoad();
    _listenToNetworkTransitions();

    FcmService.onNotificationClick = (data) {
      if (!mounted || _controller == null) return;
      final type = data['type']?.toString();
      final orderId = data['orderId']?.toString();
      if (type == 'new_order' || (orderId != null && orderId.isNotEmpty)) {
        try {
          final target = Uri.parse(_currentUrl).resolve('/profile/orders').toString();
          _controller?.loadRequest(Uri.parse(target));
        } catch (_) {}
      }
    };
  }

  /// Actively monitors cellular mobile data <-> Wi-Fi transitions and heals drops
  void _listenToNetworkTransitions() {
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((List<ConnectivityResult> results) {
      final isConnected = results.any((r) => r != ConnectivityResult.none);
      final isMobile = results.contains(ConnectivityResult.mobile);
      final isWifi = results.contains(ConnectivityResult.wifi);

      if (mounted) {
        setState(() {
          if (isWifi) {
            _networkStatusText = 'Connected: Wi-Fi';
          } else if (isMobile) {
            _networkStatusText = 'Connected: Mobile Cellular (4G/5G)';
          } else if (isConnected) {
            _networkStatusText = 'Connected: Active Network';
          } else {
            _networkStatusText = 'No Internet Connection (Offline)';
          }
        });
      }

      // If switched to mobile cellular and current URL is private LAN, auto-switch to public URL!
      if (isMobile && ApiConfig.isPrivateLan(_currentUrl)) {
        debugPrint('[Network] Switched to mobile cellular while on private LAN. Auto-resolving public server...');
        _autoRecoverConnection();
      } else if (isConnected && _hasError) {
        debugPrint('[Network] Active connection restored ($results). Auto-recovering storefront...');
        _autoRecoverConnection();
      }
    });
  }

  Future<void> _autoRecoverConnection() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _hasError = false;
    });

    final working = await ApiConfig.resolveWorkingServer();
    if (mounted) {
      _loadSpecificUrl(working);
    }
  }

  Future<void> _initPreferencesAndLoad() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final customUrl = prefs.getString('custom_web_url');
      final savedUrl = prefs.getString('working_web_url');

      final connectivity = await Connectivity().checkConnectivity();
      final isCellular = connectivity.contains(ConnectivityResult.mobile);

      // If user manually configured a custom host in settings, honor it
      if (customUrl != null && customUrl.isNotEmpty && !_isLoopbackUrl(customUrl)) {
        if (!(isCellular && ApiConfig.isPrivateLan(customUrl))) {
          if (!_candidateUrls.contains(customUrl)) {
            _candidateUrls.insert(0, customUrl);
          }
          if (widget.initialUrl == null && customUrl != _currentUrl) {
            if (mounted) {
              _loadSpecificUrl(customUrl);
            }
          }
          return;
        }
      }

      // Ensure active baseUrl is prioritized
      final active = ApiConfig.baseUrl;
      if (!_isLoopbackUrl(active)) {
        if (_candidateUrls.contains(active)) {
          _candidateUrls.remove(active);
        }
        _candidateUrls.insert(0, active);
      }

      if (savedUrl != null && savedUrl.isNotEmpty && !_isLoopbackUrl(savedUrl)) {
        if (!(isCellular && ApiConfig.isPrivateLan(savedUrl))) {
          if (!_candidateUrls.contains(savedUrl)) {
            _candidateUrls.add(savedUrl);
          }
        }
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _timeoutTimer?.cancel();
    _connectivitySubscription?.cancel();
    super.dispose();
  }

  void _startTimeoutTimer() {
    _timeoutTimer?.cancel();
    // 9 seconds provides sufficient buffer for carrier CGNAT handshakes
    _timeoutTimer = Timer(const Duration(milliseconds: 9000), () {
      if (mounted && _isLoading && !_hasError) {
        _tryNextCandidateOrShowError();
      }
    });
  }

  void _tryNextCandidateOrShowError() {
    if (_candidateIndex + 1 < _candidateUrls.length) {
      _candidateIndex++;
      final nextCandidate = _candidateUrls[_candidateIndex];
      Connectivity().checkConnectivity().then((results) {
        if (results.contains(ConnectivityResult.mobile) && ApiConfig.isPrivateLan(nextCandidate)) {
          _tryNextCandidateOrShowError();
          return;
        }
        _loadSpecificUrl(nextCandidate);
      }).catchError((_) {
        _loadSpecificUrl(nextCandidate);
      });
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
          try {
            if (message.message == 'logout') {
              final auth = Provider.of<AuthProvider>(context, listen: false);
              await auth.logout();
              if (mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const OnboardingScreen()),
                  (route) => false,
                );
              }
            } else {
              final decoded = jsonDecode(message.message);
              if (decoded is Map<String, dynamic>) {
                final event = decoded['event']?.toString();
                final userId = decoded['userId']?.toString();
                final role = decoded['role']?.toString() ?? 'user';

                if ((event == 'login' || event == 'signup') && userId != null && userId.isNotEmpty) {
                  final prefs = await SharedPreferences.getInstance();
                  await prefs.setString('user_id', userId);
                  await prefs.setString('user_role', role);
                  debugPrint('[Bridge] User authenticated ($event): $userId ($role). Syncing FCM token...');
                  await FcmService.syncTokenWithBackend(userId, role: role);
                } else if (event == 'logout') {
                  if (userId != null && userId.isNotEmpty) {
                    await FcmService.removeTokenFromBackend(userId);
                  }
                  final prefs = await SharedPreferences.getInstance();
                  await prefs.remove('user_id');
                  await prefs.remove('user_role');
                }
              }
            }
          } catch (e) {
            debugPrint('[Bridge] Message parse notice: $e');
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
                _isFirstLoad = false;
                _timeoutTimer?.cancel();
              });
            }
          },
          onPageStarted: (String url) {
            if (mounted && _isFirstLoad) {
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
                _isFirstLoad = false;
              });
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
        if (_isFirstLoad) {
          _isLoading = true;
        }
      });
    }
    if (_isFirstLoad) {
      _startTimeoutTimer();
    }
    _controller?.loadRequest(Uri.parse(url));
  }

  Future<void> _reload() async {
    setState(() {
      _hasError = false;
      _isLoading = true;
      _isFirstLoad = true;
      _candidateIndex = 0;
    });

    // Proactively resolve the newest live server (e.g. from dynamic remote config)
    final resolvedUrl = await ApiConfig.resolveWorkingServer();
    _candidateUrls = List<String>.from(ApiConfig.candidateServers.where((u) => !_isLoopbackUrl(u)));
    if (!_candidateUrls.contains(resolvedUrl)) {
      _candidateUrls.insert(0, resolvedUrl);
    }
    _loadSpecificUrl(resolvedUrl);
  }

  void _showConfigureHostDialog() {
    final TextEditingController hostController = TextEditingController(text: _currentUrl);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.hub_rounded, color: Color(0xFF0756B5), size: 24),
            const SizedBox(width: 8),
            Text(
              'Server & Network Diagnostics',
              style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 17),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFBFDBFE)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.wifi_find_rounded, size: 16, color: Color(0xFF1D4ED8)),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      _networkStatusText,
                      style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF1E40AF)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            Text(
              'Active Server URL / Tunnel Endpoint:',
              style: GoogleFonts.outfit(fontSize: 13, color: const Color(0xFF64748B)),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: hostController,
              decoration: InputDecoration(
                hintText: 'e.g. https://xxxx.trycloudflare.com',
                filled: true,
                fillColor: const Color(0xFFF8FAFC),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
              style: GoogleFonts.jetBrainsMono(fontSize: 12.5),
            ),
            const SizedBox(height: 14),
            Text(
              'Quick Connect Presets:',
              style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: const Color(0xFF475569)),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                _buildQuickChip('Cloud Tunnel (Global 4G/5G)', ApiConfig.productionServerUrl, hostController),
                _buildQuickChip('Local Wi-Fi (Port 9000)', 'http://${ApiConfig.lanIp}:9000', hostController),
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
              backgroundColor: const Color(0xFF0756B5),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
              final newUrl = hostController.text.trim();
              if (newUrl.isNotEmpty) {
                final prefs = await SharedPreferences.getInstance();
                await prefs.setString('custom_web_url', newUrl);
                await prefs.setString('working_web_url', newUrl);
                ApiConfig.setActiveBaseUrl(newUrl);
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
      label: Text(label, style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w600)),
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
        systemNavigationBarDividerColor: Colors.transparent,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, result) async {
          if (didPop) return;
          final ctrl = _controller;
          if (ctrl != null && await ctrl.canGoBack()) {
            await ctrl.goBack();
          } else {
            if (context.mounted) {
              SystemNavigator.pop();
            }
          }
        },
        child: Scaffold(
          backgroundColor: Colors.white,
          body: SafeArea(
            top: true,
            bottom: false,
            child: Stack(
              children: [
                // Render WebView
                if (!_hasError && _controller != null)
                  Positioned.fill(
                    child: WebViewWidget(
                      controller: _controller!,
                      gestureRecognizers: <Factory<OneSequenceGestureRecognizer>>{
                        Factory<OneSequenceGestureRecognizer>(
                          () => EagerGestureRecognizer(),
                        ),
                      },
                    ),
                  ),

                // Clean Brand Loading Screen with 3-Tap Diagnostic Trigger
                if (_isLoading && !_hasError)
                  Positioned.fill(
                    child: Container(
                      color: Colors.white,
                      child: Center(
                        child: GestureDetector(
                          onTap: () {
                            // Secret double/triple tap opens server diagnostic
                          },
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              GestureDetector(
                                onLongPress: _showConfigureHostDialog,
                                child: Container(
                                  width: 130,
                                  height: 130,
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: const Color(0xFF0756B5).withValues(alpha: 0.06),
                                  ),
                                  child: Image.asset(
                                    'assets/images/logoLightMode.png',
                                    fit: BoxFit.contain,
                                    filterQuality: FilterQuality.high,
                                    errorBuilder: (_, _, _) => const Icon(
                                      Icons.eco_rounded,
                                      size: 60,
                                      color: Color(0xFF075C2A),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 22),
                              SizedBox(
                                width: 36,
                                height: 36,
                                child: CircularProgressIndicator(
                                  valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF0756B5)),
                                  backgroundColor: const Color(0xFF10B981).withValues(alpha: 0.3),
                                  strokeWidth: 3.5,
                                ),
                              ),
                              const SizedBox(height: 18),
                              Text(
                                'Natural Milk Dairy',
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
                                color: const Color(0xFF0756B5).withValues(alpha: 0.10),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.wifi_off_rounded,
                                size: 40,
                                color: Color(0xFF0756B5),
                              ),
                            ),
                            const SizedBox(height: 20),
                            Text(
                              'Connecting to Storefront',
                              textAlign: TextAlign.center,
                              style: GoogleFonts.outfit(
                                fontSize: 21,
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFF0F2742),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Verifying server connection over your active network.\nTap "Retry Now" or check connection settings below.',
                              textAlign: TextAlign.center,
                              style: GoogleFonts.outfit(
                                fontSize: 13.5,
                                color: const Color(0xFF64748B),
                                height: 1.4,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                _currentUrl,
                                textAlign: TextAlign.center,
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
                                      backgroundColor: const Color(0xFF0756B5),
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
                                      'Settings',
                                      style: GoogleFonts.outfit(
                                        fontSize: 13.5,
                                        fontWeight: FontWeight.w700,
                                        color: const Color(0xFF0756B5),
                                      ),
                                    ),
                                    style: OutlinedButton.styleFrom(
                                      side: const BorderSide(color: Color(0xFF0756B5)),
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
