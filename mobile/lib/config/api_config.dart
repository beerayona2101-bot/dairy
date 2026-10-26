import 'dart:async';
import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiConfig {
  // Environment mode toggle
  static const bool isProduction = true;

  // Active production server URL (Fresh live Cloudflare tunnel or permanent cloud URL)
  static const String productionServerUrl = 'https://acres-finder-ships-texas.trycloudflare.com';

  // Permanent Cloud Backup (Set once deployed on Render.com or leave empty)
  static const String permanentCloudUrl = '';

  // Host machine local Wi-Fi IP
  static const String lanIp = '192.168.1.84';

  // Remote Dynamic Configuration URL mirrors (Ensures global reach even if raw GitHub is throttled)
  static const List<String> remoteConfigUrls = [
    'https://raw.githubusercontent.com/beerayona2101-bot/dairy/main/server_config.json',
    'https://cdn.jsdelivr.net/gh/beerayona2101-bot/dairy@main/server_config.json',
    'https://fastly.jsdelivr.net/gh/beerayona2101-bot/dairy@main/server_config.json',
    'https://api.github.com/repos/beerayona2101-bot/dairy/contents/server_config.json',
  ];

  static const String remoteConfigUrl =
      'https://raw.githubusercontent.com/beerayona2101-bot/dairy/main/server_config.json';

  // In-app Web Storefront URL
  static String get webUrl => _activeBaseUrl;

  // Candidate servers list
  static List<String> get candidateServers => List<String>.from(_candidateList);

  static final List<String> _candidateList = [
    productionServerUrl,
    if (permanentCloudUrl.isNotEmpty) permanentCloudUrl,
    'http://$lanIp:9000',
  ];

  static String _activeBaseUrl = productionServerUrl;

  static String get baseUrl => _activeBaseUrl;

  static void setActiveBaseUrl(String url) {
    _activeBaseUrl = url.trim().replaceFirst(RegExp(r'/+$'), '');
  }

  /// Helper to check if a URL is a private local LAN or loopback address
  static bool isPrivateLan(String url) {
    final lower = url.toLowerCase();
    return lower.contains('192.168.') ||
        lower.contains('10.') ||
        lower.contains('172.16.') ||
        lower.contains('172.17.') ||
        lower.contains('172.18.') ||
        lower.contains('172.19.') ||
        lower.contains('172.20.') ||
        lower.contains('172.21.') ||
        lower.contains('172.22.') ||
        lower.contains('172.23.') ||
        lower.contains('172.24.') ||
        lower.contains('172.25.') ||
        lower.contains('172.26.') ||
        lower.contains('172.27.') ||
        lower.contains('172.28.') ||
        lower.contains('172.29.') ||
        lower.contains('172.30.') ||
        lower.contains('172.31.') ||
        lower.contains('localhost') ||
        lower.contains('127.0.0.1') ||
        lower.contains('10.0.2.2');
  }

  /// Automatically discovers, tests, and sets the best reachable backend server.
  /// Works reliably across Cellular 4G/5G, Remote Wi-Fi, and Local LAN.
  static Future<String> resolveWorkingServer() async {
    final prefs = await SharedPreferences.getInstance();
    final customUrl = prefs.getString('custom_web_url');
    final savedWorkingUrl = prefs.getString('working_web_url');

    // Check connectivity status to identify cellular vs Wi-Fi
    List<ConnectivityResult> connectivityResults = [];
    try {
      connectivityResults = await Connectivity().checkConnectivity();
    } catch (_) {}
    final isCellular = connectivityResults.contains(ConnectivityResult.mobile);

    final candidates = <String>[];

    // If user explicitly configured a custom URL via in-app Settings, prioritize it
    if (customUrl != null && customUrl.isNotEmpty && !_isLoopback(customUrl)) {
      final cleanCustom = customUrl.trim().replaceFirst(RegExp(r'/+$'), '');
      if (!(isCellular && isPrivateLan(cleanCustom))) {
        candidates.add(cleanCustom);
      }
    }

    // 1. Fetch remote dynamic config across redundant CDN & GitHub mirrors with cache-busting
    final dynamicConfigCompleter = Completer<Map<String, dynamic>?>();
    final cacheBuster = DateTime.now().millisecondsSinceEpoch;

    for (final mirror in remoteConfigUrls) {
      final mirrorUri = Uri.parse('$mirror?_t=$cacheBuster');
      final headers = <String, String>{
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      };
      if (mirror.contains('api.github.com')) {
        headers['Accept'] = 'application/vnd.github.v3.raw';
      }
      http.get(mirrorUri, headers: headers).timeout(const Duration(milliseconds: 3800)).then((res) {
        if (res.statusCode == 200 && !dynamicConfigCompleter.isCompleted) {
          try {
            final data = jsonDecode(res.body);
            if (data is Map<String, dynamic>) {
              dynamicConfigCompleter.complete(data);
            }
          } catch (_) {}
        }
      }).catchError((_) {
        // Fallback to next mirror
      });
    }

    Map<String, dynamic>? remoteData;
    try {
      remoteData = await dynamicConfigCompleter.future.timeout(
        const Duration(milliseconds: 5500),
        onTimeout: () => null,
      );
    } catch (_) {}

    if (remoteData != null) {
      if (remoteData['activeServerUrl'] != null) {
        final remoteServer = remoteData['activeServerUrl'].toString().trim().replaceFirst(RegExp(r'/+$'), '');
        if (remoteServer.isNotEmpty && !candidates.contains(remoteServer)) {
          if (!(isCellular && isPrivateLan(remoteServer))) {
            candidates.add(remoteServer);
            debugPrint('[ApiConfig] Discovered dynamic remote server: $remoteServer');
          }
        }
      }
      if (remoteData['fallbackUrls'] is List) {
        for (final f in remoteData['fallbackUrls']) {
          final fStr = f.toString().trim().replaceFirst(RegExp(r'/+$'), '');
          if (fStr.isNotEmpty && !candidates.contains(fStr)) {
            if (!(isCellular && isPrivateLan(fStr))) {
              candidates.add(fStr);
            }
          }
        }
      }
    }

    // 2. Add saved working URL if available and appropriate for current network
    if (savedWorkingUrl != null && savedWorkingUrl.isNotEmpty && !_isLoopback(savedWorkingUrl)) {
      final cleanSaved = savedWorkingUrl.trim().replaceFirst(RegExp(r'/+$'), '');
      if (!(isCellular && isPrivateLan(cleanSaved))) {
        if (!candidates.contains(cleanSaved)) {
          candidates.add(cleanSaved);
        }
      }
    }

    // 3. Add default production server
    if (!candidates.contains(productionServerUrl)) {
      candidates.add(productionServerUrl);
    }

    // 4. Add permanent cloud backup if configured
    if (permanentCloudUrl.isNotEmpty && !candidates.contains(permanentCloudUrl)) {
      candidates.add(permanentCloudUrl);
    }

    // 5. Add local LAN IP only if on Wi-Fi (never waste cellular connection time on unreachable LAN IPs)
    if (!isCellular) {
      final lanUrl = 'http://$lanIp:9000';
      if (!candidates.contains(lanUrl)) {
        candidates.add(lanUrl);
      }
    }

    _candidateList.clear();
    _candidateList.addAll(candidates);

    if (candidates.isEmpty) {
      return productionServerUrl;
    }

    // 6. Test candidates concurrently for fastest live response (5000ms buffer for cellular carriers)
    final completer = Completer<String>();
    int pending = candidates.length;

    for (final candidate in candidates) {
      _testHealth(candidate, timeoutMs: 4500).then((isHealthy) {
        if (isHealthy && !completer.isCompleted) {
          setActiveBaseUrl(candidate);
          prefs.setString('working_web_url', candidate);
          debugPrint('[ApiConfig] Connected to responsive server: $candidate');
          completer.complete(candidate);
        } else {
          pending--;
          if (pending <= 0 && !completer.isCompleted) {
            final fallback = candidates[0];
            setActiveBaseUrl(fallback);
            completer.complete(fallback);
          }
        }
      }).catchError((_) {
        pending--;
        if (pending <= 0 && !completer.isCompleted) {
          final fallback = candidates[0];
          setActiveBaseUrl(fallback);
          completer.complete(fallback);
        }
      });
    }

    try {
      return await completer.future.timeout(
        const Duration(milliseconds: 5500),
        onTimeout: () {
          final fallback = candidates[0];
          setActiveBaseUrl(fallback);
          return fallback;
        },
      );
    } catch (_) {
      final fallback = candidates[0];
      setActiveBaseUrl(fallback);
      return fallback;
    }
  }

  /// Reliable health check against /health endpoint
  static Future<bool> _testHealth(String host, {int timeoutMs = 4500}) async {
    try {
      final clean = host.trim().replaceFirst(RegExp(r'/+$'), '');
      final uri = Uri.parse('$clean/health');
      final res = await http.get(uri).timeout(Duration(milliseconds: timeoutMs));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  static bool _isLoopback(String url) {
    final lower = url.toLowerCase();
    return lower.contains('localhost') || lower.contains('127.0.0.1') || lower.contains('10.0.2.2');
  }

  // Endpoints
  static String get loginUrl => '$baseUrl/u/login';
  static String get signupUrl => '$baseUrl/u/signup';
  static String get verifySessionUrl => '$baseUrl/u/verify-session';
  static String get sendOtpUrl => '$baseUrl/u/send-otp';
  static String get verifyOtpUrl => '$baseUrl/u/verify-otp';
  static String get googleLoginUrl => '$baseUrl/u/google-login';

  static String getUserDataUrl(String userId) =>
      '$baseUrl/user-profile/get-user-data/$userId';
  static String get updateProfileUrl =>
      '$baseUrl/user-profile/update-profile-info';

  static String get getProductsUrl => '$baseUrl/products/get-all-products';
  static String getProductUrl(String id) => '$baseUrl/products/get-product/$id';

  static String get pageContentUrl => '$baseUrl/page-content/get';

  static String get createOrderUrl => '$baseUrl/order/create-order';
  static String get getUserOrdersUrl => '$baseUrl/order/get-user-orders';

  static String getNotificationsUrl(String userId) =>
      '$baseUrl/api/notifications/$userId';
  static String get markNotificationReadUrl =>
      '$baseUrl/api/notifications/mark-read';
  static String get deleteNotificationUrl =>
      '$baseUrl/api/notifications/delete';
}
