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

      await saveSession(token: token, userId: userId, email: email);
      
      return {
        'success': true,
        'message': response['message'] ?? 'Login Successful',
        'user': UserModel.fromJson(userData, token: token),
      };
    }
    
    return response;
  }

  static Future<Map<String, dynamic>> signup(String email, String password, String confirmPassword) async {
    final response = await ApiService.post(
      ApiConfig.signupUrl,
      {
        'email': email,
        'password': password,
        'confirmPassword': confirmPassword,
      },
    );
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

      await saveSession(token: token, userId: userId, email: email);

      return {
        'success': true,
        'message': response['message'] ?? 'Account created and verified!',
        'user': UserModel.fromJson(userData, token: token),
      };
    }
    return response;
  }

  static Future<void> saveSession({required String token, required String userId, String? email}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(keyToken, token);
    await prefs.setString(keyUserId, userId);
    if (email != null) await prefs.setString(keyUserEmail, email);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(keyToken);
  }

  static Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(keyUserId);
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(keyToken);
    await prefs.remove(keyUserId);
    await prefs.remove(keyUserEmail);
  }
}
