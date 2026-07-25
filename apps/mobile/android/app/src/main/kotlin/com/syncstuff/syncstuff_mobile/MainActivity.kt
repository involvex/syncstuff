package com.syncstuff.syncstuff_mobile

import android.content.ContentValues
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File
import java.io.FileInputStream

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.syncstuff/file_helper"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "copyToDownloads" -> {
                    val filePath = call.argument<String>("filePath")
                    val fileName = call.argument<String>("fileName")
                    val relativePath = call.argument<String>("relativePath")
                    if (filePath != null && fileName != null) {
                        try {
                            val savedPath = copyFileToDownloads(filePath, fileName, relativePath)
                            result.success(savedPath)
                        } catch (e: Exception) {
                            result.error("COPY_FAILED", e.message, null)
                        }
                    } else {
                        result.error("INVALID_ARGS", "filePath and fileName required", null)
                    }
                }
                "getDownloadsPath" -> {
                    result.success(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).absolutePath)
                }
                else -> result.notImplemented()
            }
        }
    }

    private fun copyFileToDownloads(filePath: String, fileName: String, relativePath: String?): String {
        val sourceFile = File(filePath)
        if (!sourceFile.exists()) {
            throw Exception("Source file not found: $filePath")
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Android 10+: Use MediaStore API
            val resolver = contentResolver
            val contentValues = ContentValues().apply {
                put(MediaStore.Downloads.DISPLAY_NAME, fileName)
                put(MediaStore.Downloads.MIME_TYPE, "application/octet-stream")
                val relPath = if (!relativePath.isNullOrEmpty()) {
                    // Ensure it starts with Download/
                    if (relativePath.startsWith(Environment.DIRECTORY_DOWNLOADS)) {
                        relativePath
                    } else {
                        "${Environment.DIRECTORY_DOWNLOADS}/$relativePath"
                    }
                } else {
                    Environment.DIRECTORY_DOWNLOADS
                }
                put(MediaStore.Downloads.RELATIVE_PATH, relPath)
            }

            val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                ?: throw Exception("Failed to create MediaStore entry")

            resolver.openOutputStream(uri)?.use { outputStream ->
                FileInputStream(sourceFile).use { inputStream ->
                    inputStream.copyTo(outputStream)
                }
            } ?: throw Exception("Failed to open output stream")

            // Delete the original file from private storage
            sourceFile.delete()

            return uri.toString()
        } else {
            // Android 9 and below: Direct file write to Downloads
            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            val targetDir = if (!relativePath.isNullOrEmpty()) {
                val subDir = if (relativePath.startsWith(Environment.DIRECTORY_DOWNLOADS)) {
                    relativePath.removePrefix(Environment.DIRECTORY_DOWNLOADS).removePrefix("/")
                } else {
                    relativePath
                }
                File(downloadsDir, subDir)
            } else {
                downloadsDir
            }
            if (!targetDir.exists()) {
                targetDir.mkdirs()
            }
            val destFile = File(targetDir, fileName)
            sourceFile.copyTo(destFile, overwrite = true)
            sourceFile.delete()
            return destFile.absolutePath
        }
    }
}
