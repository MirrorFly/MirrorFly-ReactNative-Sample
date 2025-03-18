//
//  MediaService.swift
//  mirrorfly_rn
//
//  Created by user on 31/12/24.
//

import Foundation
import os.log
import React
import AVFoundation
import Photos

@objc(MediaService)
class MediaService: RCTEventEmitter {
  
  private var keyString: String = ""
  private var inputFilePath: String = ""
  private var outputFilePath: String = ""
  private var chunkSize: Int = (5 * 1024 * 1024)
  private var iv: String = ""
  private var fileName: String = ""
  private var messageType: String = ""
  
  
  private var streamManager: StreamManager?
  private var currentUploadTask: URLSessionUploadTask?
  private var activeUploads: [String: DispatchWorkItem] = [:]
  private var downloadTasks: [String: URLSessionDataTask] = [:]
  private var downloadTaskCanceled: [String: Bool] = [:]
  
  private var hasListeners = false
  
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc func baseUrlInit(_ url: String,
                         resolver: @escaping RCTPromiseResolveBlock,
                         rejecter: @escaping RCTPromiseRejectBlock) {
    // Handle the URL parameter
    print("Received URL: \(url)")
    resolver(url)
  }
  
  // React Native calls this when JavaScript starts listening to events
  override func startObserving() {
    hasListeners = true
  }
  
  // React Native calls this when JavaScript stops listening to events
  override func stopObserving() {
    hasListeners = false
  }
  
  
  // Override to specify the supported events
  override func supportedEvents() -> [String] {
    return ["downloadProgress","uploadProgress", "decyption"] // List all event names you will send
  }
  
  
  // Method to send progress updates to React Native
  private func sendEvent(eventName: String, params: [String: Any]) {
    if self.hasListeners {
      self.sendEvent(withName: eventName, body: params)
    }
  }
  
  func checkFileReadableFromURL(_ filePath: String) -> (isReadable: Bool, message: String) {
    let fileManager = FileManager.default
    
    // Check if the file exists at the given path
    if !fileManager.fileExists(atPath: filePath) {
      return (false, "The specified file does not exist at the given path")
    }
    
    // Convert file path to file URL
    let fileURL = URL(fileURLWithPath: filePath)
    
    // Check if the file is readable by attempting to open it
    guard let inputStream = InputStream(url: fileURL) else {
      return (false, "Failed to initialize input stream for the file")
    }
    
    inputStream.open()
    if inputStream.streamStatus != .open {
      return (false, "Failed to open file stream for reading")
    }
    
    // Successfully opened the file, close the input stream
    inputStream.close()
    return (true, "File is readable and exists. Proceeding with upload.")
  }
  
  func getFreeDiskSpace() -> Int64? {
    do {
      let fileManager = FileManager.default
      let attributes = try fileManager.attributesOfFileSystem(forPath: NSHomeDirectory())
      if let freeSize = attributes[.systemFreeSize] as? NSNumber {
        return freeSize.int64Value // Return free space in bytes
      }
    } catch {
      print("Error checking free disk space: \(error.localizedDescription)")
    }
    return nil // Return nil if an error occurs
  }
  
  func checkDeviceFressSpace(fileSize: Int64)->(isSpaceAvail: Bool, message: String){
    do {
      guard let freeSpace = getFreeDiskSpace() else {
        return (false, "Unable to determine available storage space")
      }
      print("freeSpace ==>",freeSpace)
      if fileSize * 2 > freeSpace {
        return (false, "Not enough free storage space to upload the file")
      }
      return (true, "File is readable, size matches, and there is enough storage space")
    }
  }
  
  private func isPaused(msgId: String?, resolver: @escaping ([String: Any]) -> Void) -> Bool {
      // Check if all tasks are paused
      if let allTaskPauseRequested = downloadTaskCanceled["allTaskPauseRequested"], allTaskPauseRequested {
          DispatchQueue.main.async {
              resolver([
                  "success": false,
                  "statusCode": 499,
                  "message": "All task pause requested",
              ])
          }
          return true // Indicates that the task is paused
      }
      
      // Check if a specific task is canceled
      if let msgId = msgId, self.downloadTaskCanceled[msgId] == true {
          DispatchQueue.main.async {
              resolver([
                  "success": false,
                  "statusCode": 499,
                  "message": "Download Canceled",
              ])
          }
          return true // Indicates that the task is paused
      }
      
      return false // Indicates that the task is not paused
  }
  
  
  @objc func encryptFile(
    _ obj: NSDictionary,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ){
    let msgId = obj["msgId"] as? String ?? ""
    let workItem = DispatchWorkItem {
      guard let inputFilePath = obj["inputFilePath"] as? String,
            let outputFilePath = obj["outputFilePath"] as? String else {
        let response: [String: Any] = [
          "success": false,
          "statusCode": 500,
          "message":"Missing required parameters 'inputFilePath' or 'outputFilePath"
        ]
        resolver(response);
        return
      }
      
      self.inputFilePath = inputFilePath
      self.outputFilePath = outputFilePath
      self.chunkSize = obj["chunkSize"] as? Int ?? self.chunkSize
      self.iv = obj["iv"] as? String ?? ""
      self.fileName = obj["fileName"] as? String ?? ""
      self.messageType = obj["messageType"] as? String ?? ""
      let fileSize = obj["fileSize"] as? Int64 ?? 0

      // Check if the file exists and is readable
      let fileManager = FileManager.default
      if !fileManager.fileExists(atPath: self.inputFilePath) || !fileManager.isReadableFile(atPath: self.inputFilePath) {
        let response: [String: Any] = [
          "success": false,
          "statusCode": 404,
          "message":"Input file path is not readable or does not exist."
        ]
        resolver(response)
        return;
      }
      
      let (isSpaceAvail , message) = self.checkDeviceFressSpace(fileSize:fileSize)
      if(!isSpaceAvail){
        let response: [String: Any] = [
          "success": false,
          "statusCode": 400,
          "message": message
        ]
        resolver(response)
        return
      }
      
      self.keyString =  FlyEncryption.randomString(of: 32)// Encrypt the key using `iv`
      let url = URL(fileURLWithPath: inputFilePath)
      let outputFileUrl = URL(fileURLWithPath: outputFilePath)
      
      let folderPath = outputFileUrl.deletingLastPathComponent()
      let fileName = outputFileUrl.lastPathComponent
      
      // Check file readability
      let fileCheck = self.checkFileReadableFromURL(inputFilePath)
      if !fileCheck.isReadable {
        resolver(["success": false, "message": fileCheck.message])
        return
      }
      
      print("Path up to folder name: \(folderPath)")
      let streamManager = StreamManager(fileURL: url, folderURL: folderPath, fileName: fileName, key: self.keyString, iv: self.iv, sendEvent: self.sendEvent)
      print("#upload initStreamManager")
      if let _workItem = self.activeUploads[msgId] {
        let (bytesWritten,lastChunkFileUrl,success) = streamManager.startStreaming(_workItem: _workItem)
        print("bytesWritten ==>", bytesWritten, lastChunkFileUrl)
        if(success){
          DispatchQueue.main.async {
            resolver([
              "success": true,
              "statusCode": 200,
              "message": "File encrypted successfully",
              "encryptedFilePath": lastChunkFileUrl.absoluteString,
              "size": bytesWritten,
              "encryptionKey":self.keyString,
            ])
          }
        }else{
          DispatchQueue.main.async {
            resolver([
              "success": false,
              "statusCode": 500,
              "message": "File encryption failed",
            ])
          }
        }
      }
    }
    self.activeUploads[msgId] = workItem;
    DispatchQueue.global(qos: .background).async(execute: workItem)
  }
  
  @objc func cancelUpload(
    _ msgId: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    if let task = activeUploads[msgId] {
      task.cancel()
      resolver("Upload Canceled")
    } else {
      resolver("Upload Canceled")
    }
  }
  
  @objc func clearCacheFilePath(
    _ filePath: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    let fileManager = FileManager.default
    let formattedPath = filePath.replacingOccurrences(of: "file://", with: "")
    if fileManager.fileExists(atPath: formattedPath) {
      do {
        try fileManager.removeItem(atPath: formattedPath)
        resolver("Cleared Successfully")
      } catch (let error) {
        print("cancelUpload for \(error)")
        resolver("Clear Failed")
      }
    }
  }
  
  @objc func cancelAllUploads(
    _ resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    if activeUploads.isEmpty {
      resolver("No active uploads to cancel")
      return
    }
    for (msgId, task) in activeUploads {
      task.cancel()
      print("cancelUpload for \(msgId)")
    }
    resolver([
      "statusCode": 200,
      "message": "All uploads canceled",
    ])
  }
  
  @objc func startDownload(
    _ downloadURL: String,
    msgId: String,
    fileSize: NSNumber,
    chunkSize: NSNumber,
    cachePath: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    let (isSpaceAvail , message) = self.checkDeviceFressSpace(fileSize:fileSize.int64Value)
    if(!isSpaceAvail){
      let response: [String: Any] = [
        "success": false,
        "statusCode": 400,
        "message": message
      ]
      resolver(response)
      return
    }
    if isPaused(msgId: msgId, resolver: resolver) {
        return
    }
    
    let size = fileSize.intValue
    var startByte = 0
    var endByte = 0
    
    // Create or open the file for writing chunks
    let fileManager = FileManager.default
    let cacheURL = URL(fileURLWithPath: cachePath)
    
    do {
      let fileAttributes = try fileManager.attributesOfItem(atPath: cacheURL.path)
      if let fileSize = fileAttributes[.size] as? NSNumber {
        print("File size: \(fileSize.intValue) bytes")
        startByte = fileSize.intValue
      } else {
        print("Could not retrieve file size.")
      }
    } catch {}
    
    
    if !fileManager.fileExists(atPath: cachePath) {
      fileManager.createFile(atPath: cachePath, contents: nil, attributes: nil)
    }
    
    DispatchQueue.global(qos: .background).async {
      while startByte <= size {
        
        if self.isPaused(msgId: msgId, resolver: resolver) {
            return
        }
        
        if startByte == size {
          break
        }
        
        endByte = startByte + chunkSize.intValue
        
        if endByte >= size {
          endByte = size - 1
        }
        
        // Construct the range header
        let rangeHeader = "bytes=\(startByte)-\(endByte)"
        print("Downloading range: \(rangeHeader)")
        
        guard let url = URL(string: downloadURL) else {
          DispatchQueue.main.async {
            resolver([
              "success": false,
              "statusCode": 404,
              "message": "Invalid URL: \(downloadURL)",
            ])
          }
          return
        }
        
        var request = URLRequest(url: url)
        request.setValue(rangeHeader, forHTTPHeaderField: "Range")
        
        let semaphore = DispatchSemaphore(value: 0)
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
          if let error = error {
            print("Error downloading chunk: \(error.localizedDescription)")
            DispatchQueue.main.async {
              resolver([
                "success": false,
                "statusCode": 499,
                "message": "Error in file download",
              ])
            }
            semaphore.signal()
            return
          }
          
          if let data = data, let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 206 {
            // Successfully downloaded the chunk
            if let fileHandle = try? FileHandle(forWritingTo: cacheURL) {
              fileHandle.seekToEndOfFile()
              fileHandle.write(data)
              fileHandle.closeFile()
              
              // Emit progress update
              let progressParams: [String: Any] = [
                "msgId": msgId,
                "startByte": startByte,
                "endByte": endByte,
                "downloadedBytes": endByte + 1,
                "totalBytes": size
              ]
              self.sendEvent(eventName: "downloadProgress", params: progressParams)
            }
          } else {
            print("Unexpected response: \(response!)")
            DispatchQueue.main.async {
              resolver([
                "success": false,
                "statusCode": 500,
                "message": "Unexpected response: \(response!)",
              ])
            }
          }
          
          semaphore.signal()
        }
        
        task.resume()
        semaphore.wait() // Wait for the download task to complete
        self.downloadTasks[msgId] = task
        // Update the start byte for the next chunk
        startByte = endByte + 1
      }
      
      // Final resolution
      DispatchQueue.main.async {
        resolver([
          "success": true,
          "statusCode": 200,
          "message": "File downloaded successfully",
          "cachePath": cachePath
        ])
      }
    }
  }
  
  @objc
  func pauseDownload(_ msgId: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) -> Bool {
    guard let task = downloadTasks[msgId] else { return false }
    task.cancel() // Cancel the task
    downloadTaskCanceled[msgId] = true
    print("Paused download for \(msgId) at byte:")
    return true
  }
  
  @objc func cancelDownload(
    _ msgId: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    if let task = downloadTasks[msgId] {
      task.cancel()
      downloadTaskCanceled[msgId] = true
      print("cancelDownload for \(msgId), canceled ==>", downloadTaskCanceled[msgId] ?? false)
      resolver("Download Canceled")
    } else {
      downloadTaskCanceled[msgId] = true
      resolver("Download Canceled")
    }
  }
  
  @objc func resetPauseRequest (
    _ resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock){
      self.downloadTaskCanceled["allTaskPauseRequested"] = false
      
      for msgId in downloadTaskCanceled.keys {
          self.downloadTaskCanceled[msgId] = false
      }
      
      
      resolver([
        "statusCode": 200,
        "message": "All task pause request reseted",
      ])
    }
  
  @objc func cancelAllDownloads(
    _ resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    downloadTaskCanceled["allTaskPauseRequested"] = true
    if downloadTasks.isEmpty {
      resolver("No active downloads to cancel")
      return
    }
    
    for (msgId, task) in downloadTasks {
      task.cancel()
      downloadTaskCanceled[msgId] = true
      print("cancelDownload for \(msgId), canceled ==>", downloadTaskCanceled[msgId] ?? false)
    }
    
    // Clear all active download tasks
    downloadTasks.removeAll()
    
    resolver([
      "statusCode": 200,
      "message": "All downloads canceled",
    ])
  }
  
  @objc func decryptFile(
    _ inputFilePath: String,
    msgId: String,
    keyString: String,
    iv: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock){
          let url = URL(fileURLWithPath: inputFilePath)
          let folderPath = url.deletingLastPathComponent()
          let fileName = url.lastPathComponent
          let streamManager = StreamManager(fileURL: url, folderURL: folderPath, fileName:fileName, key: keyString, iv: iv, sendEvent: self.sendEvent)
          
          if let (filePath , _ , totalBytesWritten ) = streamManager.decryptStreaming(at: folderPath, fileName: fileName,key:keyString, iv: iv, msgId: msgId ){
            resolver([
              "success": true,
              "statusCode": 200,
              "message": "File decrypted successfully",
              "decryptedFilePath": filePath.absoluteString,
              "decryptedFileSize": totalBytesWritten
            ])
          }else{
            resolver([
              "success": false,
              "statusCode": 500,
              "message": "Failed decrypted",
            ])
          }
    }
  
  @objc func defineValues(
    _ obj: NSDictionary,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    guard let inputFilePath = obj["inputFilePath"] as? String,
          let outputFilePath = obj["outputFilePath"] as? String else {
      let response: [String: Any] = [
        "success": false,
        "statusCode": 500,
        "message":"Missing required parameters 'inputFilePath' or 'outputFilePath"
      ]
      resolver(response);
      return
    }
    
    self.inputFilePath = inputFilePath
    self.outputFilePath = outputFilePath
    self.chunkSize = obj["chunkSize"] as? Int ?? self.chunkSize
    self.iv = obj["iv"] as? String ?? ""
    self.fileName = obj["fileName"] as? String ?? ""
    self.messageType = obj["messageType"] as? String ?? ""
    
    // Check if the file exists and is readable
    let fileManager = FileManager.default
    if !fileManager.fileExists(atPath: self.inputFilePath) || !fileManager.isReadableFile(atPath: self.inputFilePath) {
      let response: [String: Any] = [
        "success": false,
        "statusCode": 404,
        "message":"Input file path is not readable or does not exist."
      ]
      resolver(response)
      return;
    }
    
    // Encrypt the key
    do {
      self.keyString =  FlyEncryption.randomString(of: 32)// Encrypt the key using `iv`
      
      // Return success response with the encrypted key
      let response: [String: Any] = [
        "success": true,
        "statusCode": 200,
        "encryptionKey": self.keyString
      ]
      resolver(response)
    }
  }
  
  private func uploadChunk(data: Data, to urlString: String, msgId: String) -> (String, Int) {
      guard let url = URL(string: urlString) else {
          print("Invalid URL: \(urlString)")
          return ("Invalid URL", -1) // -1 indicates an invalid URL
      }
      
      var request = URLRequest(url: url)
    request.httpMethod = "put"
      request.setValue("application/octet-stream", forHTTPHeaderField: "Content-Type")
      request.setValue("\(data.count)", forHTTPHeaderField: "Content-Length")
      
      let semaphore = DispatchSemaphore(value: 0)
      var uploadResult = "Upload Failed"
      var statusCode = -1 // Default status code for failure or unknown response
      
      let task = URLSession.shared.uploadTask(with: request, from: data) { _, response, error in
          if let error = error {
              print("Error uploading chunk: \(error.localizedDescription)")
              uploadResult = "Error: \(error.localizedDescription)"
          } else if let httpResponse = response as? HTTPURLResponse {
              statusCode = httpResponse.statusCode
              if httpResponse.statusCode == 200 {
                  print("Chunk uploaded successfully to \(urlString)")
                  uploadResult = "Upload Successful"
              } else {
                  print("Unexpected response during upload to \(urlString): \(httpResponse.statusCode)")
                  uploadResult = "Unexpected Response"
              }
          }
          semaphore.signal()
      }
      task.resume()
      semaphore.wait() // Wait for the upload task to complete
      
      return (uploadResult, statusCode)
  }
  
  @objc func uploadFileInChunks(
    _ obj: NSDictionary,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    let uploadUrls = obj["uploadUrls"] as? [String] ?? []
    let filePath = obj["encryptedFilePath"] as? String ?? ""
    let msgId = obj["msgId"] as? String ?? ""
    
    // Retrieve previously saved state (if any)
    let startIndex = obj["startIndex"] as? Int ?? 0
    let startBytesRead = obj["startBytesRead"] as? Int ?? 0
    
    let formattedPath = filePath.replacingOccurrences(of: "file://", with: "")
    let fileManager = FileManager.default
    let chunkSize: Int = (5 * 1024 * 1024)
    
    // File existence and readability checks
    if !fileManager.fileExists(atPath: formattedPath) {
      print("File not found at \(formattedPath)")
      resolver([
        "success": false,
        "statusCode": 404,
        "error": "File not found at \(formattedPath)"
      ])
      return
    }
    
    if !fileManager.isReadableFile(atPath: formattedPath) {
      print("File is not readable at \(formattedPath)")
      resolver([
        "success": false,
        "statusCode": 403,
        "error": "File is not readable at \(formattedPath)"
      ])
      return
    }
    let workItem = DispatchWorkItem {
      do {
        let fileHandle = try FileHandle(forReadingFrom: URL(fileURLWithPath: formattedPath))
        var offset: UInt64 = UInt64(startBytesRead)
        var uploadedBytes: UInt64 = UInt64(startBytesRead) // Start from the previously uploaded bytes
        var chunkIndex = startIndex
        let fileSize = fileHandle.seekToEndOfFile()
        fileHandle.seek(toFileOffset: offset)
        
        while offset < fileSize {
          let length = min(chunkSize, Int(fileSize - offset))
          fileHandle.seek(toFileOffset: offset)
          let data = fileHandle.readData(ofLength: length)
          
          if chunkIndex >= uploadUrls.count {
            print("No more upload URLs available for chunk at offset \(offset)")
            DispatchQueue.main.async {
              resolver([
                "success": false,
                "statusCode": 400,
                "message": "No upload URL available for chunk \(chunkIndex)",
                "startIndex": chunkIndex,
                "startBytesRead": offset
              ])
            }
            fileHandle.closeFile()
            return
          }
          
          // Check for cancellation
          if let workItem = self.activeUploads[msgId], workItem.isCancelled {
            // Save the current state for resuming
            self.activeUploads.removeValue(forKey: msgId)
            DispatchQueue.main.async {
              resolver([
                "success": false,
                "statusCode": 400,
                "message": "Upload canceled",
                "startIndex": chunkIndex,
                "startBytesRead": offset
              ])
            }
            fileHandle.closeFile()
            return
          }
          
          // Upload the chunk
          let uploadUrl = uploadUrls[chunkIndex]
          print("Uploading chunk \(chunkIndex) to \(uploadUrl)")
          let (message, statusCode) = self.uploadChunk(data: data, to: uploadUrl, msgId: msgId)
          
          if statusCode != 200 {
            print("Chunk upload failed for chunk \(chunkIndex) with status code \(statusCode): \(message)")
            DispatchQueue.main.async {
              resolver([
                "success": false,
                "statusCode": statusCode,
                "message": "Chunk upload failed with message: \(message)",
                "startIndex": chunkIndex,
                "startBytesRead": offset
              ])
            }
            fileHandle.closeFile()
            return
          }
          
          // Update progress
          uploadedBytes += UInt64(length)
          let progress = (Double(uploadedBytes) / Double(fileSize)) * 100
          let progressParams: [String: Any] = [
            "chunkIndex": chunkIndex,
            "uploadedBytes": uploadedBytes,
            "uploadStatus": "Upload Successful",
            "totalBytes": fileSize,
            "progress": progress,
            "msgId": msgId
          ]
          self.sendEvent(eventName: "uploadProgress", params: progressParams)
          
          offset += UInt64(length)
          chunkIndex += 1
        }
        
        fileHandle.closeFile()
        
        // Resolve with success when all chunks are uploaded
        DispatchQueue.main.async {
          resolver([
            "success": true,
            "statusCode": 200,
            "message": "File uploaded successfully"
          ])
        }
      } catch {
        DispatchQueue.main.async {
          rejecter("FILE_READ_ERROR", "Error reading file: \(error.localizedDescription)", error)
        }
      }
    }
    
    // Save the current upload workItem for cancellation/resume tracking
    self.activeUploads[msgId] = workItem
    DispatchQueue.global(qos: .background).async(execute: workItem)
  }
  
  @objc
  func compressVideoFile(_ obj: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let videoPath = obj["videoPath"] as? String, !videoPath.isEmpty else {
      rejecter("INVALID_INPUT", "Invalid video path", nil)
      return
    }
    
    let mediaQuality = obj["quality"] as? String ?? "medium"
    
    getValidFileURL(from: videoPath) { videoURL, error in
      guard let fileURL = videoURL else {
        rejecter("INVALID_PATH", error ?? "Could not resolve file path", nil)
        return
      }
      
      var quality = AVAssetExportPresetMediumQuality
      switch mediaQuality {
      case "best":
        quality = AVAssetExportPreset1280x720
      case "high":
        quality = AVAssetExportPreset960x540
      case "medium":
        quality = AVAssetExportPreset640x480
      case "low":
        quality = AVAssetExportPresetLowQuality
      case "uncompressed":
        quality = AVAssetExportPresetHighestQuality
      default:
        quality = AVAssetExportPresetMediumQuality
      }
      
      let localPath = FileManager.default.temporaryDirectory
      let fileName = "compressed_" + UUID().uuidString + ".mp4"
      let outputURL = localPath.appendingPathComponent(fileName)
      
      let urlAsset = AVURLAsset(url: fileURL, options: nil)
      
      do {
        let fileSize = try fileURL.resourceValues(forKeys: [.fileSizeKey]).fileSize ?? 0
        
        let (isSpaceAvail , message) = self.checkDeviceFressSpace(fileSize:Int64(fileSize))
        if(!isSpaceAvail){
          let response: [String: Any] = [
            "success": false,
            "statusCode": 400,
            "message": message
          ]
          resolver(response)
          return
        }
        
        print("Actual File Size: \(fileSize) bytes")
      } catch {
        print("Error retrieving file size: \(error.localizedDescription)")
      }
      
      guard let exportSession = AVAssetExportSession(asset: urlAsset, presetName: quality) else {
        rejecter("EXPORT_SESSION_ERROR", "Failed to create export session", nil)
        return
      }
      
      exportSession.outputURL = outputURL
      exportSession.outputFileType = .mp4
      exportSession.shouldOptimizeForNetworkUse = true
      
      exportSession.exportAsynchronously {
        switch exportSession.status {
        case .completed:
          let fileSize = (try? outputURL.resourceValues(forKeys: [.fileSizeKey]).fileSize) ?? 0
          let duration = CMTimeGetSeconds(urlAsset.duration)
          resolver([
            "success": true,
            "extension": "mp4",
            "outputPath": outputURL.absoluteString,
            "fileName": fileName,
            "fileSize": fileSize,
            "duration": duration
          ])
        case .failed:
          rejecter("COMPRESSION_FAILED", exportSession.error?.localizedDescription ?? "Compression failed", exportSession.error)
        case .cancelled:
          rejecter("COMPRESSION_CANCELLED", "Compression was cancelled", nil)
        default:
          rejecter("UNKNOWN_ERROR", "An unknown error occurred", nil)
        }
      }
    }
  }
  
  func getValidFileURL(from inputPath: String, completion: @escaping (URL?, String?) -> Void) {
    var formattedPath = inputPath
    
    // Remove 'file://' if present
    if inputPath.hasPrefix("file://") {
      formattedPath = formattedPath.replacingOccurrences(of: "file://", with: "")
      completion(URL(fileURLWithPath: formattedPath), nil)
      return
    }
    
    // Handle 'ph://' (Photo Library Asset)
    if inputPath.hasPrefix("ph://") {
      let assetID = inputPath.replacingOccurrences(of: "ph://", with: "")
      let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: [assetID], options: nil)
      
      guard let asset = fetchResult.firstObject else {
        completion(nil, "PHAsset not found")
        return
      }
      
      let options = PHVideoRequestOptions()
      options.isNetworkAccessAllowed = true  // Allow iCloud downloads if needed
      
      PHImageManager.default().requestAVAsset(forVideo: asset, options: options) { avAsset, _, exportSession in
        if let urlAsset = avAsset as? AVURLAsset {
          // ✅ Normal video case
          completion(urlAsset.url, nil)
        } else if let composition = avAsset as? AVComposition {
          // ⚠️ Slow-motion video case (AVComposition has no direct file URL)
          let exportSession = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality)
          let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("\(UUID().uuidString).mp4")
          
          exportSession?.outputURL = tempURL
          exportSession?.outputFileType = .mp4
          exportSession?.shouldOptimizeForNetworkUse = false  // Ensures max quality
          exportSession?.exportAsynchronously {
            if exportSession?.status == .completed {
              completion(tempURL, nil)
            } else {
              completion(nil, "Failed to export Slo-Mo video")
            }
          }
        } else {
          completion(nil, "Unsupported asset type")
        }
      }
      
      return
    }
    
    // If no special case, assume it's a direct file path
    completion(URL(fileURLWithPath: formattedPath), nil)
  }
  
  @objc
  func compressImageFile(_ obj: NSDictionary, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let imagePath = obj["imagePath"] as? String ?? ""
    let mediaQuality = obj["quality"] as? String ?? "medium"
    
    getValidFileURL(from: imagePath) { fileURL, error in
      guard let fileURL = fileURL else {
        rejecter("INVALID_PATH", error ?? "Could not resolve file path", nil)
        return
      }
      
      var quality: CGFloat = 0.35
      switch mediaQuality {
      case "best":
        quality = 0.65
      case "high":
        quality = 0.50
      case "medium":
        quality = 0.35
      case "low":
        quality = 0.025
      case "uncompressed":
        quality = 1.0
      default:
        quality = 0.35
      }
      
      guard let imageData = try? Data(contentsOf: fileURL),
            let uiImage = UIImage(data: imageData) else {
        resolver([
          "success": false,
          "message": "Could not load image data"
        ])
        return
      }
      
      var compressedData = imageData
      if mediaQuality != "uncompressed", let jpegData = uiImage.jpegData(compressionQuality: quality) {
        compressedData = jpegData
      }
      
      let localPath = FileManager.default.temporaryDirectory
      let fileName = "Image" + UUID().uuidString + ".jpg"
      let outputURL = localPath.appendingPathComponent(fileName)
      
      do {
        try compressedData.write(to: outputURL, options: .atomic)
        let fileSize = compressedData.count // Bytes
        
        resolver([
          "success": true,
          "extension": "jpg",
          "outputPath": outputURL.absoluteString,
          "fileName": fileName,
          "fileSize": fileSize
        ])
      } catch {
        rejecter("SAVE_FAILED", "Failed to save compressed image", error)
      }
    }
  }
}
