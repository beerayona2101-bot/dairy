import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  UserModel? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> initAuth() async {
    _isLoading = true;

    final token = await AuthService.getToken();
    final userId = await AuthService.getUserId();

    if (token != null && userId != null && userId.isNotEmpty) {
      _currentUser = UserModel(id: userId, email: 'user@madhudairy.com', token: token);
    } else {
      _currentUser = null;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _errorMessage = null;

    final result = await AuthService.login(email, password);
    _setLoading(false);

    if (result['success'] == true && result['user'] is UserModel) {
      _currentUser = result['user'] as UserModel;
      notifyListeners();
      return true;
    } else {
      _errorMessage = result['message'] ?? 'Login failed. Please check credentials.';
      notifyListeners();
      return false;
    }
  }

  Future<bool> signup(String email, String password, String confirmPassword) async {
    _setLoading(true);
    _errorMessage = null;

    final result = await AuthService.signup(email, password, confirmPassword);
    _setLoading(false);

    if (result['success'] == true) {
      notifyListeners();
      return true;
    } else {
      _errorMessage = result['message'] ?? 'Registration failed.';
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await AuthService.clearSession();
    _currentUser = null;
    notifyListeners();
  }

  void _setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }
}
