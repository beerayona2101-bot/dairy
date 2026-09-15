import '../config/api_config.dart';
import '../models/product_model.dart';
import 'api_service.dart';

class ProductService {
  static Future<List<ProductModel>> fetchProducts() async {
    try {
      final res = await ApiService.get(ApiConfig.getProductsUrl);
      if (res['success'] == true && res['products'] is List) {
        final list = res['products'] as List;
        return list.map((item) => ProductModel.fromJson(item)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  static Future<Map<String, dynamic>> fetchPageContent() async {
    try {
      final res = await ApiService.get(ApiConfig.pageContentUrl);
      if (res['success'] == true) {
        return res['content'] ?? res['data'] ?? {};
      }
      return {};
    } catch (e) {
      return {};
    }
  }
}
