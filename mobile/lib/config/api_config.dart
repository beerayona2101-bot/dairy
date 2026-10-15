import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiConfig {
  // Environment mode toggle
  static const bool isProduction = true;

  // Active production server URL (Fresh live Cloudflare tunnel)
  static const String productionServerUrl = 'https://latex-coverage-happen-bench.trycloudflare.com';

  // Host machine local Wi-Fi IP
  static const String lanIp = '192.168.1.84';

  // Remote Dynamic Configuration URL
  // Enables updating the active server on any phone worldwide WITHOUT recompiling the APK!
  static const String remoteConfigUrl =
      'https://raw.githubusercontent.com/beerayona2101-bot/dairy/main/server_config.json';

  // In-app Web Storefront URL
  static String get webUrl => _activeBaseUrl;

  // Candidate servers list
  static List<String> get candidateServers => List<String>.from(_candidateList);

  static final List<String> _candidateList = [
    productionServerUrl,
    'http://$lanIp:9000',
  ];

  static String _activeBaseUrl = productionServerUrl;

  static String get baseUrl => _activeBaseUrl;

  static void setActiveBaseUrl(String url) {
    _activeBaseUrl = url.trim().replaceFirst(RegExp(r'/+$'), '');
  }

  /// Automatically discovers, tests, and sets the best reachable backend server.
  /// Works across Cellular 4G/5G, Remote Wi-Fi, and Local LAN.
  static Future<String> resolveWorkingServer() async {
    final prefs = await SharedPreferences.getInstance();
    final savedUrl = prefs.getString('working_web_url') ?? prefs.getString('custom_web_url');

    final candidates = <String>[];

    // 1. Try fetching remote dynamic config (timeout after 2.5 seconds)
    try {
      final remoteUri = Uri.parse(remoteConfigUrl);
      final res = await http.get(remoteUri).timeout(const Duration(milliseconds: 2500));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data is Map<String, dynamic> && data['activeServerUrl'] != null) {
          final remoteServer = data['activeServerUrl'].toString().trim().replaceFirst(RegExp(r'/+$'), '');
          if (remoteServer.isNotEmpty && !candidates.contains(remoteServer)) {
            candidates.add(remoteServer);
            debugPrint('[ApiConfig] Discovered dynamic remote server: $remoteServer');
          }
        }
      }
    } catch (e) {
      debugPrint('[ApiConfig] Dynamic config lookup notice: $e');
    }

    // 2. Add saved URL if available and clean
    if (savedUrl != null && savedUrl.isNotEmpty && !_isLoopback(savedUrl)) {
      final cleanSaved = savedUrl.trim().replaceFirst(RegExp(r'/+$'), '');
      if (!candidates.contains(cleanSaved)) {
        candidates.add(cleanSaved);
      }
    }

    // 3. Add default production and local LAN candidates
    if (!candidates.contains(productionServerUrl)) {
      candidates.add(productionServerUrl);
    }
    final lanUrl = 'http://$lanIp:9000';
    if (!candidates.contains(lanUrl)) {
      candidates.add(lanUrl);
    }

    _candidateList.clear();
    _candidateList.addAll(candidates);

    // 4. Test candidates concurrently for fastest live response
    for (final candidate in candidates) {
      final isHealthy = await _testHealth(candidate, timeoutMs: 2500);
      if (isHealthy) {
        setActiveBaseUrl(candidate);
        await prefs.setString('working_web_url', candidate);
        debugPrint('[ApiConfig] Connected to responsive server: $candidate');
        return candidate;
      }
    }

    // Fallback to first candidate or default
    final fallback = candidates.isNotEmpty ? candidates[0] : productionServerUrl;
    setActiveBaseUrl(fallback);
    return fallback;
  }

  /// Fast health check against /health endpoint
  static Future<bool> _testHealth(String host, {int timeoutMs = 2500}) async {
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
