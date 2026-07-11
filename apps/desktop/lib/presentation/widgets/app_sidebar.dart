import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class AppSidebar extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;
  final bool isDarkMode;
  final VoidCallback onThemeToggle;

  const AppSidebar({
    super.key,
    required this.selectedIndex,
    required this.onDestinationSelected,
    required this.isDarkMode,
    required this.onThemeToggle,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      width: 220,
      color: theme.navigationRailTheme.backgroundColor,
      child: Column(
        children: [
          const SizedBox(height: 24),
          _buildHeader(theme, isDark),
          const SizedBox(height: 32),
          Expanded(child: _buildNavItems(theme)),
          const Divider(height: 1),
          _buildThemeToggle(theme, isDark),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildHeader(ThemeData theme, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.primaryDark, AppColors.primaryDarkHover],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.sync_alt, size: 24, color: Colors.white),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'SyncStuff',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                'Desktop',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: isDark
                      ? AppColors.textMutedDark
                      : AppColors.textMutedLight,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNavItems(ThemeData theme) {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      children: [
        _NavItem(
          icon: Icons.devices_outlined,
          selectedIcon: Icons.devices,
          label: 'Devices',
          isSelected: selectedIndex == 0,
          onTap: () => onDestinationSelected(0),
        ),
        const SizedBox(height: 4),
        _NavItem(
          icon: Icons.swap_horiz_outlined,
          selectedIcon: Icons.swap_horiz,
          label: 'Transfers',
          isSelected: selectedIndex == 1,
          onTap: () => onDestinationSelected(1),
        ),
        const SizedBox(height: 4),
        _NavItem(
          icon: Icons.devices_other_outlined,
          selectedIcon: Icons.devices_other,
          label: 'Groups',
          isSelected: selectedIndex == 2,
          onTap: () => onDestinationSelected(2),
        ),
        const SizedBox(height: 4),
        _NavItem(
          icon: Icons.content_paste_outlined,
          selectedIcon: Icons.content_paste,
          label: 'Clipboard',
          isSelected: selectedIndex == 3,
          onTap: () => onDestinationSelected(3),
        ),
        const SizedBox(height: 4),
        _NavItem(
          icon: Icons.settings_outlined,
          selectedIcon: Icons.settings,
          label: 'Settings',
          isSelected: selectedIndex == 4,
          onTap: () => onDestinationSelected(4),
        ),
      ],
    );
  }

  Widget _buildThemeToggle(ThemeData theme, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Row(
        children: [
          Icon(
            isDark ? Icons.dark_mode_outlined : Icons.light_mode_outlined,
            size: 20,
            color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              isDark ? 'Dark Mode' : 'Light Mode',
              style: theme.textTheme.bodyMedium,
            ),
          ),
          Switch(value: isDark, onChanged: (_) => onThemeToggle()),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData selectedIcon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.selectedIcon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: isSelected
                ? theme.colorScheme.primary.withValues(alpha: 0.12)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Icon(
                isSelected ? selectedIcon : icon,
                size: 22,
                color: isSelected
                    ? theme.colorScheme.primary
                    : isDark
                    ? AppColors.textMutedDark
                    : AppColors.textMutedLight,
              ),
              const SizedBox(width: 12),
              Text(
                label,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: isSelected
                      ? theme.colorScheme.primary
                      : isDark
                      ? AppColors.textSecondaryDark
                      : AppColors.textSecondaryLight,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
