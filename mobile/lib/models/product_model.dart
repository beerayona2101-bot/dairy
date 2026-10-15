class ProductModel {
  final String id;
  final String name;
  final String category;
  final double price;
  final double discount;
  final int stock;
  final String unit;
  final String image;
  final String? description;

  ProductModel({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    this.discount = 0.0,
    required this.stock,
    required this.unit,
    required this.image,
    this.description,
  });

  double get finalPrice {
    if (discount <= 0) return price;
    return price - (price * discount / 100);
  }

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    String parsedImage = '';
    if (json['image'] is List && (json['image'] as List).isNotEmpty) {
      parsedImage = (json['image'] as List).first.toString();
    } else if (json['image'] is String) {
      parsedImage = json['image'];
    }

    return ProductModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? 'Dairy Product',
      category: json['category'] ?? json['categoryName'] ?? 'General',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      discount: (json['discount'] as num?)?.toDouble() ?? 0.0,
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      unit: json['quantityUnit'] ?? json['unit'] ?? 'Unit',
      image: parsedImage.isNotEmpty ? parsedImage : 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png',
      description: json['description'],
    );
  }
}
