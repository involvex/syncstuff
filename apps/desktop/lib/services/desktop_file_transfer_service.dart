import 'dart:async';
import 'dart:io';

class DesktopFileTransferService
{
    final _progressController =
        StreamController<Map<String, dynamic>>.broadcast();

    String _downloadPath = 'downloads';

    DesktopFileTransferService();

    Stream<Map<String, dynamic>> get progressStream => _progressController.stream;
    String get downloadPath => _downloadPath;

    void setDownloadPath(String path) 
    {
        _downloadPath = path;
    }

    Future<void> sendFile({
        required String filePath,
        required String peerIp,
        Function(double)? onProgress
    }) async
    {
        final file = File(filePath);
        if (!await file.exists()) 
        {
            throw Exception('File not found: $filePath');
        }

        final fileName = filePath.split(Platform.pathSeparator).last;
        final bytes = await file.readAsBytes();

        final client = HttpClient();
        final uri = Uri.parse('http://$peerIp:8766/api/upload?name=$fileName');
        final request = await client.postUrl(uri);
        request.headers.contentType = ContentType('application', 'octet-stream');
        request.write(bytes);

        final response = await request.close();
        if (response.statusCode == 200) 
        {
            _progressController.add(
            {
                'status': 'completed',
                'fileName': fileName,
                'progress': 1.0
            }
            );
        }
        else 
        {
            throw Exception('Upload failed: ${response.statusCode}');
        }
    }

    Future<List<String>> getDownloadedFiles() async
    {
        final dir = Directory(_downloadPath);
        if (!await dir.exists()) return [];
        final files = await dir.list().toList();
        return files.whereType<File>().map((f) => f.path).toList();
    }

    void dispose() 
    {
        _progressController.close();
    }
}
