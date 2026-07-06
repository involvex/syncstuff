import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:syncstuff_desktop/presentation/bloc/settings/settings_bloc.dart';
import 'package:syncstuff_desktop/presentation/bloc/settings/settings_event.dart';
import 'package:syncstuff_desktop/presentation/pages/settings_page.dart';

void main() {
  group('SettingsPage', () {
    late SharedPreferences prefs;
    late SettingsBloc settingsBloc;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      prefs = await SharedPreferences.getInstance();
      settingsBloc = SettingsBloc(prefs);
    });

    tearDown(() {
      settingsBloc.close();
    });

    Widget buildTestWidget() {
      return MaterialApp(
        home: BlocProvider<SettingsBloc>(
          create: (_) => settingsBloc..add(LoadSettings()),
          child: const Scaffold(body: SettingsPage()),
        ),
      );
    }

    testWidgets('renders settings page with header', (tester) async {
      await tester.pumpWidget(buildTestWidget());
      await tester.pumpAndSettle();

      expect(find.text('Settings'), findsOneWidget);
      expect(find.text('Customize your SyncStuff experience'), findsOneWidget);
    });

    testWidgets('renders device name tile', (tester) async {
      await tester.pumpWidget(buildTestWidget());
      await tester.pumpAndSettle();

      expect(find.text('Device Name'), findsOneWidget);
    });

    testWidgets('renders dark mode toggle', (tester) async {
      await tester.pumpWidget(buildTestWidget());
      await tester.pumpAndSettle();

      expect(find.text('Dark Mode'), findsOneWidget);
    });

    testWidgets('renders auto pair toggle', (tester) async {
      await tester.pumpWidget(buildTestWidget());
      await tester.pumpAndSettle();

      expect(find.text('Auto Pair'), findsOneWidget);
    });

    testWidgets('has correct initial state', (tester) async {
      await tester.pumpWidget(buildTestWidget());
      await tester.pumpAndSettle();

      expect(settingsBloc.state.isDarkMode, false);
      expect(settingsBloc.state.deviceName, 'My PC');
      expect(settingsBloc.state.notificationsEnabled, true);
    });

    testWidgets('contains ListView', (tester) async {
      await tester.pumpWidget(buildTestWidget());
      await tester.pumpAndSettle();

      expect(find.byType(ListView), findsOneWidget);
    });

    testWidgets('contains Switch widgets for toggles', (tester) async {
      await tester.pumpWidget(buildTestWidget());
      await tester.pumpAndSettle();

      expect(find.byType(Switch), findsWidgets);
    });
  });
}
