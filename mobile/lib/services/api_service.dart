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
          .timeout(const Duration(seconds: 5));

      final data = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return data is Map<String, dynamic> ? data : {'success': true, 'data': data};
      }

      // If server responded with a 4xx error (e.g. 400, 401, 404, 409), return the server's error message
      if (response.statusCode >= 400 && response.statusCode < 500) {
        if (data is Map<String, dynamic>) {
          return {
            'success': false,
            'statusCode': response.statusCode,
            ...data,
            'message': data['message'] ?? 'Request failed (${response.statusCode})',
          };
        }
      }
    } catch (_) {
      // Primary network error; try candidate servers
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

        if (response.statusCode >= 400 && response.statusCode < 500) {
          ApiConfig.setActiveBaseUrl(candidate);
          if (data is Map<String, dynamic>) {
            return {
              'success': false,
              'statusCode': response.statusCode,
              ...data,
              'message': data['message'] ?? 'Request failed (${response.statusCode})',
            };
          }
        }
      } catch (_) {
        continue;
      }
    }

    // Proactive self-healing: query remote config on GitHub before failing
    try {
      final freshServer = await ApiConfig.resolveWorkingServer();
      final freshTargetUrl = '$freshServer$relativePath';
      final response = await http
          .post(Uri.parse(freshTargetUrl), headers: headers, body: jsonEncode(body))
          .timeout(const Duration(seconds: 5));

      final data = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        ApiConfig.setActiveBaseUrl(freshServer);
        return data is Map<String, dynamic> ? data : {'success': true, 'data': data};
      }

      if (response.statusCode >= 400 && response.statusCode < 500) {
        ApiConfig.setActiveBaseUrl(freshServer);
        if (data is Map<String, dynamic>) {
          return {
            'success': false,
            'statusCode': response.statusCode,
            ...data,
            'message': data['message'] ?? 'Request failed (${response.statusCode})',
          };
        }
      }
    } catch (_) {}

    return {'success': false, 'message': 'Unable to connect to Natural Milk Dairy backend servers.'};
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
          .timeout(const Duration(seconds: 5));

      final data = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return data is Map<String, dynamic> ? data : {'success': true, 'data': data};
      }

      if (response.statusCode >= 400 && response.statusCode < 500) {
        if (data is Map<String, dynamic>) {
          return {
            'success': false,
            'statusCode': response.statusCode,
            ...data,
            'message': data['message'] ?? 'Request failed (${response.statusCode})',
          };
        }
      }
    } catch (_) {
      // Primary network error; try candidate servers
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

        if (response.statusCode >= 400 && response.statusCode < 500) {
          ApiConfig.setActiveBaseUrl(candidate);
          if (data is Map<String, dynamic>) {
            return {
              'success': false,
              'statusCode': response.statusCode,
              ...data,
              'message': data['message'] ?? 'Request failed (${response.statusCode})',
            };
          }
        }
      } catch (_) {
        continue;
      }
    }

    // Proactive self-healing: query remote config on GitHub before failing
    try {
      final freshServer = await ApiConfig.resolveWorkingServer();
      final freshTargetUrl = '$freshServer$relativePath';
      final response = await http
          .get(Uri.parse(freshTargetUrl), headers: headers)
          .timeout(const Duration(seconds: 5));

      final data = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        ApiConfig.setActiveBaseUrl(freshServer);
        return data is Map<String, dynamic> ? data : {'success': true, 'data': data};
      }

      if (response.statusCode >= 400 && response.statusCode < 500) {
        ApiConfig.setActiveBaseUrl(freshServer);
        if (data is Map<String, dynamic>) {
          return {
            'success': false,
            'statusCode': response.statusCode,
            ...data,
            'message': data['message'] ?? 'Request failed (${response.statusCode})',
          };
        }
      }
    } catch (_) {}

    return {'success': false, 'message': 'Unable to connect to Natural Milk Dairy backend servers.'};
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
