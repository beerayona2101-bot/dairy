import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ApiService {
  static Future<Map<String, dynamic>> post(String url, Map<String, dynamic> body, {String? token}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };

    // First try the primary URL
    try {
      final response = await http
          .post(Uri.parse(url), headers: headers, body: jsonEncode(body))
          .timeout(const Duration(seconds: 4));

      final data = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return data is Map<String, dynamic> ? data : {'success': true, 'data': data};
      }
    } catch (_) {
      // Primary failed; perform multi-server failover search
    }

    // Try failover candidate servers
    final relativePath = _extractPath(url);
    for (final candidate in ApiConfig.candidateServers) {
      try {
        final targetUrl = '$candidate$relativePath';
        final response = await http
            .post(Uri.parse(targetUrl), headers: headers, body: jsonEncode(body))
            .timeout(const Duration(seconds: 4));

        final data = jsonDecode(response.body);
        if (response.statusCode >= 200 && response.statusCode < 300) {
          ApiConfig.setActiveBaseUrl(candidate);
          return data is Map<String, dynamic> ? data : {'success': true, 'data': data};
        }
      } catch (_) {
        continue;
      }
    }

    return {'success': false, 'message': 'Unable to connect to Madhu Dairy backend servers.'};
  }

  static Future<Map<String, dynamic>> get(String url, {String? token}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };

    // First try the primary URL
    try {
      final response = await http
          .get(Uri.parse(url), headers: headers)
          .timeout(const Duration(seconds: 4));

      final data = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return data is Map<String, dynamic> ? data : {'success': true, 'data': data};
      }
    } catch (_) {
      // Primary failed; perform multi-server failover search
    }

    // Try failover candidate servers
    final relativePath = _extractPath(url);
    for (final candidate in ApiConfig.candidateServers) {
      try {
        final targetUrl = '$candidate$relativePath';
        final response = await http
            .get(Uri.parse(targetUrl), headers: headers)
            .timeout(const Duration(seconds: 4));

        final data = jsonDecode(response.body);
        if (response.statusCode >= 200 && response.statusCode < 300) {
          ApiConfig.setActiveBaseUrl(candidate);
          return data is Map<String, dynamic> ? data : {'success': true, 'data': data};
        }
      } catch (_) {
        continue;
      }
    }

    return {'success': false, 'message': 'Unable to connect to Madhu Dairy backend servers.'};
  }

  static String _extractPath(String fullUrl) {
    try {
      final uri = Uri.parse(fullUrl);
      return uri.path + (uri.hasQuery ? '?${uri.query}' : '');
    } catch (_) {
      return '';
    }
  }
}
