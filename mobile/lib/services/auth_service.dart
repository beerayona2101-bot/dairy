import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user_model.dart';
import 'api_service.dart';

class AuthService {
  static const String keyToken = 'user_token';
  static const String keyUserId = 'user_id';
  static const String keyUserEmail = 'user_email';

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await ApiService.post(
      ApiConfig.loginUrl,
      {'email': email, 'password': password},
    );

    if (response['success'] == true && response['userToken'] != null) {
      final token = response['userToken'].toString();
      final userData = response['user'] as Map<String, dynamic>? ?? {};
      final userId = userData['_id']?.toString() ?? userData['id']?.toString() ?? '';

      final role = userData['role']?.toString() ?? 'user';
      final name = userData['name']?.toString() ?? userData['username']?.toString();
      final mobile = userData['mobileNo']?.toString();

      await saveSession(
        token: token,
        userId: userId,
        email: email,
        role: role,
        name: name,
        mobile: mobile,
      );
      
      return {
        'success': true,
        'message': response['message'] ?? 'Login Successful',
        'user': UserModel.fromJson(userData, token: token),
      };
    }
    
    return response;
  }

  static Future<Map<String, dynamic>> signup({
    required String email,
    required String password,
    required String confirmPassword,
    String? username,
    String? mobileNo,
  }) async {
    final response = await ApiService.post(
      ApiConfig.signupUrl,
      {
        'email': email,
        'password': password,
        'confirmPassword': confirmPassword,
        if (username != null && username.isNotEmpty) 'username': username,
        if (mobileNo != null && mobileNo.isNotEmpty) 'mobileNo': mobileNo,
      },
    );

    if (response['success'] == true && response['userToken'] != null) {
      final token = response['userToken'].toString();
      final userData = response['user'] as Map<String, dynamic>? ?? {};
      final userId = userData['_id']?.toString() ?? userData['id']?.toString() ?? '';
      final role = userData['role']?.toString() ?? 'user';

      await saveSession(
        token: token,
        userId: userId,
        email: email,
        role: role,
        name: username,
        mobile: mobileNo,
      );
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('is_guest_user', false);
      return {
        'success': true,
        'user': UserModel.fromJson(userData, token: token),
        'token': token,
      };
    }

    return response;
  }

  static Future<Map<String, dynamic>> sendOtp(String target, String otp) async {
    final isEmail = target.contains('@');
    final body = isEmail ? {'email': target, 'otp': otp} : {'mobileNo': target, 'otp': otp};
    return await ApiService.post(ApiConfig.sendOtpUrl, body);
  }

  static Future<Map<String, dynamic>> verifyOtp(String email, String password, String otp) async {
    final response = await ApiService.post(
      ApiConfig.verifyOtpUrl,
      {'email': email, 'password': password, 'otp': otp},
    );
    
    if (response['success'] == true && response['userToken'] != null) {
      final token = response['userToken'].toString();
      final userData = response['user'] as Map<String, dynamic>? ?? {};
      final userId = userData['_id']?.toString() ?? userData['id']?.toString() ?? '';
      final role = userData['role']?.toString() ?? 'user';
      final name = userData['name']?.toString() ?? userData['username']?.toString();
      final mobile = userData['mobileNo']?.toString();

      await saveSession(
        token: token,
        userId: userId,
        email: email,
        role: role,
        name: name,
        mobile: mobile,
      );

      return {
        'success': true,
        'message': response['message'] ?? 'Account created and verified!',
        'user': UserModel.fromJson(userData, token: token),
      };
    }
    return response;
  }

  static Future<void> saveSession({
    required String token,
    required String userId,
    String? email,
    String? role,
    String? name,
    String? mobile,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(keyToken, token);
    await prefs.setString('auth_token', token);
    await prefs.setString(keyUserId, userId);
    if (email != null && email.isNotEmpty) await prefs.setString(keyUserEmail, email);
    if (role != null && role.isNotEmpty) await prefs.setString('user_role', role);
    if (name != null && name.isNotEmpty) await prefs.setString('user_name', name);
    if (mobile != null && mobile.isNotEmpty) await prefs.setString('user_mobile', mobile);
    await prefs.setBool('has_completed_onboarding', true);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(keyToken) ?? prefs.getString('auth_token');
  }

  static Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(keyUserId);
  }

  static Future<String?> getUserEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(keyUserEmail);
  }

  static Future<bool> validateSession({required String token, required String userId}) async {
    try {
      final response = await ApiService.get(
        ApiConfig.verifySessionUrl,
        token: token,
      );
      // If server explicitly replies with an auth error (401/403), token is invalid/expired
      if (response['success'] == false) {
        final statusCode = response['statusCode'];
        if (statusCode == 401 || statusCode == 403) {
          return false;
        }
        final msg = response['message']?.toString().toLowerCase() ?? '';
        if (msg.contains('unauthorized') ||
            msg.contains('invalid token') ||
            msg.contains('jwt expired') ||
            msg.contains('token expired') ||
            msg.contains('forbidden') ||
            msg.contains('access denied')) {
          return false;
        }
        // Network unreachable or other non-auth error -> keep session valid locally
        return true;
      }
      // Server responded successfully — session is valid
      return true;
    } catch (_) {
      // Offline / network glitch — don't invalidate a previously-valid session.
      return true;
    }
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(keyToken);
    await prefs.remove('auth_token');
    await prefs.remove(keyUserId);
    await prefs.remove(keyUserEmail);
    await prefs.remove('user_role');
    await prefs.remove('user_name');
    await prefs.remove('user_mobile');
  }
}
