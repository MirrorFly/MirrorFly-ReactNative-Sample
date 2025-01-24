package com.mirrorfly_rn

import android.os.Environment
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.JavaOnlyArray
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Response
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import javax.crypto.Cipher
import kotlin.math.roundToInt

class MediaService(var reactContext: ReactApplicationContext?) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "MediaService"
    }

    private val cryptLib = FileCryptLib()
    private var keyString: String = ""
    private var inputFilePath: String = ""
    private var outputFilePath: String = ""
    private var chunkSize: Int = (5 * 1024 * 1024)
    private var iv: String = ""
    private lateinit var cipher: Cipher
    private var apiInterface: APIInterface? = null
    private val activeDownloads = mutableMapOf<String, Job>()
    private val activeUploads = mutableMapOf<String, Job>()
    private var isAllPauseRequested: Boolean = false

    @ReactMethod
    fun baseUrlInit(baseURL: String) {
        apiInterface = APIClient().getClient(baseURL)?.create(APIInterface::class.java)
    }

    // Utility to send download progress
    private suspend fun sendDownloadProgress(
        msgId: String,
        startByte: Long,
        endByte: Long,
        fileSize: Int
    ) {
        val progressMap = Arguments.createMap().apply {
            putString("msgId", msgId)
            putInt("startByte", startByte.toInt())
            putInt("endByte", endByte.toInt())
            putInt("downloadedBytes", endByte.toInt() + 1)
            putInt("totalBytes", fileSize)
            putDouble("downloadedBytes", endByte.toDouble())
        }
        // Switch to the main thread to send the event
        withContext(Dispatchers.Main) {
            sendEvent("downloadProgress", progressMap)
        }
    }

    // Utility to send upload progress
    private suspend fun sendUploadProgress(
        msgId: String,
        progress: Double, chunkIndex: Int,
        totalBytesRead: Long,
        fileSize: Long
    ) {
        val progressMap = Arguments.createMap().apply {
            putString("msgId", msgId)
            putInt("chunkIndex", chunkIndex)
            putInt("progress", progress.toInt())
            putInt("uploadedBytes", totalBytesRead.toInt())
            putInt("totalBytes", fileSize.toInt())
        }
        // Switch to the main thread to send the event
        withContext(Dispatchers.Main) {
            sendEvent("uploadProgress", progressMap)
        }
    }

    private suspend fun handleDownloadError(
        promise: Promise,
        message: String,
        fileOutputStream: FileOutputStream?,
        msgId: String
    ) {
        Log.d(name, message)
        // Close the file output stream in a blocking context to avoid blocking the main thread
        withContext(Dispatchers.IO) {
            fileOutputStream?.close()
        }
        // Switch to the main thread to resolve the promise
        withContext(Dispatchers.Main) {
            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", false)
                putInt("statusCode", 500)
                putString("message", message)
            })
        }
        activeDownloads.remove(msgId)
    }

    // Utility to send download completion response
    private suspend fun sendDownloadComplete(promise: Promise, cachePath: String) {
        // Switch to the main thread to resolve the promise
        withContext(Dispatchers.Main) {
            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", true)
                putInt("statusCode", 200)
                putString("message", "File downloaded successfully at: $cachePath")
                putString("cachePath", cachePath)
            })
        }
    }

    @ReactMethod
    fun startDownload(
        downloadURL: String,
        msgId: String,
        fileSize: Int,
        chunkSize: Int,
        cachePath: String,
        promise: Promise
    ) {
        if (isAllPauseRequested) {
            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", false)
                putInt("statusCode", 499)
                putString("message", "All task pause requested")
            })
            return
        }
        Log.d(
            name,
            "Starting download for msgId: $msgId with URL: $downloadURL and cachePath: $cachePath"
        )

        // Check if download is already in progress
        if (activeDownloads.containsKey(msgId)) {
            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", false)
                putInt("statusCode", 102)
                putString("message", "Download already in progress for msgId: $msgId")
            })
            return
        }

        // Create the download job in a coroutine
        val job = CoroutineScope(Dispatchers.IO).launch {
            try {
                val file = File(cachePath)
                var startByte: Long = file.length()
                Log.d(name, "file.length() startByte $startByte")
                val fileOutputStream = FileOutputStream(file, true)

                while (startByte < fileSize) {
                    val endByte = minOf(startByte + chunkSize, fileSize.toLong()) - 1
                    val range = "bytes=$startByte-$endByte"

                    Log.d(name, "Downloading range: $range for msgId: $msgId")

                    val response =
                        apiInterface?.downloadChunkFromPreAuthenticationUrl(downloadURL, range)
                            ?.execute()

                    // Check for response failure
                    if (response == null || !response.isSuccessful) {
                        handleDownloadError(
                            promise,
                            "Failed to download chunk: $range",
                            fileOutputStream,
                            msgId
                        )
                        return@launch
                    }

                    val chunkData = getChunkData(response)
                    fileOutputStream.write(chunkData)
                    // Send progress update
                    sendDownloadProgress(msgId, startByte, endByte, fileSize)
                    startByte = endByte + 1

                    // Check for cancellation
                    if (!isActive) {
                        Log.d(name, "Download canceled for msgId: $msgId")
                        Log.d(name, "cache length ${file.length()}")
                        handleDownloadError(promise, "Download canceled", fileOutputStream, msgId)
                        return@launch
                    }
                }

                fileOutputStream.close()
                sendDownloadComplete(promise, cachePath)

            } catch (e: Exception) {
                promise.resolve(Arguments.createMap().apply {
                    putBoolean("success", false)
                    putInt("statusCode", 500)
                    putString("message", "Error downloading file for msgId: $msgId: $e")
                })
            } finally {
                activeDownloads.remove(msgId)
            }
        }

        // Track the active download job
        activeDownloads[msgId] = job
    }

    @ReactMethod
    fun cancelDownload(msgId: String, promise: Promise) {
        val job = activeDownloads[msgId]
        if (job != null) {
            job.cancel() // This triggers isActive to become false
            activeDownloads.remove(msgId)
            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", false)
                putString("message", "Download canceled for msgId: $msgId")
            })
        } else {
            promise.reject("CANCEL_FAILED", "No active download found for msgId: $msgId")
        }
    }

    @ReactMethod
    fun resetPauseRequest(promise: Promise) {
        isAllPauseRequested = false
    }

    @ReactMethod
    fun cancelAllUploads(promise: Promise) {
        if (activeUploads.isNotEmpty()) {
            for ((msgId, job) in activeUploads) {
                job.cancel() // Cancel the download job
            }
            activeUploads.clear() // Clear all active download references
            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", true)
                putString("message", "All uploads have been canceled")
            })
        } else {
            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", false)
                putString("message", "No active uploads to cancel")
            })
        }
    }

    @ReactMethod
    fun cancelAllDownloads(promise: Promise) {
        isAllPauseRequested = true
        if (activeDownloads.isNotEmpty()) {
            for ((msgId, job) in activeDownloads) {
                job.cancel() // Cancel the download job
            }
            activeDownloads.clear() // Clear all active download references

            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", true)
                putString("message", "All downloads have been canceled")
            })
        } else {
            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", false)
                putString("message", "No active downloads to cancel")
            })
        }
    }

    @ReactMethod
    fun cancelUpload(msgId: String, promise: Promise) {
        val job = activeUploads[msgId]
        if (job != null) {
            job.cancel() // This triggers isActive to become false
            activeUploads.remove(msgId)
            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", true)
                putString("message", "Upload cancelled for msgId: $msgId")
            })
        } else {
            promise.reject("CANCEL_FAILED", "No active Upload found for msgId: $msgId")
        }
    }

    @ReactMethod
    fun encryptFile(obj: ReadableMap, promise: Promise) {
        val msgId = obj.getString("msgId") ?: ""
        val job = CoroutineScope(Dispatchers.IO).launch {
            try {
                inputFilePath = obj.getString("inputFilePath") ?: ""
                outputFilePath = obj.getString("outputFilePath") ?: ""
                chunkSize = if (obj.hasKey("chunkSize")) obj.getInt("chunkSize") else chunkSize
                iv = obj.getString("iv") ?: ""
                keyString = cryptLib.getRandomString(32)
                val file = File(inputFilePath.replace("file://", ""))
                // Simulate encryption setup
                val key = cryptLib.getSHA256(keyString, 32)
                cipher = cryptLib.encryptFile(key, iv) // Dummy call

                if (!file.exists()) {
                    withContext(Dispatchers.Main) {
                        promise.resolve(Arguments.createMap().apply {
                            putBoolean("success", false)
                            putInt("statusCode", 404)
                            putString("message", "File not found at $inputFilePath")
                        })
                    }
                    return@launch
                }
                if (outputFilePath.isEmpty()) {
                    withContext(Dispatchers.Main) {
                        promise.resolve(Arguments.createMap().apply {
                            putBoolean("success", false)
                            putInt("statusCode", 400)
                            putString("message", "Output file path is empty")
                        })
                    }
                    return@launch
                }

                val buffer = ByteArray(chunkSize)
                val fis = FileInputStream(file)
                val fos = FileOutputStream(outputFilePath)
                var bytesRead = 0
                val totalBytesWritten = 0L
                Log.d(name, "encryptFile input file size ${file.length()}")

                while (fis.read(buffer).also { bytesRead = it } != -1) {
                    Log.d(name, "encrypting in while loop  $bytesRead")
                    val chunkData = cipher.update(buffer, 0, bytesRead)
                    fos.write(chunkData)
                }
                val finalChunk = cipher.doFinal()
                fos.write(finalChunk)
                fos.close()
                fis.close()
                val fosFile = File(outputFilePath)
                withContext(Dispatchers.Main) {
                    promise.resolve(Arguments.createMap().apply {
                        putBoolean("success", true)
                        putInt("statusCode", 200)
                        putString("message", "File encrypted successfully")
                        putString("encryptedFilePath", outputFilePath)
                        putString("encryptionKey", keyString)
                        putInt("totalBytesWritten", totalBytesWritten.toInt())
                        putInt("size", fosFile.length().toInt())
                    })
                }
            } catch (e: Exception) {
                    promise.resolve(Arguments.createMap().apply {
                        putBoolean("success", false)
                        putInt("statusCode", 500)
                        putString("message", "Error encrypting file: ${e.message}")
                    })
            } finally {
                activeUploads.remove(msgId)
            }
        }
        activeUploads[msgId] = job
    }

    private fun generatePublicFolderPath(inputFilePath: String): String {
        // Extract the file extension from the input file
        val fileExtension =
            inputFilePath.substringAfterLast('.', "unknown") // Default to "unknown" if no extension

        // Check if external storage is available
        if (Environment.getExternalStorageState() == Environment.MEDIA_MOUNTED) {
            // Access the public "Downloads" directory or use your preferred directory
            val publicDirectory = File(
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                "React Native Mirrorfly"
            )
//          reactContext?.externalMediaDirs


            // Ensure the directory exists
            if (!publicDirectory.exists()) {
                publicDirectory.mkdirs()
            }

            // Create the file name using the input file name and extension
            val inputFile = File(inputFilePath)
            val fileName = "${inputFile.nameWithoutExtension}.${fileExtension}"

            // Generate the full file path
            val file = File(publicDirectory, fileName)

            return file.absolutePath // Return the full path to the public file
        } else {
            throw Exception("External storage is not available")
        }
    }

    @ReactMethod
    fun decryptFile(
        inputFilePath: String,
        msgId: String,
        keyString: String,
        iv: String,
        promise: Promise
    ) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val file = File(inputFilePath.replace("file://", ""))
                Log.d(name, "decryptFile file ${file.length()}")
                if (!file.exists()) {
                    withContext(Dispatchers.Main) {
                        promise.resolve(Arguments.createMap().apply {
                            putBoolean("success", false)
                            putInt("statusCode", 404)
                            putString("message", "File not found at $inputFilePath")
                        })
                    }
                    return@launch
                }

                // Generate the key for decryption
                val key = cryptLib.getSHA256(keyString, 32)
                val decipher = cryptLib.decryptFile(key, iv)

                // Get the file name and generate the path for the decrypted file in cache
                val fileName = file.name
                val decryptedFileName = "decrypted-$fileName"
                val decryptedFilePath =
                    "${reactContext?.cacheDir?.path}/$decryptedFileName"  // Use reactContext to access cacheDir

                val buffer = ByteArray(chunkSize)
                val fis = FileInputStream(file)
                val fos = FileOutputStream(decryptedFilePath)  // Write to the cache directory first
                var bytesRead: Int
                var totalBytesWritten = 0L
                Log.d(name, "before while loop input file size ${file.length()}")

                while (fis.read(buffer).also { bytesRead = it } != -1) {
                    Log.d(name, "decrypting in while loop $bytesRead")
                    val chunkData = decipher.update(buffer, 0, bytesRead)
                    fos.write(chunkData)
                    totalBytesWritten += chunkData.size

                    val progressMap = Arguments.createMap().apply {
                        putString("msgId", msgId)
                        putDouble("totalBytesWritten", totalBytesWritten.toDouble())
                    }
                    withContext(Dispatchers.Main) {
                        sendEvent("decryption", progressMap)
                    }
                }
                Log.d(name, "after while loop")
                try {
                    val finalChunk = decipher.doFinal()
                    if (finalChunk != null) fos.write(finalChunk)
                    totalBytesWritten += finalChunk.size
                } catch (e: NullPointerException) {
                    Log.e(name, "final chunk decrypt exception null pointer $e")
                } catch (e: Exception) {
                    Log.e(name, "final chunk decrypt exception $e")
                }

                fos.close()
                fis.close()

                val decryptedFile = File(decryptedFilePath)
                Log.d(name, "decryptFile decryptedFilePath file size ${decryptedFile.length()}")

                // After moving the file, delete the original (if needed)
                val deleteSuccess = file.delete()

                // After successful decryption, move the file back to the inputFilePath
                val moveSuccess = decryptedFile.renameTo(file)

                withContext(Dispatchers.Main) {
                    promise.resolve(Arguments.createMap().apply {
                        putBoolean("success", true)
                        putInt("statusCode", 200)
                        putString("message", "File decrypted and moved successfully")
                        putString(
                            "decryptedFilePath",
                            "file://${file.absolutePath}"
                        ) // Return the path of the file (moved)
                        putInt("decryptedFileSize", totalBytesWritten.toInt())
                        putBoolean("inputFileDeleted", deleteSuccess)
                    })
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    promise.resolve(Arguments.createMap().apply {
                        putBoolean("success", false)
                        putInt("statusCode", 500)
                        putString("message", "Error decrypting file: ${e.message}")
                    })
                }
            }
        }
    }

    private fun getChunkData(response: Response<ResponseBody>): ByteArray {
        return response.body()?.bytes() ?: ByteArray(0)
    }

    private suspend fun uploadChunk(uploadUrl: String, chunk: ByteArray): Boolean {
        return try {
            val requestBody: RequestBody =
                RequestBody.create("application/octet-stream".toMediaTypeOrNull(), chunk)

            val call = apiInterface?.uploadBinaryData(uploadUrl, requestBody)
            val response = call?.execute()
            Log.d(name, "progress $response")
            if (response != null && response.isSuccessful) {
                true
            } else {
                Log.e(name, "Chunk upload failed: $response")
                false
            }
        } catch (e: Exception) {
            Log.e(name, "Error uploading chunk: $e")
            false
        }
    }

    @ReactMethod
    fun uploadFileInChunks(obj: ReadableMap, promise: Promise) {
        val uploadUrls: ReadableArray = obj.getArray("uploadUrls") ?: JavaOnlyArray()
        val encryptedFilePath: String = obj.getString("encryptedFilePath") ?: ""
        val msgId: String = obj.getString("msgId") ?: ""
        val startIndex: Int = obj.getInt("startIndex") ?: 0
        val startBytesRead: Int = obj.getInt("startBytesRead") ?: 0
        val job = CoroutineScope(Dispatchers.IO).launch {
            try {
                val file = File(encryptedFilePath)

                if (!file.exists()) {
                    withContext(Dispatchers.Main) {
                        promise.reject(
                            "FILE_NOT_FOUND",
                            "File not found at path: $encryptedFilePath"
                        )
                    }
                    return@launch
                }

                val buffer = ByteArray(chunkSize)
                var bytesRead: Int
                var totalBytesRead: Long = startBytesRead.toLong()
                var chunkIndex = startIndex

                val fis = FileInputStream(file)

                if (totalBytesRead > 0) {
                    fis.skip(totalBytesRead)
                }

                while (fis.read(buffer).also { bytesRead = it } != -1) {
                    if (chunkIndex >= uploadUrls.size()) {
                        withContext(Dispatchers.Main) {
                            promise.reject(
                                "UPLOAD_ERROR",
                                "Insufficient upload URLs provided for all chunks."
                            )
                        }
                        fis.close()
                        return@launch
                    }

                    val uploadUrl = uploadUrls.getString(chunkIndex)
                    totalBytesRead += bytesRead
                    Log.d(name, "uploadUrl $bytesRead $uploadUrl")
                    // Upload the chunk
                    val success = uploadChunk(
                        uploadUrl,
                        buffer.copyOf(bytesRead)
                    ) // Use only the read portion of the buffer

                    if (!success) {
                        withContext(Dispatchers.Main) {
                            promise.reject(
                                "UPLOAD_FAILED",
                                "Chunk upload failed for URL: $uploadUrl"
                            )
                        }
                        fis.close()
                        return@launch
                    }

                    // Notify progress
                    val progress = (totalBytesRead.toDouble() / file.length()) * 100
                    sendUploadProgress(msgId, progress, chunkIndex, totalBytesRead, file.length())
                    Log.d(name, "progress $progress")

                    chunkIndex++
                }

                fis.close()
                file.delete()


                withContext(Dispatchers.Main) {
                    promise.resolve(Arguments.createMap().apply {
                        putBoolean("success", true)
                        putInt("statusCode", 200)
                        putString("message", "File uploaded successfully to all URLs.")
                    })
                }
            } catch (e: Exception) {
                Log.e(name, "Error uploading file: $e")
                promise.resolve(Arguments.createMap().apply {
                    putBoolean("success", false)
                    putInt("statusCode", 500)
                    putString("message", "Error While Uploading file")
                })
            } finally {
                activeUploads.remove(msgId)
            }
        }
        activeUploads[msgId] = job
    }

    @ReactMethod
    fun downloadFileInChunks(
        downloadURL: String,
        fileSize: Int,
        cachePath: String,
        promise: Promise
    ) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val chunkSize = 5 * 1024 * 1024 // 5 MB
                var startByte: Long = 0
                var endByte: Long
                val file = File(cachePath)
                val size = fileSize.toLong()
                // Create or append to the file
                val fileOutputStream = FileOutputStream(file, true)

                while (startByte <= size) {

                    if (startByte == size) {
                        break;
                    }

                    endByte = startByte + chunkSize

                    if (endByte >= size) {
                        endByte = size - 1
                    }

                    val range = "bytes=$startByte-$endByte"
                    Log.d(name, "range $range")
                    // Make the API call for the current chunk
                    val response =
                        apiInterface?.downloadChunkFromPreAuthenticationUrl(downloadURL, range)
                            ?.execute()
                    if (response == null || !response.isSuccessful) {
                        withContext(Dispatchers.Main) {
                            promise.reject("DOWNLOAD_FAILED", "Failed to download chunk: $range")
                        }
                        fileOutputStream.close()
                        return@launch
                    }

                    // Write the chunk to the file
                    val chunkData = getChunkData(response)
                    fileOutputStream.write(chunkData)

                    // Update the progress
                    val progress = (endByte.toDouble() / fileSize) * 100
                    val progressMap = Arguments.createMap().apply {
                        putInt("progress", progress.roundToInt())
                        putDouble("downloadedBytes", endByte.toDouble())
                    }
                    withContext(Dispatchers.Main) {
                        sendEvent("downloadProgress", progressMap)
                    }

                    // Update the start byte for the next chunk
                    startByte = endByte + 1
                }

                // Close the file output stream
                fileOutputStream.close()

                withContext(Dispatchers.Main) {
                    promise.resolve(Arguments.createMap().apply {
                        putBoolean("success", true)
                        putInt("statusCode", 200)
                        putString("message", "File downloaded successfully at: $cachePath")
                        putString("cachePath", cachePath)
                    })
                }
            } catch (e: Exception) {
                Log.e(name, "Error downloading file: $e")
                withContext(Dispatchers.Main) {
                    promise.reject("DOWNLOAD_ERROR", "Error downloading file: $e")
                }
            }
        }
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    // Method to send progress updates to React Native
    private fun sendEvent(eventName: String, params: WritableMap) {
        if (reactApplicationContext.hasActiveCatalystInstance()) {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }
}

