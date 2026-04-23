import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/settings/settings_bloc.dart';
import '../bloc/settings/settings_event.dart';
import '../bloc/settings/settings_state.dart';
import '../widgets/app_sidebar.dart';
import 'devices_page.dart';
import 'transfers_page.dart';
import 'settings_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SettingsBloc, SettingsState>(
      builder: (context, settingsState) {
        return Scaffold(
          body: Row(
            children: [
              AppSidebar(
                selectedIndex: _currentIndex,
                onDestinationSelected: (index) =>
                    setState(() => _currentIndex = index),
                isDarkMode: settingsState.isDarkMode,
                onThemeToggle: () {
                  context.read<SettingsBloc>().add(ToggleDarkMode());
                },
              ),
              const VerticalDivider(width: 1, thickness: 1),
              Expanded(
                child: IndexedStack(
                  index: _currentIndex,
                  children: const [
                    DevicesPage(),
                    TransfersPage(),
                    SettingsPage(),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
