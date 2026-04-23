import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  static Database? _database;

  factory DatabaseHelper() => _instance;

  DatabaseHelper._internal();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final databasesPath = await getDatabasesPath();
    final path = join(databasesPath, 'syncstuff.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE transfers (
        id TEXT PRIMARY KEY,
        fileName TEXT NOT NULL,
        fileSize INTEGER NOT NULL,
        filePath TEXT,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        direction TEXT NOT NULL,
        deviceId TEXT,
        deviceName TEXT,
        progress REAL NOT NULL,
        createdAt TEXT NOT NULL,
        completedAt TEXT,
        error TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE devices (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        platform TEXT NOT NULL,
        ipAddress TEXT,
        port INTEGER,
        lastSeen TEXT,
        isPaired INTEGER NOT NULL DEFAULT 0
      )
    ''');

    await db.execute('''
      CREATE TABLE clipboard_items (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        contentType TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        deviceId TEXT,
        deviceName TEXT,
        synced INTEGER NOT NULL DEFAULT 0
      )
    ''');

    await db.execute('''
      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    ''');
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {}
}
