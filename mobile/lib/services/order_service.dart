import '../config/api_config.dart';
import 'api_service.dart';

class OrderService {
  static Future<Map<String, dynamic>> placeOrder({
    required String token,
    required List<Map<String, dynamic>> items,
    required double totalAmount,
    required Map<String, String> address,
    String paymentMethod = 'COD',
  }) async {
    final body = {
      'items': items,
      'totalAmount': totalAmount,
      'address': address,
      'paymentMethod': paymentMethod,
    };
    return await ApiService.post(ApiConfig.createOrderUrl, body, token: token);
  }

  static Future<List<Map<String, dynamic>>> getUserOrders({required String token}) async {
    try {
      final res = await ApiService.get(ApiConfig.getUserOrdersUrl, token: token);
      if (res['success'] == true && res['orders'] is List) {
        return (res['orders'] as List).map((o) => o as Map<String, dynamic>).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}
