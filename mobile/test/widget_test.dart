import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('Madhu Dairy App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const MadhuDairyApp());
  });
}
