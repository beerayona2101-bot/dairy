import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  // Host machine local Wi-Fi IP for physical device testing
  static const String lanIp = '192.168.1.46';

  // Configurable base URL with auto-detection for Android Physical Device, Emulator, & Web/Desktop
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:9000';
    } else if (!kIsWeb && Platform.isAndroid) {
      // 10.0.2.2 is for Android Studio Emulator.
      // lanIp (192.168.1.46) or 127.0.0.1 (via `adb reverse tcp:9000 tcp:9000`) is for physical phone (CLK NX2).
      return 'http://$lanIp:9000';
    } else {
      return 'http://localhost:9000';
    }
  }

  // Endpoints
  static String get loginUrl => '$baseUrl/u/login';
  static String get signupUrl => '$baseUrl/u/signup';
  static String get sendOtpUrl => '$baseUrl/u/send-otp';
  static String get verifyOtpUrl => '$baseUrl/u/verify-otp';
  static String get googleLoginUrl => '$baseUrl/u/google-login';
  
  static String getUserDataUrl(String userId) => '$baseUrl/user-profile/get-user-data/$userId';
  static String get updateProfileUrl => '$baseUrl/user-profile/update-profile-info';
  
  static String get getProductsUrl => '$baseUrl/products/get-all-products';
  static String getProductUrl(String id) => '$baseUrl/products/get-product/$id';
  
  static String get pageContentUrl => '$baseUrl/page-content/get';
  
  static String get createOrderUrl => '$baseUrl/order/create-order';
  static String get getUserOrdersUrl => '$baseUrl/order/get-user-orders';
  
  static String getNotificationsUrl(String userId) => '$baseUrl/api/notifications/$userId';
  static String get markNotificationReadUrl => '$baseUrl/api/notifications/mark-read';
  static String get deleteNotificationUrl => '$baseUrl/api/notifications/delete';
}
