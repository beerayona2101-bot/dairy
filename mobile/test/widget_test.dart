import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('Natural Milk Dairy App smoke test', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const NaturalMilkDairyApp());
    await tester.pumpAndSettle(const Duration(seconds: 3));
  });
}


