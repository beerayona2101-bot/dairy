import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/providers/cart_provider.dart';
import 'package:mobile/screens/splash_screen.dart';
import 'package:mobile/screens/onboarding_screen.dart';
import 'package:mobile/services/auth_service.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  Widget createTestApp({AuthProvider? authProvider, Widget? home}) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthProvider>(
          create: (_) => authProvider ?? AuthProvider(),
        ),
        ChangeNotifierProvider<CartProvider>(
          create: (_) => CartProvider(),
        ),
      ],
      child: MaterialApp(
        home: home ?? const SplashScreen(),
      ),
    );
  }

  group('Onboarding & Authentication Flow Requirements', () {
    test('TEST 1: New User Unauthenticated Startup -> Shows Onboarding', () async {
      SharedPreferences.setMockInitialValues({}); // No stored tokens
      final auth = AuthProvider();
      await auth.initAuth();

      expect(auth.status, equals(AuthStatus.unauthenticated));
      expect(auth.isAuthenticated, isFalse);
    });

    test('TEST 1 (cont): Authenticated User Startup -> Skips Onboarding', () async {
      SharedPreferences.setMockInitialValues({
        AuthService.keyToken: 'valid_jwt_token_123',
        AuthService.keyUserId: 'user_id_456',
        AuthService.keyUserEmail: 'testuser@madhudairy.com',
      });

      final auth = AuthProvider();
      await auth.initAuth();

      expect(auth.status, equals(AuthStatus.authenticated));
      expect(auth.isAuthenticated, isTrue);
      expect(auth.currentUser?.id, equals('user_id_456'));
    });

    test('TEST 2: Guest Mode -> Cold restart must show onboarding again', () async {
      final auth = AuthProvider();
      auth.continueAsGuest();

      expect(auth.status, equals(AuthStatus.guest));
      expect(auth.isGuest, isTrue);
      expect(auth.isAuthenticated, isFalse); // Guest is NOT authenticated

      // Simulate App Restart (cold start restores from SharedPreferences)
      final restartedAuth = AuthProvider();
      await restartedAuth.initAuth();

      // On restart, without auth token, must be unauthenticated -> shows onboarding
      expect(restartedAuth.status, equals(AuthStatus.unauthenticated));
      expect(restartedAuth.isAuthenticated, isFalse);
    });

    test('TEST 3: Guest to Login -> Permanently skips onboarding while logged in', () async {
      final auth = AuthProvider();
      auth.continueAsGuest();
      expect(auth.isAuthenticated, isFalse);

      // Save token simulating login
      await AuthService.saveSession(
        token: 'auth_token_789',
        userId: 'user_789',
        email: 'guest_converted@madhudairy.com',
      );

      final restartedAuth = AuthProvider();
      await restartedAuth.initAuth();

      expect(restartedAuth.status, equals(AuthStatus.authenticated));
      expect(restartedAuth.isAuthenticated, isTrue);
    });

    test('TEST 4: Logout -> Unauthenticated on next restart', () async {
      await AuthService.saveSession(
        token: 'logout_token',
        userId: 'logout_user',
        email: 'logout@madhudairy.com',
      );

      final auth = AuthProvider();
      await auth.initAuth();
      expect(auth.isAuthenticated, isTrue);

      // Perform logout
      await auth.logout();
      expect(auth.isAuthenticated, isFalse);
      expect(auth.status, equals(AuthStatus.unauthenticated));

      // Restart app
      final restartedAuth = AuthProvider();
      await restartedAuth.initAuth();
      expect(restartedAuth.status, equals(AuthStatus.unauthenticated));
      expect(restartedAuth.isAuthenticated, isFalse);
    });

    test('TEST 5: App Restart Before Login -> Onboarding appears every time', () async {
      SharedPreferences.setMockInitialValues({});
      for (int i = 0; i < 3; i++) {
        final auth = AuthProvider();
        await auth.initAuth();
        expect(auth.isAuthenticated, isFalse);
        expect(auth.status, equals(AuthStatus.unauthenticated));
      }
    });

    test('TEST 6: Session Expired -> Clears session and status is unauthenticated', () async {
      // Simulate expired or cleared session
      await AuthService.clearSession();

      final auth = AuthProvider();
      await auth.initAuth();
      expect(auth.status, equals(AuthStatus.unauthenticated));
      expect(auth.isAuthenticated, isFalse);
    });

    testWidgets('OnboardingScreen UI: Final screen displays LOGIN and CONTINUE AS GUEST, zero tour/demo wording',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        createTestApp(
          home: const OnboardingScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Ensure no forbidden tour/demo text exists anywhere
      final forbiddenTerms = [
        'Tour',
        'Take a Tour',
        'App Tour',
        'Demo',
        'Watch Demo',
        'Explore Demo',
        'Try Demo',
        'Product Tour',
        'Skip Tour',
        'View Demo',
      ];

      for (final term in forbiddenTerms) {
        expect(find.text(term), findsNothing, reason: 'Must not display "$term"');
      }

      // Check first slide content
      expect(find.text('Pure & Farm-Fresh Milk'), findsOneWidget);

      // Navigate to the final slide (Slide 4)
      final pageViewFinder = find.byType(PageView);
      expect(pageViewFinder, findsOneWidget);

      // Jump to last page
      final PageView pageView = tester.widget(pageViewFinder);
      pageView.controller?.jumpToPage(3);
      await tester.pumpAndSettle();

      // Final screen entry actions must be visible
      expect(find.text('LOGIN'), findsOneWidget);
      expect(find.text('CONTINUE AS GUEST'), findsOneWidget);
    });
  });
}
