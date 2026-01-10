import { FileSharer } from "@byteowls/capacitor-filesharer";
import { Share } from "@capacitor/share";

/**
 * Share Service - enables sharing content and files with other apps
 */
class ShareService {
  /**
   * Check if sharing is available on the current platform
   */
  async canShare(): Promise<boolean> {
    const { value } = await Share.canShare();
    return value;
  }

  /**
   * Share text content
   */
  async shareText(
    text: string,
    title?: string,
    dialogTitle?: string,
  ): Promise<void> {
    await Share.share({
      text,
      title,
      dialogTitle,
    });
  }

  /**
   * Share a URL
   */
  async shareUrl(
    url: string,
    title?: string,
    text?: string,
    dialogTitle?: string,
  ): Promise<void> {
    await Share.share({
      url,
      title,
      text,
      dialogTitle,
    });
  }

  /**
   * Share files using the native share dialog
   */
  async shareFiles(options: {
    files: string[];
    title?: string;
    text?: string;
  }): Promise<void> {
    await Share.share({
      files: options.files,
      title: options.title,
      text: options.text,
    });
  }

  /**
   * Share a single file with more control using FileSharer plugin
   * This is useful for sharing files with specific MIME types
   */
  async shareFile(options: {
    filename: string;
    contentType: string;
    base64Data?: string;
    path?: string;
  }): Promise<void> {
    if (options.base64Data) {
      await FileSharer.share({
        filename: options.filename,
        contentType: options.contentType,
        base64Data: options.base64Data,
      });
    } else if (options.path) {
      // For file paths, we need to read the file and convert to base64
      // This is handled by the app's file handling logic
      console.warn(
        "Sharing by path requires reading the file first. Use base64Data instead.",
      );
    }
  }

  /**
   * Share multiple files with FileSharer
   */
  async shareMultipleFiles(
    files: Array<{
      filename: string;
      contentType: string;
      base64Data: string;
    }>,
  ): Promise<void> {
    // Share files one at a time (FileSharer doesn't have shareMultiple on all platforms)
    for (const file of files) {
      await FileSharer.share({
        filename: file.filename,
        contentType: file.contentType,
        base64Data: file.base64Data,
      });
    }
  }
}

export const shareService = new ShareService();
