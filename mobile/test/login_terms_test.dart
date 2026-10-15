import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/screens/login_screen.dart';

void main() {
  testWidgets('LoginScreen displays Terms & Conditions checkbox and validates acceptance', (WidgetTester tester) async {
    final authProvider = AuthProvider();

    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider<AuthProvider>.value(value: authProvider),
        ],
        child: const MaterialApp(
          home: LoginScreen(),
        ),
      ),
    );

    await tester.pump();

    // 1. Verify checkbox and Terms text are present
    expect(find.byType(Checkbox), findsOneWidget);
    expect(find.textContaining('Terms & Conditions'), findsOneWidget);
    expect(find.textContaining('Privacy Policy'), findsOneWidget);

    // Verify checkbox is initially checked
    Checkbox checkbox = tester.widget(find.byType(Checkbox));
    expect(checkbox.value, isTrue);

    // 2. Uncheck the checkbox
    await tester.tap(find.byType(Checkbox));
    await tester.pump();

    checkbox = tester.widget(find.byType(Checkbox));
    expect(checkbox.value, isFalse);

    // 3. Fill in email and password
    await tester.enterText(find.byType(TextFormField).first, 'test@example.com');
    await tester.enterText(find.byType(TextFormField).last, 'password123');
    await tester.pump();

    // 4. Tap Sign In with unchecked terms
    await tester.tap(find.text('Sign In'));
    await tester.pump();

    // Verify SnackBar warning appears
    expect(find.textContaining('Please accept the Terms & Conditions'), findsOneWidget);

    // 5. Tap on the Terms text to open the modal bottom sheet
    await tester.tap(find.textContaining('I agree to the'));
    await tester.pumpAndSettle();

    // Verify Terms modal opened
    expect(find.text('Terms & Privacy Policy'), findsOneWidget);
    expect(find.text('I Understand & Accept'), findsOneWidget);

    // 6. Tap Accept button
    await tester.tap(find.text('I Understand & Accept'));
    await tester.pumpAndSettle();

    // Verify modal is closed and checkbox is re-checked
    expect(find.text('Terms & Privacy Policy'), findsNothing);
    checkbox = tester.widget(find.byType(Checkbox));
    expect(checkbox.value, isTrue);
  });
}
