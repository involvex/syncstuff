import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

export interface FileChunk {
  offset: number;
  data: string; // Base64 string for Capacitor Filesystem
}

class FileManagerService {
  /**
   * Read a file chunk
   */
  async readFileChunk(path: string): Promise<string> {
    // Note: Capacitor Filesystem doesn't support seeking/reading chunks directly easily
    // without reading the whole file in some versions.
    // For MVP/Web compatibility, we might assume small files or use the Blob API on web.
    // On Native, we might need a custom plugin for efficient large file seeking if Filesystem doesn't support it.
    // However, for MVP, let's try to read as DataURL/Base64 and slice (memory intensive but standard).

    // Optimization: If we have a File object (Web), we can slice it.
    // On Native, we assume the path is a URI.

    try {
      const contents = await Filesystem.readFile({
        path,
        directory: Directory.Documents,
        encoding: Encoding.UTF8, // We generally want base64 for binary
      });

      // This is a placeholder. Real large file support needs native stream/seek.
      // For now, we will handle this in the transfer logic (web-first approach for file picking).
      return contents.data as string;
    } catch (error) {
      console.error("Error reading file chunk:", error);
      throw error;
    }
  }

  /**
   * Write a file chunk
   */
  async writeFileChunk(
    fileName: string,
    data: string,
    append: boolean = true,
  ): Promise<void> {
    try {
      if (append) {
        await Filesystem.appendFile({
          path: fileName,
          data,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
      } else {
        await Filesystem.writeFile({
          path: fileName,
          data,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true, // Create directories if needed
        });
      }
    } catch (error) {
      console.error("Error writing file chunk:", error);
      throw error;
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(path: string) {
    try {
      return await Filesystem.stat({
        path,
        directory: Directory.Documents,
      });
    } catch (error) {
      console.error("Error getting file info:", error);
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(path: string) {
    try {
      await Filesystem.deleteFile({
        path,
        directory: Directory.Documents,
      });
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }
}

export const fileManagerService = new FileManagerService();
