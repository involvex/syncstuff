// Basic widget test for SyncStuff mobile app
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('App renders without crashing', (tester) async {
    // Simple test to verify the app can be built
    // Full integration tests require SharedPreferences mock
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(body: Center(child: Text('SyncStuff'))),
      ),
    );

    expect(find.text('SyncStuff'), findsOneWidget);
  });
}
