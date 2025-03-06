package com.mirrorfly_rn

import android.database.Cursor
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMuxer
import android.net.Uri
import android.os.Environment
import android.os.StatFs
import android.provider.MediaStore
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
import com.facebook.react.bridge.WritableNativeMap
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
import java.io.IOException
import java.util.UUID
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

    private fun getFreeDiskSpace(): Long? {
        return try {
            val stat = StatFs(Environment.getDataDirectory().path)
            val blockSize = stat.blockSizeLong
            val availableBlocks = stat.availableBlocksLong
            availableBlocks * blockSize // Free space in bytes
        } catch (e: Exception) {
            null // Return null if an error occurs
        }
    }

    private fun checkDeviceFreeSpace(fileSize: Long): Pair<Boolean, String> {
        val freeSpace = getFreeDiskSpace()
            ?: return Pair(false, "Unable to determine available storage space")
        println("Free space: $freeSpace bytes")
        return if (fileSize * 2 > freeSpace) {
            Pair(false, "Not enough free storage space to upload the file")
        } else {
            Pair(true, "File is readable, size matches, and there is enough storage space")
        }
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
        val (isSpaceAvailable, message) = checkDeviceFreeSpace(fileSize.toLong())
        if (!isSpaceAvailable) {
            promise.resolve(Arguments.createMap().apply {
                putBoolean("success", false)
                putInt("statusCode", 400)
                putString("message", message)
            })
        }
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
                        val statusCode = response?.code() ?: 500
                        val errorMessage = response?.errorBody()?.string() ?: "Unknown error"
                        Log.e(name, "Chunk upload failed with status: ${response?.code()} - ${response?.message()}")
                        Log.e(name, "Error message: $errorMessage")
                        withContext(Dispatchers.Main) {
                            promise.resolve(Arguments.createMap().apply {
                                putBoolean("success", false)
                                putInt("statusCode", statusCode)
                                putString("message", response?.message())
                            })
                        }
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
                putBoolean("success", true)
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
    fun clearCacheFilePath(url: String, promise: Promise) {
        val encryptedFile = File(url.replace("file://", ""))
        // After moving the file, delete the original (if needed)
        val success = encryptedFile.delete()
        Log.d("TAG", "clearCacheFilePath: $success")
        promise.resolve(Arguments.createMap().apply {
            putBoolean("success", success)
            putString("message", "Upload cancelled for url: $success")
        })
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
                val fileSize = obj.getDouble("fileSize").toLong()
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

                val (isSpaceAvailable, message) = checkDeviceFreeSpace(fileSize)
                if (!isSpaceAvailable) {
                    promise.resolve(Arguments.createMap().apply {
                        putBoolean("success", false)
                        putInt("statusCode", 400)
                        putString("message", message)
                    })
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
    fun decryptSmallFile(
        inputFilePath: String,
        msgId: String,
        keyString: String,
        iv: String,
        promise: Promise
    ) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val file = File(inputFilePath.replace("file://", ""))
                val decipher = cryptLib.getSHA256(keyString, 32)

                // Create a temporary file for decrypted output
                val decryptedFilePath = "${file.parent}/decrypted_${file.name}"
                val decryptedFile = File(decryptedFilePath)

                val fis = FileInputStream(file)
                val inputBytes = fis.readBytes()

                val outputBytes = cryptLib.decryptFile(inputBytes, decipher, iv)

                val fos = FileOutputStream(decryptedFile)
                fos.write(outputBytes)

                fos.close()
                fis.close()

                // Log the decrypted file size
                Log.d("DecryptSmallFile", "Decrypted file path: $decryptedFilePath, size: ${decryptedFile.length()}")

                // Delete the original file if needed
                val deleteSuccess = file.delete()

                // Move the decrypted file back to the original file path
                val moveSuccess = decryptedFile.renameTo(file)

                withContext(Dispatchers.Main) {
                    promise.resolve(Arguments.createMap().apply {
                        putBoolean("success", moveSuccess)
                        putInt("statusCode", if (moveSuccess) 200 else 500)
                        putString("message", if (moveSuccess) "File decrypted and moved successfully" else "Failed to move decrypted file")
                        putString("decryptedFilePath", "file://${file.absolutePath}") // Return the updated file path
                        putInt("decryptedFileSize", file.length().toInt())
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

    private suspend fun uploadChunk(uploadUrl: String, chunk: ByteArray): Pair<Boolean, Int>  {
        return try {
            val requestBody: RequestBody =
                RequestBody.create("application/octet-stream".toMediaTypeOrNull(), chunk)

            val call = apiInterface?.uploadBinaryData(uploadUrl, requestBody)
            val response = call?.execute()
            Log.d(name, "progress $response")
            if (response != null) {
                if (response.isSuccessful) {
                    Log.d(name, "Chunk upload successful: ${response.body()?.string()}")
                    Pair(true, response.code())
                } else {
                    val errorMessage = response.errorBody()?.string() ?: "Unknown error"
                    Log.e(name, "Chunk upload failed with status: ${response.code()} - ${response.message()}")
                    Log.e(name, "Error message: $errorMessage")
                    Pair(false, response.code())
                }
            } else {
                Log.e(name, "Response is null, chunk upload failed.")
                Pair(false,  500)
            }
        } catch (e: Exception) {
            Log.e(name, "Error uploading chunk: $e")
            Pair(false, 500)
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
                    val (success, statusCode) = uploadChunk(
                        uploadUrl,
                        buffer.copyOf(bytesRead)
                    ) // Use only the read portion of the buffer

                    if (!success) {
                        withContext(Dispatchers.Main) {
                            promise.resolve(Arguments.createMap().apply {
                                putBoolean("success", false)
                                putInt("statusCode", statusCode)
                                putString("message", "Chunk upload failed for URL: $uploadUrl")
                            })
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
                        val errorMessage = response?.errorBody()?.string() ?: "Unknown error"
                        Log.e(name, "Chunk upload failed with status: ${response?.code()} - ${response?.message()}")
                        Log.e(name, "Error message: $errorMessage")
                        withContext(Dispatchers.Main) {
                            promise.resolve(Arguments.createMap().apply {
                                putBoolean("success", false)
                                putInt("statusCode", 500)
                                putString("message", errorMessage)
                            })
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

    private fun cleanVideoPath(videoPath: String?): String? {
        if (videoPath == null || videoPath.isEmpty()) {
            return null // Handle invalid input
        }

        val uri = Uri.parse(videoPath)

        return if (videoPath.startsWith("file://")) {
            videoPath.replace("file://", "") // Remove file:// prefix
        } else if (videoPath.startsWith("content://")) {
            getRealPathFromURI(uri) // Convert content:// URI to actual file path
        } else {
            videoPath // Already a valid file path
        }
    }

    private fun getRealPathFromURI(contentUri: Uri): String? {
        var cursor: Cursor? = null
        try {
            val proj = arrayOf(MediaStore.Video.Media.DATA)
            cursor =
                reactApplicationContext.contentResolver.query(contentUri, proj, null, null, null)
            if (cursor != null && cursor.moveToFirst()) {
                val columnIndex = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATA)
                return cursor.getString(columnIndex)
            }
        } catch (e: java.lang.Exception) {
            e.printStackTrace()
        } finally {
            cursor?.close()
        }
        return null // Return null if conversion fails
    }

    @ReactMethod
    fun compressVideoFile(obj: ReadableMap, promise: Promise) {
        try {
            val videoPath = if (obj.hasKey("videoPath")) obj.getString("videoPath") else ""
            val quality = if (obj.hasKey("quality")) obj.getString("quality") else "medium"




            if (videoPath!!.isEmpty()) {
                promise.reject("INVALID_INPUT", "Video path is required")
                return
            }

            val formattedPath = cleanVideoPath(videoPath)
            if (formattedPath == null) {
                promise.reject("INVALID_PATH", "Could not resolve valid file path")
                return
            }

            val targetBitrate = when (quality) {
                "best" -> 5000000 // 5 Mbps
                "high" -> 3000000 // 3 Mbps
                "medium" -> 2000000 // 2 Mbps
                "low" -> 1000000 // 1 Mbps
                "uncompressed" -> 8000000 // 8 Mbps
                else -> 2000000 // Default medium quality
            }

            val outputDir = reactApplicationContext.cacheDir
            val fileName = "compressed_" + UUID.randomUUID().toString() + ".mp4"
            val outputFile = File(outputDir, fileName)
            val outputPath = outputFile.absolutePath

            compressVideo(formattedPath, outputPath, targetBitrate)

            val compressedFile = File(outputPath)
            val fileSize = compressedFile.length()
            val extractor = MediaExtractor()
            extractor.setDataSource(outputPath)
            val duration = extractor.getTrackFormat(0).getLong(MediaFormat.KEY_DURATION) / 1000000

            val result: WritableMap = WritableNativeMap()
            result.putBoolean("success", true)
            result.putString("extension", "mp4")
            result.putString("outputPath", "file://$outputPath")
            result.putString("fileName", fileName)
            result.putDouble("fileSize", fileSize.toDouble())
            result.putDouble("duration", duration.toDouble())

            promise.resolve(result)
        } catch (e: java.lang.Exception) {
            promise.reject("COMPRESSION_FAILED", "Compression failed: " + e.message, e)
        }
    }

    @Throws(IOException::class)
    private fun compressVideo(inputPath: String, outputPath: String, targetBitrate: Int) {
        val extractor = MediaExtractor()
        extractor.setDataSource(inputPath)

        val videoTrackIndex: Int = selectTrack(extractor, "video/")
        if (videoTrackIndex < 0) throw IOException("No video track found")

        extractor.selectTrack(videoTrackIndex)
        val inputFormat = extractor.getTrackFormat(videoTrackIndex)
        val width = inputFormat.getInteger(MediaFormat.KEY_WIDTH)
        val height = inputFormat.getInteger(MediaFormat.KEY_HEIGHT)
        val frameRate =
            if (inputFormat.containsKey(MediaFormat.KEY_FRAME_RATE)) inputFormat.getInteger(
                MediaFormat.KEY_FRAME_RATE
            ) else 30
        val iFrameInterval = 2

        // Setup Encoder
        val encoder = MediaCodec.createEncoderByType("video/avc")
        val outputFormat = MediaFormat.createVideoFormat("video/avc", width, height)
        outputFormat.setInteger(MediaFormat.KEY_BIT_RATE, targetBitrate)
        outputFormat.setInteger(MediaFormat.KEY_FRAME_RATE, frameRate)
        outputFormat.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, iFrameInterval)
        outputFormat.setInteger(
            MediaFormat.KEY_COLOR_FORMAT,
            MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface
        )

        encoder.configure(outputFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        encoder.start()

        // Muxer for output video
        val muxer = MediaMuxer(outputPath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
        compressFrames(extractor, encoder, muxer, videoTrackIndex)

        extractor.release()
        encoder.stop()
        encoder.release()
        muxer.stop()
        muxer.release()
    }

    private fun selectTrack(extractor: MediaExtractor, mimePrefix: String): Int {
        val numTracks = extractor.trackCount
        for (i in 0 until numTracks) {
            val format = extractor.getTrackFormat(i)
            val mime = format.getString(MediaFormat.KEY_MIME)
            if (mime!!.startsWith(mimePrefix)) return i
        }
        return -1
    }

    @Throws(IOException::class)
    private fun compressFrames(
        extractor: MediaExtractor,
        encoder: MediaCodec,
        muxer: MediaMuxer,
        videoTrackIndex: Int
    ) {
        var videoTrackIndex = videoTrackIndex
        val inputBuffers = encoder.inputBuffers
        val bufferInfo = MediaCodec.BufferInfo()

        var inputDone = false
        var outputDone = false

        while (!outputDone) {
            if (!inputDone) {
                val inputBufferIndex = encoder.dequeueInputBuffer(10000)
                if (inputBufferIndex >= 0) {
                    val inputBuffer = inputBuffers[inputBufferIndex]
                    val sampleSize = extractor.readSampleData(inputBuffer, 0)

                    if (sampleSize < 0) {
                        encoder.queueInputBuffer(
                            inputBufferIndex,
                            0,
                            0,
                            0,
                            MediaCodec.BUFFER_FLAG_END_OF_STREAM
                        )
                        inputDone = true
                    } else {
                        encoder.queueInputBuffer(
                            inputBufferIndex,
                            0,
                            sampleSize,
                            extractor.sampleTime,
                            extractor.sampleFlags
                        )
                        extractor.advance()
                    }
                }
            }

            val outputBufferIndex = encoder.dequeueOutputBuffer(bufferInfo, 10000)
            if (outputBufferIndex >= 0) {
                val outputBuffer = encoder.getOutputBuffer(outputBufferIndex)
                muxer.writeSampleData(videoTrackIndex, outputBuffer!!, bufferInfo)
                encoder.releaseOutputBuffer(outputBufferIndex, false)
            } else if (outputBufferIndex == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                val newFormat = encoder.outputFormat
                videoTrackIndex = muxer.addTrack(newFormat)
                muxer.start()
            } else if (outputBufferIndex == MediaCodec.INFO_TRY_AGAIN_LATER) {
                outputDone = inputDone
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

