class ApiConfig {
  // Environment mode toggle:
  // Set to true to connect to production server on any remote host/domain (cloud, public IP, tunnel)
  // Set to false to run against local server (Wi-Fi LAN: 192.168.1.39)
  static const bool isProduction = true;

  // Production Server / Storefront URL
  // Replace this with your public domain, cloud URL (Render/AWS), or tunnel URL (e.g. Localtunnel/Ngrok)
  static const String productionServerUrl = 'http://192.168.1.39:9000';

  // Host machine local Wi-Fi IP
  static const String lanIp = '192.168.1.39';

  // In-app Web Storefront URL
  static String get webUrl => isProduction
      ? productionServerUrl
      : 'http://$lanIp:5173';

  // Supported candidate servers
  static List<String> get candidateServers => [
        if (isProduction) productionServerUrl,
        'http://$lanIp:9000',
        'http://10.0.2.2:9000',
      ];

  static String _activeBaseUrl = isProduction ? productionServerUrl : 'http://$lanIp:9000';

  static String get baseUrl => _activeBaseUrl;

  static void setActiveBaseUrl(String url) {
    _activeBaseUrl = url;
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
