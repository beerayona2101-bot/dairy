import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'config/api_config.dart';
import 'config/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'screens/mobile_web_view_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/splash_screen.dart';
import 'services/fcm_service.dart';

class MyHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback =
          (X509Certificate cert, String host, int port) => true;
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (!kIsWeb) {
    HttpOverrides.global = MyHttpOverrides();
  }
  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  } catch (e) {
    debugPrint("Firebase init notice: $e");
  }

  runApp(const NaturalMilkDairyApp());

  // Initialize FCM in background without blocking the UI rendering
  FcmService.initialize().catchError((e) {
    debugPrint("FCM init background error: $e");
  });
}

class NaturalMilkDairyApp extends StatelessWidget {
  const NaturalMilkDairyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..initAuth()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
      ],
      child: MaterialApp(
        title: 'Natural Milk Dairy & Daily Needs',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.light,
        home: const SplashScreen(),
      ),
    );
  }
}

class AppStartupGate extends StatelessWidget {
  const AppStartupGate({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    if (authProvider.isInitializing || authProvider.isLoading) {
      return const Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: SizedBox(
            width: 28,
            height: 28,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0756B5)),
            ),
          ),
        ),
      );
    }

    if (authProvider.isAuthenticated) {
      return const MobileWebViewScreen();
    }

    return const OnboardingScreen();
  }
}
