import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme/app_colors.dart';

enum TransferUiStatus { pending, inProgress, completed, failed }

enum TransferUiType { sent, received }

class TransferCard extends StatelessWidget {
  final String fileName;
  final int fileSize;
  final TransferUiType type;
  final TransferUiStatus status;
  final double? progress;
  final String? deviceName;
  final DateTime? timestamp;
  final VoidCallback? onCancel;
  final VoidCallback? onRetry;
  final VoidCallback? onOpen;

  const TransferCard({
    super.key,
    required this.fileName,
    required this.fileSize,
    required this.type,
    this.status = TransferUiStatus.pending,
    this.progress,
    this.deviceName,
    this.timestamp,
    this.onCancel,
    this.onRetry,
    this.onOpen,
  });

  String get _formattedSize {
    if (fileSize < 1024) return '$fileSize B';
    if (fileSize < 1024 * 1024) {
      return '${(fileSize / 1024).toStringAsFixed(1)} KB';
    }
    if (fileSize < 1024 * 1024 * 1024) {
      return '${(fileSize / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(fileSize / (1024 * 1024 * 1024)).toStringAsFixed(2)} GB';
  }

  IconData get _fileIcon {
    final ext = fileName.split('.').last.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
        return Icons.image_outlined;
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
        return Icons.video_file_outlined;
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'aac':
        return Icons.audio_file_outlined;
      case 'pdf':
        return Icons.picture_as_pdf_outlined;
      case 'doc':
      case 'docx':
        return Icons.description_outlined;
      case 'xls':
      case 'xlsx':
        return Icons.table_chart_outlined;
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return Icons.folder_zip_outlined;
      case 'exe':
      case 'msi':
      case 'dmg':
      case 'apk':
        return Icons.apps_outlined;
      default:
        return Icons.insert_drive_file_outlined;
    }
  }

  Color _getStatusColor() {
    switch (status) {
      case TransferUiStatus.completed:
        return AppColors.success;
      case TransferUiStatus.failed:
        return AppColors.error;
      case TransferUiStatus.inProgress:
        return AppColors.primaryDark;
      case TransferUiStatus.pending:
        return AppColors.textMutedDark;
    }
  }

  String _getStatusText() {
    switch (status) {
      case TransferUiStatus.completed:
        return 'Completed';
      case TransferUiStatus.failed:
        return 'Failed';
      case TransferUiStatus.inProgress:
        return '${(progress! * 100).toInt()}%';
      case TransferUiStatus.pending:
        return 'Pending';
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    _fileIcon,
                    size: 24,
                    color: theme.colorScheme.primary,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        fileName,
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: isDark
                              ? AppColors.textPrimaryDark
                              : AppColors.textPrimaryLight,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '$_formattedSize • ${type == TransferUiType.sent ? 'Sent to' : 'Received from'} ${deviceName ?? 'Unknown'}',
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                _buildStatusBadge(theme),
              ],
            ),
            if (status == TransferUiStatus.inProgress ||
                status == TransferUiStatus.pending) ...[
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: status == TransferUiStatus.inProgress
                      ? progress
                      : null,
                  minHeight: 4,
                  backgroundColor: isDark
                      ? AppColors.darkSurfaceVariant
                      : AppColors.lightSurfaceVariant,
                ),
              ),
            ],
            if (timestamp != null) ...[
              const SizedBox(height: 8),
              Text(
                _formatTimestamp(timestamp!),
                style: theme.textTheme.bodySmall?.copyWith(
                  color: isDark
                      ? AppColors.textMutedDark
                      : AppColors.textMutedLight,
                ),
              ),
            ],
            if (status == TransferUiStatus.failed && onRetry != null) ...[
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton.icon(
                    onPressed: onRetry,
                    icon: const Icon(Icons.refresh, size: 18),
                    label: const Text('Retry'),
                  ),
                  if (onCancel != null) ...[
                    const SizedBox(width: 8),
                    TextButton.icon(
                      onPressed: onCancel,
                      icon: const Icon(Icons.close, size: 18),
                      label: const Text('Cancel'),
                    ),
                  ],
                ],
              ),
            ],
            if (status == TransferUiStatus.completed && onOpen != null) ...[
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton.icon(
                    onPressed: onOpen,
                    icon: const Icon(Icons.folder_open, size: 18),
                    label: const Text('Open Location'),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(ThemeData theme) {
    final color = _getStatusColor();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (status == TransferUiStatus.inProgress) ...[
            SizedBox(
              width: 12,
              height: 12,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(color),
              ),
            ),
          ] else ...[
            Icon(
              status == TransferUiStatus.completed
                  ? Icons.check_circle
                  : status == TransferUiStatus.failed
                  ? Icons.error_outline
                  : Icons.schedule,
              size: 14,
              color: color,
            ),
          ],
          const SizedBox(width: 4),
          Text(
            _getStatusText(),
            style: theme.textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  String _formatTimestamp(DateTime ts) {
    final now = DateTime.now();
    final diff = now.difference(ts);

    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';

    return DateFormat('MMM d, y').format(ts);
  }
}
