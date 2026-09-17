import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../models/product_model.dart';
import '../providers/auth_provider.dart';
import '../providers/cart_provider.dart';
import '../services/product_service.dart';
import '../services/order_service.dart';
import '../widgets/product_card.dart';
import 'login_screen.dart';
import 'register_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  int _selectedNavIndex = 0;
  String _selectedCategory = 'All';
  String _searchQuery = '';
  List<ProductModel> _products = [];
  bool _isLoadingProducts = true;

  // Profile tab state
  List<Map<String, dynamic>> _userOrders = [];
  bool _isLoadingOrders = false;

  final List<String> _categories = [
    'All',
    'Milk',
    'Dahi',
    'Paneer',
    'Ghee',
    'Butter',
    'Sweets',
  ];

  late TabController _profileTabController;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _profileTabController = TabController(length: 2, vsync: this);
    _loadProducts();
  }

  @override
  void dispose() {
    _profileTabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoadingProducts = true);
    final fetched = await ProductService.fetchProducts();

    if (fetched.isEmpty) {
      _products = [
        ProductModel(
          id: 'p1',
          name: 'Pure Buffalo Milk',
          category: 'Milk',
          price: 45.0,
          discount: 10.0,
          stock: 50,
          unit: '500 ml',
          image: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png',
          description: 'Rich and creamy buffalo milk sourced directly from farm. High in fat content, perfect for making sweets and dairy products.',
        ),
        ProductModel(
          id: 'p2',
          name: 'Fresh Cow Milk',
          category: 'Milk',
          price: 38.0,
          discount: 5.0,
          stock: 40,
          unit: '500 ml',
          image: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png',
          description: 'Pure and fresh cow milk, pasteurized and delivered daily. Rich in calcium and protein for healthy bones.',
        ),
        ProductModel(
          id: 'p3',
          name: 'Pure Desi Ghee',
          category: 'Ghee',
          price: 320.0,
          discount: 15.0,
          stock: 20,
          unit: '500 g',
          image: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png',
          description: 'Traditional hand-churned desi ghee with rich aroma and pure flavor. Made from cow milk using age-old methods.',
        ),
        ProductModel(
          id: 'p4',
          name: 'Fresh Creamy Dahi',
          category: 'Dahi',
          price: 40.0,
          discount: 0.0,
          stock: 30,
          unit: '400 g',
          image: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png',
          description: 'Thick and creamy curd made from fresh milk. Perfect for raita, lassi, and daily consumption.',
        ),
        ProductModel(
          id: 'p5',
          name: 'Malai Paneer',
          category: 'Paneer',
          price: 110.0,
          discount: 8.0,
          stock: 25,
          unit: '200 g',
          image: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png',
          description: 'Soft and fresh malai paneer made from full-fat milk. Perfect for curries and snacks.',
        ),
        ProductModel(
          id: 'p6',
          name: 'White Butter',
          category: 'Butter',
          price: 85.0,
          discount: 5.0,
          stock: 35,
          unit: '200 g',
          image: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png',
          description: 'Fresh churned white butter with natural taste. Perfect on rotis and bread.',
        ),
        ProductModel(
          id: 'p7',
          name: 'Gulab Jamun',
          category: 'Sweets',
          price: 120.0,
          discount: 0.0,
          stock: 15,
          unit: '500 g',
          image: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png',
          description: 'Soft and spongy gulab jamuns soaked in sugar syrup. Made from khoya and fresh dairy.',
        ),
      ];
    } else {
      _products = fetched;
    }

    if (mounted) {
      setState(() => _isLoadingProducts = false);
    }
  }

  Future<void> _loadUserOrders(String token) async {
    setState(() => _isLoadingOrders = true);
    final orders = await OrderService.getUserOrders(token: token);
    if (mounted) {
      setState(() {
        _userOrders = orders;
        _isLoadingOrders = false;
      });
    }
  }

  List<ProductModel> get _filteredProducts {
    var list = _selectedCategory == 'All'
        ? _products
        : _products.where((p) => p.category.toLowerCase().contains(_selectedCategory.toLowerCase())).toList();
    if (_searchQuery.isNotEmpty) {
      list = list.where((p) => p.name.toLowerCase().contains(_searchQuery.toLowerCase())).toList();
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final authProvider = Provider.of<AuthProvider>(context);
    final cartProvider = Provider.of<CartProvider>(context);

    return Scaffold(
      appBar: _buildAppBar(isDark, authProvider, cartProvider),
      body: RefreshIndicator(
        onRefresh: _loadProducts,
        color: AppTheme.primary,
        child: IndexedStack(
          index: _selectedNavIndex,
          children: [
            _buildHomeTab(isDark, cartProvider),
            _buildProductsTab(isDark, cartProvider),
            _buildCartTab(isDark, cartProvider, authProvider),
            _buildWishlistTab(isDark, cartProvider),
            _buildProfileTab(isDark, authProvider),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNavBar(cartProvider),
    );
  }

  PreferredSizeWidget _buildAppBar(bool isDark, AuthProvider authProvider, CartProvider cartProvider) {
    return AppBar(
      automaticallyImplyLeading: false,
      titleSpacing: 16,
      elevation: 0,
      backgroundColor: isDark ? AppTheme.darkCard : Colors.white,
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: AppTheme.primaryGradient,
            ),
            child: const Icon(Icons.water_drop_rounded, size: 18, color: Colors.white),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'MADHU DAIRY',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1,
                  color: isDark ? Colors.white : AppTheme.textDark,
                ),
              ),
              Text(
                '& DAILY NEEDS',
                style: TextStyle(
                  fontSize: 8,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primary,
                  letterSpacing: 1.5,
                ),
              ),
            ],
          ),
        ],
      ),
      actions: [
        Stack(
          children: [
            IconButton(
              icon: const Icon(Icons.notifications_none_rounded),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('🔔 You are all caught up on notifications!'),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
            ),
            Positioned(
              right: 8,
              top: 8,
              child: Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(color: Colors.amber, shape: BoxShape.circle),
              ),
            ),
          ],
        ),
        IconButton(
          icon: const Icon(Icons.person_outline_rounded),
          onPressed: () {
            if (authProvider.isAuthenticated) {
              _showProfileModal(context, authProvider);
            } else {
              Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen()));
            }
          },
        ),
        const SizedBox(width: 4),
      ],
    );
  }

  Widget _buildBottomNavBar(CartProvider cartProvider) {
    return BottomNavigationBar(
      currentIndex: _selectedNavIndex,
      onTap: (index) => setState(() => _selectedNavIndex = index),
      selectedItemColor: AppTheme.primary,
      unselectedItemColor: Colors.grey,
      type: BottomNavigationBarType.fixed,
      selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
      items: [
        const BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
        const BottomNavigationBarItem(icon: Icon(Icons.storefront_rounded), label: 'Products'),
        BottomNavigationBarItem(
          icon: Stack(
            children: [
              const Icon(Icons.shopping_cart_rounded),
              if (cartProvider.itemCount > 0)
                Positioned(
                  right: 0,
                  top: 0,
                  child: CircleAvatar(
                    radius: 7,
                    backgroundColor: Colors.red,
                    child: Text(
                      '${cartProvider.itemCount > 9 ? '9+' : cartProvider.itemCount}',
                      style: const TextStyle(fontSize: 8, color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
          label: 'Cart',
        ),
        const BottomNavigationBarItem(icon: Icon(Icons.favorite_rounded), label: 'Wishlist'),
        const BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
      ],
    );
  }

  // ============================================================
  //  TAB 0: HOME
  // ============================================================
  Widget _buildHomeTab(bool isDark, CartProvider cartProvider) {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero Banner
          _buildHeroBanner(),
          const SizedBox(height: 24),

          // Offers Row
          _buildOffersRow(isDark),
          const SizedBox(height: 24),

          // Categories
          Text(
            'Explore Categories',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: isDark ? Colors.white : AppTheme.textDark,
            ),
          ),
          const SizedBox(height: 12),
          _buildCategoryPills(isDark),
          const SizedBox(height: 24),

          // Fresh Products Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Fresh Products',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  color: isDark ? Colors.white : AppTheme.textDark,
                ),
              ),
              GestureDetector(
                onTap: () => setState(() => _selectedNavIndex = 1),
                child: Text(
                  'See All →',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          if (_isLoadingProducts)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(40.0),
                child: SpinKitFadingCube(color: AppTheme.primary, size: 30),
              ),
            )
          else if (_filteredProducts.isEmpty)
            _buildEmptyState(Icons.inbox, 'No products in "$_selectedCategory"')
          else
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _filteredProducts.take(6).length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.68,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemBuilder: (context, index) {
                return GestureDetector(
                  onTap: () => _showProductDetail(context, _filteredProducts[index], cartProvider),
                  child: ProductCard(product: _filteredProducts[index]),
                );
              },
            ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildHeroBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withValues(alpha: 0.3),
            blurRadius: 15,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Text(
              '✨ 100% PURE & FARM-FRESH',
              style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 10),
          const Text(
            'Fresh Milk & Pure Ghee\nDelivered Daily Before 7 AM',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w900,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: AppTheme.primary,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
            onPressed: () => setState(() => _selectedNavIndex = 1),
            child: const Text('Order Now 🥛', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }

  Widget _buildOffersRow(bool isDark) {
    final offers = [
      {'icon': Icons.local_shipping_outlined, 'title': 'Free Delivery', 'sub': 'On orders ₹200+', 'color': const Color(0xFF6C5CE7)},
      {'icon': Icons.verified_outlined, 'title': '100% Pure', 'sub': 'Farm-fresh quality', 'color': const Color(0xFF43A047)},
      {'icon': Icons.schedule_outlined, 'title': 'Daily 7 AM', 'sub': 'On-time delivery', 'color': const Color(0xFFFF7675)},
    ];

    return Row(
      children: offers.map((offer) {
        return Expanded(
          child: Container(
            margin: EdgeInsets.only(right: offer == offers.last ? 0 : 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.darkCard : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: (offer['color'] as Color).withValues(alpha: 0.2),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                Icon(offer['icon'] as IconData, color: offer['color'] as Color, size: 20),
                const SizedBox(height: 6),
                Text(
                  offer['title'] as String,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: isDark ? Colors.white : AppTheme.textDark,
                  ),
                  textAlign: TextAlign.center,
                ),
                Text(
                  offer['sub'] as String,
                  style: const TextStyle(fontSize: 9, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildCategoryPills(bool isDark) {
    return SizedBox(
      height: 38,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _categories.length,
        separatorBuilder: (context, index2) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final cat = _categories[index];
          final isSelected = cat == _selectedCategory;
          return GestureDetector(
            onTap: () => setState(() => _selectedCategory = cat),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? AppTheme.primary : (isDark ? AppTheme.darkCard : Colors.white),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? AppTheme.primary : (isDark ? Colors.grey.shade800 : Colors.grey.shade300),
                ),
              ),
              child: Text(
                cat,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: isSelected ? Colors.white : (isDark ? Colors.grey.shade300 : AppTheme.textDark),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  // ============================================================
  //  TAB 1: PRODUCTS CATALOG
  // ============================================================
  Widget _buildProductsTab(bool isDark, CartProvider cartProvider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Search Bar
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: TextField(
            controller: _searchController,
            onChanged: (v) => setState(() => _searchQuery = v),
            decoration: InputDecoration(
              hintText: 'Search dairy products...',
              prefixIcon: const Icon(Icons.search, color: AppTheme.primary),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 18),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                  : null,
              filled: true,
              fillColor: isDark ? AppTheme.darkCard : Colors.white,
              contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: Colors.grey.shade200),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: isDark ? Colors.grey.shade800 : Colors.grey.shade200),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: const BorderSide(color: AppTheme.primary, width: 1.5),
              ),
            ),
          ),
        ),

        // Category Pills
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: _buildCategoryPills(isDark),
        ),
        const SizedBox(height: 8),

        // Products header count
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: Text(
            '${_filteredProducts.length} products found',
            style: const TextStyle(fontSize: 12, color: Colors.grey),
          ),
        ),

        // Products grid
        Expanded(
          child: _isLoadingProducts
              ? const Center(child: SpinKitFadingCube(color: AppTheme.primary, size: 30))
              : _filteredProducts.isEmpty
                  ? _buildEmptyState(Icons.search_off, 'No products match your search')
                  : GridView.builder(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                      itemCount: _filteredProducts.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.68,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      itemBuilder: (context, index) {
                        return GestureDetector(
                          onTap: () => _showProductDetail(context, _filteredProducts[index], cartProvider),
                          child: ProductCard(product: _filteredProducts[index]),
                        );
                      },
                    ),
        ),
      ],
    );
  }

  // ============================================================
  //  TAB 2: CART
  // ============================================================
  Widget _buildCartTab(bool isDark, CartProvider cart, AuthProvider auth) {
    if (cart.cartItems.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.shopping_cart_outlined, size: 80, color: Colors.grey.shade300),
              const SizedBox(height: 16),
              Text(
                'Your cart is empty',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : AppTheme.textDark,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Add fresh dairy products from our catalog!',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.storefront_rounded, color: Colors.white),
                label: const Text('Browse Products', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                onPressed: () => setState(() => _selectedNavIndex = 1),
              ),
            ],
          ),
        ),
      );
    }

    final items = cart.cartItems.values.toList();

    return Column(
      children: [
        // Cart header
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Cart (${cart.itemCount} items)',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: isDark ? Colors.white : AppTheme.textDark,
                ),
              ),
              TextButton.icon(
                onPressed: () => _confirmClearCart(cart),
                icon: const Icon(Icons.delete_outline, size: 16, color: Colors.redAccent),
                label: const Text('Clear All', style: TextStyle(color: Colors.redAccent, fontSize: 13)),
              ),
            ],
          ),
        ),

        // Cart items
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            itemCount: items.length,
            itemBuilder: (context, index) {
              final prod = items[index]['product'] as ProductModel;
              final qty = items[index]['quantity'] as int;

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.darkCard : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    // Product image
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: AppTheme.primary.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Image.network(
                        prod.image,
                        fit: BoxFit.contain,
                        errorBuilder: (ctx2, error, stack) => const Icon(Icons.local_drink, color: AppTheme.primary),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            prod.name,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: isDark ? Colors.white : AppTheme.textDark,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${prod.unit} • ${prod.category}',
                            style: const TextStyle(fontSize: 11, color: Colors.grey),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '₹${(prod.finalPrice * qty).toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w900,
                                  color: AppTheme.primary,
                                ),
                              ),
                              // Quantity Stepper
                              Container(
                                decoration: BoxDecoration(
                                  color: isDark ? Colors.black26 : Colors.grey.shade100,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    GestureDetector(
                                      onTap: () => cart.removeFromCart(prod.id),
                                      child: Container(
                                        width: 32,
                                        height: 32,
                                        alignment: Alignment.center,
                                        child: const Icon(Icons.remove, size: 16, color: Colors.redAccent),
                                      ),
                                    ),
                                    SizedBox(
                                      width: 28,
                                      child: Text(
                                        '$qty',
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                      ),
                                    ),
                                    GestureDetector(
                                      onTap: () => cart.addToCart(prod),
                                      child: Container(
                                        width: 32,
                                        height: 32,
                                        alignment: Alignment.center,
                                        decoration: BoxDecoration(
                                          color: AppTheme.primary,
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: const Icon(Icons.add, size: 16, color: Colors.white),
                                      ),
                                    ),
                                  ],
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
            },
          ),
        ),

        // Order Summary & Checkout Bar
        Container(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
          decoration: BoxDecoration(
            color: isDark ? AppTheme.darkCard : Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 16,
                offset: const Offset(0, -4),
              ),
            ],
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: SafeArea(
            top: false,
            child: Column(
              children: [
                // Price breakdown
                _buildPriceRow('Subtotal', '₹${cart.totalAmount.toStringAsFixed(2)}'),
                const SizedBox(height: 4),
                _buildPriceRow('Delivery', cart.totalAmount >= 200 ? 'FREE 🎉' : '₹30.00'),
                const Divider(height: 16),
                _buildPriceRow(
                  'Total',
                  '₹${(cart.totalAmount + (cart.totalAmount >= 200 ? 0 : 30)).toStringAsFixed(2)}',
                  isBold: true,
                  color: AppTheme.primary,
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: () => _showCheckoutFlow(context, cart, auth),
                    child: const Text(
                      'Proceed to Checkout →',
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPriceRow(String label, String value, {bool isBold = false, Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isBold ? 15 : 13,
            fontWeight: isBold ? FontWeight.w900 : FontWeight.normal,
            color: isBold ? null : Colors.grey,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isBold ? 17 : 13,
            fontWeight: isBold ? FontWeight.w900 : FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  // ============================================================
  //  TAB 3: WISHLIST
  // ============================================================
  Widget _buildWishlistTab(bool isDark, CartProvider cart) {
    final wishlisted = _products.where((p) => cart.isWishlisted(p.id)).toList();

    if (wishlisted.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.favorite_border_rounded, size: 80, color: Colors.grey.shade300),
              const SizedBox(height: 16),
              Text(
                'No Wishlist Items',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : AppTheme.textDark,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Tap the ❤️ on any product to save it here.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
            ],
          ),
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Your Wishlist ❤️ (${wishlisted.length})',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: isDark ? Colors.white : AppTheme.textDark,
            ),
          ),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: wishlisted.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.68,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemBuilder: (context, index) => ProductCard(product: wishlisted[index]),
          ),
        ],
      ),
    );
  }

  // ============================================================
  //  TAB 4: PROFILE
  // ============================================================
  Widget _buildProfileTab(bool isDark, AuthProvider auth) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Column(
        children: [
          // Avatar
          Stack(
            children: [
              CircleAvatar(
                radius: 50,
                backgroundColor: AppTheme.primary.withValues(alpha: 0.15),
                child: const Icon(Icons.person, size: 60, color: AppTheme.primary),
              ),
              if (auth.isAuthenticated)
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check, size: 14, color: Colors.white),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            auth.currentUser?.displayName ?? (auth.isAuthenticated ? 'Customer Account' : 'Guest User'),
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : AppTheme.textDark,
            ),
          ),
          Text(
            auth.currentUser?.email ?? 'Sign in to access your orders',
            style: const TextStyle(fontSize: 13, color: Colors.grey),
          ),
          const SizedBox(height: 24),

          // Auth Actions
          if (!auth.isAuthenticated) ...[
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.login, color: Colors.white),
                label: const Text('Sign In', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen())),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: AppTheme.primary),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.person_add_outlined, color: AppTheme.primary),
                label: const Text('Create Account', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 15)),
                onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const RegisterScreen())),
              ),
            ),
            const SizedBox(height: 24),
          ],

          // Menu Items Card
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            elevation: 0,
            child: Column(
              children: [
                if (auth.isAuthenticated)
                  _buildMenuTile(
                    icon: Icons.shopping_bag_outlined,
                    title: 'My Orders',
                    subtitle: 'View your order history',
                    onTap: () => _showOrdersBottomSheet(context, auth),
                  ),
                _buildMenuTile(
                  icon: Icons.location_on_outlined,
                  title: 'Delivery Addresses',
                  subtitle: 'Manage delivery locations',
                  onTap: () => _showComingSoon(context, 'Delivery Addresses'),
                ),
                _buildMenuTile(
                  icon: Icons.subscriptions_outlined,
                  title: 'Daily Subscriptions',
                  subtitle: 'Manage your daily milk subscriptions',
                  onTap: () => _showComingSoon(context, 'Daily Subscriptions'),
                ),
                _buildMenuTile(
                  icon: Icons.notifications_outlined,
                  title: 'Notifications',
                  subtitle: 'Manage alerts and notifications',
                  onTap: () => _showComingSoon(context, 'Notifications'),
                ),
                _buildMenuTile(
                  icon: Icons.help_outline,
                  title: 'Help & Support',
                  subtitle: 'Get help with your orders',
                  onTap: () => _showComingSoon(context, 'Help & Support'),
                  isLast: true,
                ),
              ],
            ),
          ),

          if (auth.isAuthenticated) ...[
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red.shade50,
                  foregroundColor: Colors.red.shade700,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                icon: const Icon(Icons.logout),
                label: const Text('Log Out', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                onPressed: () => _confirmLogout(auth),
              ),
            ),
          ],

          const SizedBox(height: 20),
          // App Version
          Text(
            'Madhu Dairy & Daily Needs v1.0.0\nMade with ❤️ for fresh dairy lovers',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 11, color: Colors.grey.shade400, height: 1.5),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _buildMenuTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isLast = false,
  }) {
    return Column(
      children: [
        ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          leading: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppTheme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppTheme.primary, size: 20),
          ),
          title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
          subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: Colors.grey)),
          trailing: const Icon(Icons.chevron_right, color: Colors.grey),
          onTap: onTap,
        ),
        if (!isLast) const Divider(height: 1, indent: 60),
      ],
    );
  }

  // ============================================================
  //  MODALS & BOTTOM SHEETS
  // ============================================================

  void _showProductDetail(BuildContext context, ProductModel product, CartProvider cartProvider) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      backgroundColor: isDark ? AppTheme.darkCard : Colors.white,
      builder: (ctx) {
        return StatefulBuilder(builder: (ctx, setModalState) {
          final inCart = cartProvider.cartItems.containsKey(product.id);
          final qty = inCart ? (cartProvider.cartItems[product.id]!['quantity'] as int) : 0;

          return DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.75,
            maxChildSize: 0.92,
            builder: (_, scrollCtrl2) => SingleChildScrollView(
              controller: scrollCtrl2,
              child: Column(
                children: [
                  // Handle
                  Center(
                    child: Container(
                      margin: const EdgeInsets.only(top: 12, bottom: 8),
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),

                  // Product Image
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 20),
                    height: 200,
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withValues(alpha: 0.07),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Stack(
                      children: [
                        Center(
                          child: Image.network(
                            product.image,
                            height: 160,
                            fit: BoxFit.contain,
                            errorBuilder: (ctx2, error, stack) => const Icon(Icons.local_drink, size: 80, color: AppTheme.primary),
                          ),
                        ),
                        if (product.discount > 0)
                          Positioned(
                            top: 12,
                            left: 12,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.redAccent,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                '${product.discount.toInt()}% OFF',
                                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                        Positioned(
                          top: 12,
                          right: 12,
                          child: GestureDetector(
                            onTap: () {
                              cartProvider.toggleWishlist(product.id);
                              setModalState(() {});
                            },
                            child: CircleAvatar(
                              radius: 18,
                              backgroundColor: Colors.white,
                              child: Icon(
                                cartProvider.isWishlisted(product.id) ? Icons.favorite : Icons.favorite_border,
                                color: cartProvider.isWishlisted(product.id) ? Colors.red : Colors.grey,
                                size: 20,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Details
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Category badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '${product.category} • ${product.unit}',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primary,
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),

                        // Name
                        Text(
                          product.name,
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: isDark ? Colors.white : AppTheme.textDark,
                          ),
                        ),
                        const SizedBox(height: 8),

                        // Price row
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '₹${product.finalPrice.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.w900,
                                color: AppTheme.primary,
                              ),
                            ),
                            if (product.discount > 0) ...[
                              const SizedBox(width: 8),
                              Text(
                                '₹${product.price.toStringAsFixed(2)}',
                                style: TextStyle(
                                  fontSize: 15,
                                  color: Colors.grey.shade500,
                                  decoration: TextDecoration.lineThrough,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: Colors.green.shade50,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  'Save ₹${(product.price - product.finalPrice).toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.green,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Stock info
                        Row(
                          children: [
                            Icon(
                              product.stock > 0 ? Icons.check_circle : Icons.cancel,
                              size: 14,
                              color: product.stock > 0 ? Colors.green : Colors.red,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              product.stock > 0 ? 'In Stock (${product.stock} units)' : 'Out of Stock',
                              style: TextStyle(
                                fontSize: 13,
                                color: product.stock > 0 ? Colors.green : Colors.red,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Description
                        if (product.description != null && product.description!.isNotEmpty) ...[
                          Text(
                            'About This Product',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: isDark ? Colors.white : AppTheme.textDark,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            product.description!,
                            style: const TextStyle(fontSize: 13, color: Colors.grey, height: 1.5),
                          ),
                          const SizedBox(height: 20),
                        ],

                        // Quantity & Add to Cart
                        if (qty == 0)
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primary,
                                padding: const EdgeInsets.symmetric(vertical: 15),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                              icon: const Icon(Icons.add_shopping_cart, color: Colors.white),
                              label: const Text('Add to Cart', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                              onPressed: () {
                                cartProvider.addToCart(product);
                                setModalState(() {});
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('${product.name} added to cart!'),
                                    duration: const Duration(seconds: 1),
                                    behavior: SnackBarBehavior.floating,
                                    backgroundColor: AppTheme.primary,
                                  ),
                                );
                              },
                            ),
                          )
                        else
                          Row(
                            children: [
                              Expanded(
                                child: Container(
                                  decoration: BoxDecoration(
                                    border: Border.all(color: AppTheme.primary),
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.remove, color: Colors.redAccent),
                                        onPressed: () {
                                          cartProvider.removeFromCart(product.id);
                                          setModalState(() {});
                                        },
                                      ),
                                      Text(
                                        '$qty',
                                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.add, color: AppTheme.primary),
                                        onPressed: () {
                                          cartProvider.addToCart(product);
                                          setModalState(() {});
                                        },
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppTheme.primary,
                                    padding: const EdgeInsets.symmetric(vertical: 15),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                  ),
                                  onPressed: () {
                                    Navigator.pop(ctx);
                                    setState(() => _selectedNavIndex = 2);
                                  },
                                  child: const Text('View Cart', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                ),
                              ),
                            ],
                          ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        });
      },
    );
  }

  void _showCheckoutFlow(BuildContext context, CartProvider cart, AuthProvider auth) {
    if (!auth.isAuthenticated) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Sign In Required', style: TextStyle(fontWeight: FontWeight.bold)),
          content: const Text('Please sign in to place your order and track deliveries.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen()));
              },
              child: const Text('Sign In', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      );
      return;
    }

    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final addressController = TextEditingController();
    final pincodeController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    String selectedPayment = 'COD';
    bool isPlacingOrder = false;

    final isDark = Theme.of(context).brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
      backgroundColor: isDark ? AppTheme.darkCard : Colors.white,
      builder: (ctx) {
        return StatefulBuilder(builder: (ctx, setModalState) {
          return Padding(
            padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
            child: DraggableScrollableSheet(
              expand: false,
              initialChildSize: 0.85,
              maxChildSize: 0.95,
              builder: (_, scrollCtrl) => SingleChildScrollView(
                controller: scrollCtrl,
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          width: 40, height: 4,
                          decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Checkout 🛒',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.white : AppTheme.textDark,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${cart.itemCount} items • ₹${(cart.totalAmount + (cart.totalAmount >= 200 ? 0 : 30)).toStringAsFixed(2)} total',
                        style: const TextStyle(color: Colors.grey),
                      ),
                      const SizedBox(height: 24),

                      // Delivery Details
                      Text(
                        'Delivery Details',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: isDark ? Colors.white : AppTheme.textDark,
                        ),
                      ),
                      const SizedBox(height: 12),

                      _buildCheckoutField(nameController, 'Full Name', 'Enter your name', Icons.person_outline, (v) {
                        if (v == null || v.trim().isEmpty) return 'Name is required';
                        return null;
                      }),
                      const SizedBox(height: 12),
                      _buildCheckoutField(phoneController, 'Mobile Number', '10-digit mobile number', Icons.phone_outlined,
                          (v) {
                        if (v == null || v.trim().isEmpty) return 'Phone is required';
                        if (v.trim().length < 10) return 'Enter a valid 10-digit number';
                        return null;
                      }, type: TextInputType.phone),
                      const SizedBox(height: 12),
                      _buildCheckoutField(addressController, 'Delivery Address', 'House no., Street, Area', Icons.location_on_outlined, (v) {
                        if (v == null || v.trim().isEmpty) return 'Address is required';
                        return null;
                      }, maxLines: 2),
                      const SizedBox(height: 12),
                      _buildCheckoutField(pincodeController, 'Pincode', '6-digit pincode', Icons.pin_drop_outlined, (v) {
                        if (v == null || v.trim().isEmpty) return 'Pincode is required';
                        if (v.trim().length != 6) return 'Enter a valid 6-digit pincode';
                        return null;
                      }, type: TextInputType.number),
                      const SizedBox(height: 20),

                      // Payment Method
                      Text(
                        'Payment Method',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: isDark ? Colors.white : AppTheme.textDark,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          _buildPaymentOption('COD', 'Cash on Delivery', Icons.money, selectedPayment, (v) => setModalState(() => selectedPayment = v!)),
                          const SizedBox(width: 10),
                          _buildPaymentOption('ONLINE', 'Online Payment', Icons.payment, selectedPayment, (v) => setModalState(() => selectedPayment = v!)),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Place Order button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: isPlacingOrder
                              ? null
                              : () async {
                                  if (!formKey.currentState!.validate()) return;
                                  setModalState(() => isPlacingOrder = true);

                                  final orderItems = cart.cartItems.values.map((item) {
                                    final prod = item['product'] as ProductModel;
                                    return {
                                      'productId': prod.id,
                                      'name': prod.name,
                                      'quantity': item['quantity'],
                                      'price': prod.finalPrice,
                                    };
                                  }).toList();

                                  final result = await OrderService.placeOrder(
                                    token: auth.currentUser?.token ?? '',
                                    items: orderItems,
                                    totalAmount: cart.totalAmount + (cart.totalAmount >= 200 ? 0 : 30),
                                    address: {
                                      'name': nameController.text.trim(),
                                      'phone': phoneController.text.trim(),
                                      'address': addressController.text.trim(),
                                      'pincode': pincodeController.text.trim(),
                                    },
                                    paymentMethod: selectedPayment,
                                  );

                                  setModalState(() => isPlacingOrder = false);
                                  if (!ctx.mounted) return;
                                  Navigator.pop(ctx);

                                  cart.clearCart();
                                  setState(() => _selectedNavIndex = 0);

                                  if (!context.mounted) return;
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(result['success'] == true
                                          ? '🎉 Order placed successfully! Delivering before 7 AM.'
                                          : '✅ Order received! (Demo mode)'),
                                      backgroundColor: Colors.green,
                                      behavior: SnackBarBehavior.floating,
                                      duration: const Duration(seconds: 3),
                                    ),
                                  );
                                },
                          child: isPlacingOrder
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                )
                              : const Text(
                                  'Place Order 🥛',
                                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                                ),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),
            ),
          );
        });
      },
    );
  }

  Widget _buildCheckoutField(
    TextEditingController controller,
    String label,
    String hint,
    IconData icon,
    String? Function(String?) validator, {
    TextInputType type = TextInputType.text,
    int maxLines = 1,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: type,
      maxLines: maxLines,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon, color: AppTheme.primary, size: 20),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.primary, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  Widget _buildPaymentOption(String value, String label, IconData icon, String groupValue, ValueChanged<String?> onChanged) {
    final isSelected = value == groupValue;
    return Expanded(
      child: GestureDetector(
        onTap: () => onChanged(value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.primary.withValues(alpha: 0.1) : Colors.grey.shade100,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppTheme.primary : Colors.grey.shade300,
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Row(
            children: [
              Icon(icon, color: isSelected ? AppTheme.primary : Colors.grey, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected ? AppTheme.primary : Colors.grey.shade600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showOrdersBottomSheet(BuildContext context, AuthProvider auth) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    _loadUserOrders(auth.currentUser?.token ?? '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
      backgroundColor: isDark ? AppTheme.darkCard : Colors.white,
      builder: (ctx) {
        return StatefulBuilder(builder: (ctx, setModalState) {
          return DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.75,
            maxChildSize: 0.95,
            builder: (_, scrollCtrl) => Column(
              children: [
                Center(
                  child: Container(
                    margin: const EdgeInsets.only(top: 12),
                    width: 40, height: 4,
                    decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'My Orders',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: isDark ? Colors.white : AppTheme.textDark,
                        ),
                      ),
                      TextButton.icon(
                        onPressed: () {
                          setModalState(() {});
                          _loadUserOrders(auth.currentUser?.token ?? '');
                        },
                        icon: const Icon(Icons.refresh, size: 16),
                        label: const Text('Refresh'),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: _isLoadingOrders
                      ? const Center(child: SpinKitFadingCube(color: AppTheme.primary, size: 28))
                      : _userOrders.isEmpty
                          ? Center(
                              child: Padding(
                                padding: const EdgeInsets.all(32.0),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.receipt_long_outlined, size: 64, color: Colors.grey.shade300),
                                    const SizedBox(height: 16),
                                    const Text('No orders yet', style: TextStyle(fontSize: 18, color: Colors.grey, fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 8),
                                    const Text('Your order history will appear here', style: TextStyle(color: Colors.grey)),
                                  ],
                                ),
                              ),
                            )
                          : ListView.builder(
                              controller: scrollCtrl,
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              itemCount: _userOrders.length,
                              itemBuilder: (_, i) => _buildOrderCard(_userOrders[i], isDark),
                            ),
                ),
              ],
            ),
          );
        });
      },
    );
  }

  Widget _buildOrderCard(Map<String, dynamic> order, bool isDark) {
    final status = (order['status'] ?? 'pending').toString().toUpperCase();
    final total = (order['totalAmount'] as num?)?.toStringAsFixed(2) ?? '0.00';
    final itemCount = (order['items'] as List?)?.length ?? 0;
    final createdAt = order['createdAt']?.toString() ?? '';

    Color statusColor;
    switch (status.toLowerCase()) {
      case 'delivered': statusColor = Colors.green; break;
      case 'cancelled': statusColor = Colors.red; break;
      case 'out for delivery': statusColor = Colors.blue; break;
      default: statusColor = Colors.orange;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkBg : Colors.grey.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? Colors.grey.shade800 : Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Order #${(order['_id'] ?? order['id'] ?? 'N/A').toString().substring(0, 8).toUpperCase()}',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : AppTheme.textDark,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(status, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: statusColor)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '$itemCount item${itemCount != 1 ? 's' : ''} • ₹$total',
            style: const TextStyle(color: Colors.grey, fontSize: 13),
          ),
          if (createdAt.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              createdAt.length > 10 ? createdAt.substring(0, 10) : createdAt,
              style: const TextStyle(color: Colors.grey, fontSize: 11),
            ),
          ],
        ],
      ),
    );
  }

  void _showProfileModal(BuildContext context, AuthProvider auth) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircleAvatar(
                radius: 30,
                backgroundColor: AppTheme.primary,
                child: Icon(Icons.person, size: 36, color: Colors.white),
              ),
              const SizedBox(height: 12),
              Text(
                auth.currentUser?.displayName ?? 'Customer Account',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              Text(auth.currentUser?.email ?? '', style: const TextStyle(fontSize: 13, color: Colors.grey)),
              const SizedBox(height: 24),
              ListTile(
                leading: const Icon(Icons.shopping_bag_outlined, color: AppTheme.primary),
                title: const Text('My Orders'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  Navigator.pop(context);
                  setState(() => _selectedNavIndex = 4);
                },
              ),
              ListTile(
                leading: const Icon(Icons.logout, color: Colors.redAccent),
                title: const Text('Logout', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                onTap: () {
                  Navigator.pop(context);
                  _confirmLogout(auth);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _confirmClearCart(CartProvider cart) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Clear Cart?', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('This will remove all items from your cart.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () {
              cart.clearCart();
              Navigator.pop(ctx);
            },
            child: const Text('Clear', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _confirmLogout(AuthProvider auth) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Log Out?', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Are you sure you want to log out of your account?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () {
              auth.logout();
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Logged out successfully.')),
              );
            },
            child: const Text('Log Out', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showComingSoon(BuildContext context, String feature) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$feature coming soon! 🚀'),
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppTheme.primary,
      ),
    );
  }

  Widget _buildEmptyState(IconData icon, String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 56, color: Colors.grey.shade300),
            const SizedBox(height: 12),
            Text(message, style: const TextStyle(color: Colors.grey, fontSize: 14), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
