import 'package:flutter/material.dart';
import '../models/product_model.dart';

class CartProvider with ChangeNotifier {
  final Map<String, Map<String, dynamic>> _cartItems = {}; // productId -> {product, qty}
  final Set<String> _wishlistIds = {};

  Map<String, Map<String, dynamic>> get cartItems => _cartItems;
  Set<String> get wishlistIds => _wishlistIds;

  int get itemCount => _cartItems.values.fold(0, (sum, item) => sum + (item['quantity'] as int));

  double get totalAmount {
    double total = 0.0;
    _cartItems.forEach((key, item) {
      final prod = item['product'] as ProductModel;
      final qty = item['quantity'] as int;
      total += prod.finalPrice * qty;
    });
    return total;
  }

  void addToCart(ProductModel product) {
    if (_cartItems.containsKey(product.id)) {
      _cartItems[product.id]!['quantity'] = (_cartItems[product.id]!['quantity'] as int) + 1;
    } else {
      _cartItems[product.id] = {
        'product': product,
        'quantity': 1,
      };
    }
    notifyListeners();
  }

  void removeFromCart(String productId) {
    if (_cartItems.containsKey(productId)) {
      if ((_cartItems[productId]!['quantity'] as int) > 1) {
        _cartItems[productId]!['quantity'] = (_cartItems[productId]!['quantity'] as int) - 1;
      } else {
        _cartItems.remove(productId);
      }
      notifyListeners();
    }
  }

  void toggleWishlist(String productId) {
    if (_wishlistIds.contains(productId)) {
      _wishlistIds.remove(productId);
    } else {
      _wishlistIds.add(productId);
    }
    notifyListeners();
  }

  bool isWishlisted(String productId) => _wishlistIds.contains(productId);

  void clearCart() {
    _cartItems.clear();
    notifyListeners();
  }
}
