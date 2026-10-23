import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../models/product_model.dart';
import '../providers/cart_provider.dart';

class ProductCard extends StatelessWidget {
  final ProductModel product;

  const ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cartProvider = Provider.of<CartProvider>(context);
    final isWishlisted = cartProvider.isWishlisted(product.id);
    final inCart = cartProvider.cartItems.containsKey(product.id);
    final qty = inCart ? (cartProvider.cartItems[product.id]!['quantity'] as int) : 0;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: inCart
              ? const Color(0xFF0756B5).withValues(alpha: 0.4)
              : (isDark ? Colors.grey.shade800 : Colors.grey.shade200),
        ),
        boxShadow: [
          BoxShadow(
            color: inCart
                ? const Color(0xFF0756B5).withValues(alpha: 0.08)
                : Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Image Container with Top-Left Discount Badge & Top-Right Wishlist
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                child: Container(
                  height: 115,
                  width: double.infinity,
                  color: isDark ? Colors.black26 : Colors.grey.shade50,
                  child: Image.network(
                    product.image,
                    fit: BoxFit.contain,
                    errorBuilder: (ctx, error, stack) {
                      return Container(
                        color: const Color(0xFF075C2A).withValues(alpha: 0.08),
                        child: const Icon(
                          Icons.local_drink,
                          size: 44,
                          color: Color(0xFF075C2A),
                        ),
                      );
                    },
                  ),
                ),
              ),

              // Floating Top-Left Discount Tag Badge (Matching Web Gold Badge)
              if (product.discount > 0)
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF9C3),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: const Color(0xFFFDE047),
                        width: 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 4,
                          offset: const Offset(0, 1),
                        ),
                      ],
                    ),
                    child: Text(
                      '${product.discount.toInt()}% OFF',
                      style: const TextStyle(
                        color: Color(0xFF854D0E),
                        fontSize: 9.5,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.2,
                      ),
                    ),
                  ),
                ),

              // Floating Top-Right Wishlist Heart Circle Button
              Positioned(
                top: 8,
                right: 8,
                child: GestureDetector(
                  onTap: () => cartProvider.toggleWishlist(product.id),
                  child: Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.95),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isWishlisted ? Colors.red.shade200 : Colors.grey.shade200,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.08),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Icon(
                      isWishlisted ? Icons.favorite : Icons.favorite_border,
                      size: 15,
                      color: isWishlisted ? const Color(0xFFFF385C) : Colors.grey.shade500,
                    ),
                  ),
                ),
              ),
            ],
          ),

          // 2. Content Padding (Matching Web Card Structure)
          Padding(
            padding: const EdgeInsets.all(9.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category Pill + Star Rating Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Category Pill
                    Flexible(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0756B5).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: const Color(0xFF0756B5).withValues(alpha: 0.2),
                            width: 0.8,
                          ),
                        ),
                        child: Text(
                          product.category.toUpperCase(),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0756B5),
                            letterSpacing: 0.3,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 4),

                    // Rating Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: const Color(0xFFF59E0B).withValues(alpha: 0.25),
                          width: 0.8,
                        ),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.star, size: 10, color: Color(0xFFF59E0B)),
                          SizedBox(width: 2),
                          Text(
                            '4.9',
                            style: TextStyle(
                              fontSize: 9.5,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFFB45309),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 5),

                // Item Name (in Black Text as requested)
                Text(
                  product.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                    height: 1.25,
                    color: isDark ? Colors.white : Colors.black,
                  ),
                ),
                const SizedBox(height: 4),

                // Stock Info ("Available: X Unit")
                Text.rich(
                  TextSpan(
                    text: 'Available: ',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                    ),
                    children: [
                      TextSpan(
                        text: '${product.stock} ${product.unit}',
                        style: const TextStyle(
                          color: Color(0xFF075C2A),
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 7),

                // Price Row: Selling Price in Blue + Strikethrough Price
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      '₹${product.finalPrice.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF0756B5), // Price in Blue
                      ),
                    ),
                    if (product.discount > 0) ...[
                      const SizedBox(width: 5),
                      Text(
                        '₹${product.price.toStringAsFixed(2)}',
                        style: TextStyle(
                          fontSize: 10.5,
                          color: Colors.grey.shade400,
                          fontWeight: FontWeight.w600,
                          decoration: TextDecoration.lineThrough,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 8),

                // Action Buttons Row: Dual Buttons (Green ⚡ Buy + Blue 🛒 Add)
                Row(
                  children: [
                    // 1. Buy Now Button (Green)
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          if (!inCart) {
                            cartProvider.addToCart(product);
                          }
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Proceeding with ${product.name}!'),
                              duration: const Duration(seconds: 1),
                              behavior: SnackBarBehavior.floating,
                              backgroundColor: const Color(0xFF075C2A),
                            ),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 6),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF075C2A), Color(0xFF063B22)],
                            ),
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF075C2A).withValues(alpha: 0.2),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.bolt, size: 13, color: Colors.white),
                              SizedBox(width: 2),
                              Text(
                                'Buy',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),

                    // 2. Add / Stepper Button (Blue)
                    Expanded(
                      child: qty == 0
                          ? GestureDetector(
                              onTap: () {
                                cartProvider.addToCart(product);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('${product.name} added to cart!'),
                                    duration: const Duration(seconds: 1),
                                    behavior: SnackBarBehavior.floating,
                                    backgroundColor: const Color(0xFF0756B5),
                                  ),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [Color(0xFF0756B5), Color(0xFF054593)],
                                  ),
                                  borderRadius: BorderRadius.circular(10),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFF0756B5).withValues(alpha: 0.2),
                                      blurRadius: 4,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.shopping_cart_outlined, size: 12, color: Colors.white),
                                    SizedBox(width: 2),
                                    Text(
                                      'Add',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w900,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          : Container(
                              padding: const EdgeInsets.symmetric(vertical: 3),
                              decoration: BoxDecoration(
                                color: isDark ? Colors.black26 : Colors.grey.shade100,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: Colors.grey.shade300,
                                  width: 0.8,
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                children: [
                                  GestureDetector(
                                    onTap: () => cartProvider.removeFromCart(product.id),
                                    child: const Padding(
                                      padding: EdgeInsets.symmetric(horizontal: 4),
                                      child: Icon(Icons.remove, size: 14, color: Colors.redAccent),
                                    ),
                                  ),
                                  Text(
                                    '$qty',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w900,
                                      fontSize: 11,
                                    ),
                                  ),
                                  GestureDetector(
                                    onTap: () => cartProvider.addToCart(product),
                                    child: const Padding(
                                      padding: EdgeInsets.symmetric(horizontal: 4),
                                      child: Icon(Icons.add, size: 14, color: Color(0xFF0756B5)),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
