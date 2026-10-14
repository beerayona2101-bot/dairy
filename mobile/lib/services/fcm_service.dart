import 'dart:convert';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

/// Top-level background message handler executed in a separate isolate
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    await Firebase.initializeApp();
  } catch (_) {}
  debugPrint('[FCM Background] Received message: ${message.messageId} - ${message.notification?.title}');
}

class FcmService {
  static final FcmService _instance = FcmService._internal();
  factory FcmService() => _instance;
  FcmService._internal();

  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _highImportanceChannel =
      AndroidNotificationChannel(
    'high_importance_channel',
    'High Importance Notifications',
    description: 'Used for important order updates and delivery alerts.',
    importance: Importance.max,
    playSound: true,
    enableVibration: true,
  );

  static String? _cachedToken;
  static String? get deviceToken => _cachedToken;

  /// Initialize Firebase Messaging, permissions, channels, and listeners
  static Future<void> initialize() async {
    try {
      final messaging = FirebaseMessaging.instance;

      // 1. Request notification permissions (critical for iOS and Android 13+)
      final settings = await messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      debugPrint('[FCM] Permission status: ${settings.authorizationStatus}');

      // 2. Setup Android notification channel for heads-up alerts
      final androidPlugin = _localNotifications.resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>();
      if (androidPlugin != null) {
        await androidPlugin.createNotificationChannel(_highImportanceChannel);
        await androidPlugin.requestNotificationsPermission();
      }

      // 3. Setup Local Notifications for Foreground display
      const initSettingsAndroid = AndroidInitializationSettings('@mipmap/ic_launcher');
      const initSettingsIOS = DarwinInitializationSettings(
        requestAlertPermission: true,
        requestBadgePermission: true,
        requestSoundPermission: true,
      );
      const initSettings = InitializationSettings(
        android: initSettingsAndroid,
        iOS: initSettingsIOS,
      );

      await _localNotifications.initialize(
        initSettings,
        onDidReceiveNotificationResponse: (NotificationResponse response) {
          debugPrint('[FCM Local] Notification tapped: ${response.payload}');
        },
      );

      // 4. Set iOS foreground presentation options
      await messaging.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );

      // 5. Get current device FCM token
      await refreshDeviceToken();

      // 6. Listen for token refreshes
      messaging.onTokenRefresh.listen((newToken) {
        _cachedToken = newToken;
        debugPrint('[FCM] Token refreshed: $newToken');
        _syncTokenIfUserLoggedIn(newToken);
      });

      // 7. Foreground message listener (Show banner with local notifications)
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('[FCM Foreground] Message received: ${message.notification?.title}');
        _showForegroundNotification(message);
      });

      // 8. Background message opened app listener
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('[FCM] App opened from notification: ${message.data}');
      });

      // 9. Terminated state message check
      final initialMessage = await messaging.getInitialMessage();
      if (initialMessage != null) {
        debugPrint('[FCM] App launched from terminated state notification: ${initialMessage.data}');
      }
    } catch (e) {
      debugPrint('[FCM] Initialization notice: $e');
    }
  }

  /// Retrieve active device token from Firebase
  static Future<String?> refreshDeviceToken() async {
    try {
      final token = await FirebaseMessaging.instance.getToken();
      _cachedToken = token;
      debugPrint('[FCM] Device Token: $token');

      if (token != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('fcm_device_token', token);
      }
      return token;
    } catch (e) {
      debugPrint('[FCM] Error getting device token: $e');
      return null;
    }
  }

  /// Display a heads-up notification banner when the app is actively running
  static Future<void> _showForegroundNotification(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;

    final androidDetails = AndroidNotificationDetails(
      _highImportanceChannel.id,
      _highImportanceChannel.name,
      channelDescription: _highImportanceChannel.description,
      importance: Importance.max,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
      playSound: true,
      enableVibration: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final platformDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      notification.hashCode,
      notification.title ?? 'Natural Milk Dairy',
      notification.body ?? '',
      platformDetails,
      payload: jsonEncode(message.data),
    );
  }

  /// Automatically sync token if a user ID is stored in preferences
  static Future<void> _syncTokenIfUserLoggedIn(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('user_id');
      if (userId != null && userId.isNotEmpty) {
        await syncTokenWithBackend(userId, tokenOverride: token);
      }
    } catch (_) {}
  }

  /// Sync device FCM token with the backend server database
  static Future<bool> syncTokenWithBackend(String userId,
      {String role = 'user', String? tokenOverride}) async {
    try {
      final token = tokenOverride ?? _cachedToken ?? await refreshDeviceToken();
      if (token == null || token.isEmpty) {
        debugPrint('[FCM] Cannot sync token: token is null');
        return false;
      }

      final url = Uri.parse('${ApiConfig.baseUrl}/u/update-fcm-token');
      final response = await http
          .post(
            url,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'userId': userId,
              'fcmToken': token,
              'role': role,
            }),
          )
          .timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        debugPrint('[FCM] Token successfully synced to backend for user: $userId');
        return true;
      } else {
        debugPrint('[FCM] Backend token sync notice (${response.statusCode}): ${response.body}');
        return false;
      }
    } catch (e) {
      debugPrint('[FCM] Backend sync error: $e');
      return false;
    }
  }

  /// Remove device FCM token on user logout
  static Future<void> removeTokenFromBackend(String userId) async {
    try {
      final token = _cachedToken ?? (await SharedPreferences.getInstance()).getString('fcm_device_token');
      if (token == null || token.isEmpty) return;

      final url = Uri.parse('${ApiConfig.baseUrl}/u/remove-fcm-token');
      await http
          .post(
            url,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'userId': userId,
              'fcmToken': token,
            }),
          )
          .timeout(const Duration(seconds: 5));
      debugPrint('[FCM] Token removed from backend on logout');
    } catch (e) {
      debugPrint('[FCM] Error removing token on logout: $e');
    }
  }
}
