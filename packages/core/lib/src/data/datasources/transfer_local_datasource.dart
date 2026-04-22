import 'package:sqflite/sqflite.dart';
import '../database_helper.dart';
import '../../domain/entities/transfer.dart';

class TransferLocalDataSource {
  final DatabaseHelper _databaseHelper;

  TransferLocalDataSource({DatabaseHelper? databaseHelper})
    : _databaseHelper = databaseHelper ?? DatabaseHelper();

  Future<List<FileTransfer>> getAllTransfers() async {
    final db = await _databaseHelper.database;
    final maps = await db.query('transfers', orderBy: 'createdAt DESC');
    return maps.map((map) => _transferFromMap(map)).toList();
  }

  Future<List<FileTransfer>> getActiveTransfers() async {
    final db = await _databaseHelper.database;
    final maps = await db.query(
      'transfers',
      where: 'status IN (?, ?)',
      whereArgs: ['pending', 'inProgress'],
      orderBy: 'createdAt DESC',
    );
    return maps.map((map) => _transferFromMap(map)).toList();
  }

  Future<List<FileTransfer>> getTransferHistory() async {
    final db = await _databaseHelper.database;
    final maps = await db.query(
      'transfers',
      where: 'status IN (?, ?, ?)',
      whereArgs: ['completed', 'failed', 'cancelled'],
      orderBy: 'createdAt DESC',
    );
    return maps.map((map) => _transferFromMap(map)).toList();
  }

  Future<FileTransfer?> getTransferById(String id) async {
    final db = await _databaseHelper.database;
    final maps = await db.query('transfers', where: 'id = ?', whereArgs: [id]);
    if (maps.isEmpty) return null;
    return _transferFromMap(maps.first);
  }

  Future<void> saveTransfer(FileTransfer transfer) async {
    final db = await _databaseHelper.database;
    await db.insert(
      'transfers',
      _transferToMap(transfer),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<void> updateTransfer(FileTransfer transfer) async {
    final db = await _databaseHelper.database;
    await db.update(
      'transfers',
      _transferToMap(transfer),
      where: 'id = ?',
      whereArgs: [transfer.id],
    );
  }

  Future<void> deleteTransfer(String id) async {
    final db = await _databaseHelper.database;
    await db.delete('transfers', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> clearHistory() async {
    final db = await _databaseHelper.database;
    await db.delete(
      'transfers',
      where: 'status IN (?, ?, ?)',
      whereArgs: ['completed', 'failed', 'cancelled'],
    );
  }

  Map<String, dynamic> _transferToMap(FileTransfer transfer) {
    return {
      'id': transfer.id,
      'fileName': transfer.fileName,
      'fileSize': transfer.fileSize,
      'filePath': transfer.filePath,
      'type': transfer.type.name,
      'status': transfer.status.name,
      'direction': transfer.direction.name,
      'deviceId': transfer.deviceId,
      'deviceName': transfer.deviceName,
      'progress': transfer.progress,
      'createdAt': transfer.createdAt.toIso8601String(),
      'completedAt': transfer.completedAt?.toIso8601String(),
      'error': transfer.error,
    };
  }

  FileTransfer _transferFromMap(Map<String, dynamic> map) {
    return FileTransfer(
      id: map['id'] as String,
      fileName: map['fileName'] as String,
      fileSize: map['fileSize'] as int,
      filePath: map['filePath'] as String?,
      type: TransferType.values.firstWhere(
        (e) => e.name == map['type'],
        orElse: () => TransferType.file,
      ),
      status: TransferStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => TransferStatus.pending,
      ),
      direction: TransferDirection.values.firstWhere(
        (e) => e.name == map['direction'],
        orElse: () => TransferDirection.sent,
      ),
      deviceId: map['deviceId'] as String?,
      deviceName: map['deviceName'] as String?,
      progress: (map['progress'] as num).toDouble(),
      createdAt: DateTime.parse(map['createdAt'] as String),
      completedAt: map['completedAt'] != null
          ? DateTime.parse(map['completedAt'] as String)
          : null,
      error: map['error'] as String?,
    );
  }
}
