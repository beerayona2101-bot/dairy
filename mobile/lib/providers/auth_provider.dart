import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

enum AuthStatus {
  initializing,
  unauthenticated,
  authenticated,
  guest,
}

class AuthProvider with ChangeNotifier {
  UserModel? _currentUser;
  AuthStatus _status = AuthStatus.initializing;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get currentUser => _currentUser;
  AuthStatus get status => _status;
  bool get isAuthenticated => _status == AuthStatus.authenticated && _currentUser != null;
  bool get isGuest => _status == AuthStatus.guest;
  bool get isInitializing => _status == AuthStatus.initializing;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> initAuth() async {
    _status = AuthStatus.initializing;
    _isLoading = true;

    try {
      final token = await AuthService.getToken();
      final userId = await AuthService.getUserId();
      final email = await AuthService.getUserEmail();

      if (token != null && token.isNotEmpty && userId != null && userId.isNotEmpty) {
        // Validate session with backend if possible
        final isValid = await AuthService.validateSession(token: token, userId: userId);
        if (isValid) {
          _currentUser = UserModel(
            id: userId,
            email: email ?? 'user@madhudairy.com',
            token: token,
          );
          _status = AuthStatus.authenticated;
        } else {
          // Session expired or rejected -> clear invalid storage
          await AuthService.clearSession();
          _currentUser = null;
          _status = AuthStatus.unauthenticated;
        }
      } else {
        _currentUser = null;
        _status = AuthStatus.unauthenticated;
      }
    } catch (_) {
      _currentUser = null;
      _status = AuthStatus.unauthenticated;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void continueAsGuest() {
    _currentUser = null;
    _status = AuthStatus.guest;
    _errorMessage = null;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _errorMessage = null;

    final result = await AuthService.login(email, password);
    _setLoading(false);

    if (result['success'] == true && result['user'] is UserModel) {
      _currentUser = result['user'] as UserModel;
      _status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } else {
      _errorMessage = result['message'] ?? 'Login failed. Please check credentials.';
      _status = AuthStatus.unauthenticated;
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
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  void _setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }
}

