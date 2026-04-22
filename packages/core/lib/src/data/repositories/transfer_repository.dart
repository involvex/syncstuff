import '../datasources/transfer_local_datasource.dart';
import '../../domain/entities/transfer.dart';

class TransferRepository {
  final TransferLocalDataSource _localDataSource;

  TransferRepository({TransferLocalDataSource? localDataSource})
    : _localDataSource = localDataSource ?? TransferLocalDataSource();

  Future<List<FileTransfer>> getAllTransfers() async {
    return await _localDataSource.getAllTransfers();
  }

  Future<List<FileTransfer>> getActiveTransfers() async {
    return await _localDataSource.getActiveTransfers();
  }

  Future<List<FileTransfer>> getTransferHistory() async {
    return await _localDataSource.getTransferHistory();
  }

  Future<FileTransfer?> getTransferById(String id) async {
    return await _localDataSource.getTransferById(id);
  }

  Future<void> saveTransfer(FileTransfer transfer) async {
    await _localDataSource.saveTransfer(transfer);
  }

  Future<void> updateTransfer(FileTransfer transfer) async {
    await _localDataSource.updateTransfer(transfer);
  }

  Future<void> deleteTransfer(String id) async {
    await _localDataSource.deleteTransfer(id);
  }

  Future<void> clearHistory() async {
    await _localDataSource.clearHistory();
  }
}
