package com.mirrorfly_rn

import android.os.Environment
import android.util.Log
import com.facebook.react.bridge.Arguments
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

    private fun getRandomString(length: Int): String {
        val allowedChars = ('A'..'Z') + ('a'..'z') + ('0'..'9')
        return (1..length)
            .map { allowedChars.random() }
            .joinToString("")
    }

    @ReactMethod
    fun baseUrlInit(baseURL: String) {
        apiInterface = APIClient().getClient(baseURL)?.create(APIInterface::class.java)
    }


    @ReactMethod
    fun defineValues(obj: ReadableMap, promise: Promise) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                inputFilePath = obj.getString("inputFilePath") ?: ""
                outputFilePath = obj.getString("outputFilePath") ?: ""
                chunkSize = if (obj.hasKey("chunkSize")) obj.getInt("chunkSize") else chunkSize
                iv = obj.getString("iv") ?: ""
                keyString = getRandomString(32)
                val file = File(inputFilePath.replace("file://", ""))
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

                // Simulate encryption setup
                val key = cryptLib.getSHA256(keyString, 32)
                cipher = cryptLib.encryptFile(key, iv) // Dummy call

                withContext(Dispatchers.Main) {
                    promise.resolve(Arguments.createMap().apply {
                        putBoolean("success", true)
                        putInt("statusCode", 200)
                        putString("encryptionKey", keyString)
                    })
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    promise.resolve(Arguments.createMap().apply {
                        putBoolean("success", false)
                        putInt("statusCode", 500)
                        putString("message", "Error initializing values: ${e.message}")
                    })
                }
            }
        }
    }

    @ReactMethod
    fun encryptFile(promise: Promise) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val file = File(inputFilePath.replace("file://", ""))
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
                withContext(Dispatchers.Main) {
                    promise.resolve(Arguments.createMap().apply {
                        putBoolean("success", true)
                        putInt("statusCode", 200)
                        putString("message", "File encrypted successfully")
                        putString("encryptedFilePath", outputFilePath)
                        putInt("totalBytesWritten", totalBytesWritten.toInt())
                    })
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    promise.resolve(Arguments.createMap().apply {
                        putBoolean("success", false)
                        putInt("statusCode", 500)
                        putString("message", "Error encrypting file: ${e.message}")
                    })
                }
            }
        }
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

            // Ensure the directory exists
            if (!publicDirectory.exists()) {
                publicDirectory.mkdirs()
            }

            // Create the file name using the input file name and extension
            val inputFile = File(inputFilePath)
            val fileName = "decrypted_file_${inputFile.nameWithoutExtension}.${fileExtension}"

            // Generate the full file path
            val file = File(publicDirectory, fileName)

            return file.absolutePath // Return the full path to the public file
        } else {
            throw Exception("External storage is not available")
        }
    }

    @ReactMethod
    fun decryptFile(inputFilePath: String, keyString: String, iv: String, promise: Promise) {
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
                val key = cryptLib.getSHA256(keyString, 32)
                val decipher = cryptLib.decryptFile(key, iv)
                // Generate the public folder path with the appropriate extension
                val publicFilePath = generatePublicFolderPath(inputFilePath)
                val buffer = ByteArray(chunkSize)
                val fis = FileInputStream(file)
                val fos = FileOutputStream(publicFilePath)
                var bytesRead: Int
                var totalBytesWritten = 0L
                Log.d(name, "before while loop input file sie ${file.length()}")
                while (fis.read(buffer).also { bytesRead = it } != -1) {
                    Log.d(name, "decrypting in while loop $bytesRead")
                    val chunkData = decipher.update(buffer, 0, bytesRead)
                    fos.write(chunkData)
                    totalBytesWritten += chunkData.size
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
                val output = File(publicFilePath)
                Log.d(name, "decryptFile publicFilePath file size ${output.length()}")
                // After successful decryption, delete the input file
                val deleteSuccess = file.delete()

                withContext(Dispatchers.Main) {
                    promise.resolve(Arguments.createMap().apply {
                        putBoolean("success", true)
                        putInt("statusCode", 200)
                        putString("message", "File decrypted successfully")
                        putString(
                            "decryptedFilePath",
                            publicFilePath
                        ) // Return the path of the decrypted file in the public folder
                        putInt("totalBytesWritten", totalBytesWritten.toInt())
                        putBoolean(
                            "inputFileDeleted",
                            deleteSuccess
                        ) // Indicate if the file was deleted successfully
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
            Log.d(name, "progress ${response?.isSuccessful}")
            if (response != null && response.isSuccessful) {
                true
            } else {
                Log.e(name, "Chunk upload failed: ${response?.errorBody()?.string()}")
                false
            }
        } catch (e: Exception) {
            Log.e(name, "Error uploading chunk: $e")
            false
        }
    }

    @ReactMethod
    fun uploadFileInChunks(
        uploadUrls: ReadableArray,
        encryptedFilePath: String,
        promise: Promise
    ) {
        CoroutineScope(Dispatchers.IO).launch {
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
                var totalBytesRead: Long = 0
                var chunkIndex = 0

                val fis = FileInputStream(file)

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
                    //val success = withContext(Dispatchers.IO) {
                    val success = uploadChunk(
                        uploadUrl,
                        buffer.copyOf(bytesRead)
                    ) // Use only the read portion of the buffer
                    //   }

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
                    val progressMap = Arguments.createMap()
                    progressMap.putInt("chunkIndex", chunkIndex)
                    progressMap.putInt("progress", progress.roundToInt())
                    withContext(Dispatchers.Main) {
                        sendEvent("UploadProgress", progressMap)
                    }
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
                withContext(Dispatchers.Main) {
                    promise.reject("UPLOAD_ERROR", "Error uploading file: ${e.message}")
                }
            }
        }
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
                    promise.reject("DOWNLOAD_ERROR", "Error downloading file: ${e}")
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

