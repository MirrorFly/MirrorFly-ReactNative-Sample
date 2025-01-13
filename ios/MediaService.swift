//
//  MediaService.swift
//  mirrorfly_rn
//
//  Created by user on 31/12/24.
//

import Foundation
import os.log
import React

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
  
  func checkFileReadableFromURL(_ fileURL: URL) -> (isReadable: Bool, message: String) {
    let fileManager = FileManager.default
    
    // Check if file exists
    if !fileManager.fileExists(atPath: fileURL.path) {
      return (false, "The specified file does not exist at the given URL")
    }
    
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
      if fileSize > freeSpace {
        return (false, "Not enough free storage space to upload the file")
      }
      return (true, "File is readable, size matches, and there is enough storage space")
    }
  }
  
  
  @objc func encryptFile(
    _ uri: String,
    keyString: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ){
    DispatchQueue.global(qos: .background).async {
      if let url = URL(string: uri){
        let folderPath = url.deletingLastPathComponent()
        let fileName = url.lastPathComponent
        
        // Check file readability
        let fileCheck = self.checkFileReadableFromURL(url)
        if !fileCheck.isReadable {
          resolver(["success": false, "message": fileCheck.message])
          return
        }
        
        print("Path up to folder name: \(folderPath)")
        let streamManager = StreamManager(fileURL: url, folderURL: folderPath, fileName: fileName, key: keyString)
        print("#upload initStreamManager")
        let (bytesWritten,lastChunkFileUrl) = streamManager.startStreaming()
        print("bytesWritten ==>", bytesWritten, lastChunkFileUrl)
        DispatchQueue.main.async {
          resolver([
            "success": true,
            "statusCode": 200,
            "message": "File encrypted successfully",
            "encryptedFilePath": lastChunkFileUrl.absoluteString,
            "size": bytesWritten
          ])
        }
      }
    }
  }
  
  
  @objc func startUpload(_ fileUri: String, destinationUrl: String, encryptionKey: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let fileURL = URL(string: fileUri), let _ = URL(string: destinationUrl) else {
      //      rejecter("INVALID_URL", "Invalid file URI or destination URL", nil)
      return
    }
    
    // Check if file exists and is readable
    let fileManager = FileManager.default
    if !fileManager.fileExists(atPath: fileURL.path) {
      //      rejecter("FILE_NOT_FOUND", "The specified file does not exist at the given URI", nil)
      return
    }
    
    // Attempt to open the file with InputStream to ensure it's readable
    guard let inputStream = InputStream(url: fileURL) else {
      //      rejecter("FILE_READ_ERROR", "Failed to initialize input stream for the file", nil)
      return
    }
    
    inputStream.open()
    if inputStream.streamStatus != .open {
      //      rejecter("FILE_READ_ERROR", "Failed to open file stream for reading", nil)
      return
    }
    
    print("startUpload ==>",fileUri)
    resolver(["lastChunkFileUrl": fileUri])
  }
  
  @objc func pauseUpload(_ uploadId: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    // Implement pause logic for upload
    resolver("Upload Paused")
  }
  
  
  @objc func resumeUpload(_ uploadId: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    // Implement resume logic for upload
    resolver("Upload Resumed")
  }
  
  @objc func cancelUpload(_ uploadId: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    streamManager?.cancelStreaming()
    resolver("Upload Canceled")
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
    downloadTaskCanceled[msgId] = false
    
    if self.downloadTaskCanceled[msgId] == true {
      DispatchQueue.main.async {
        resolver([
          "success": false,
          "statusCode": 499,
          "message": "Download Canceled",
        ])
      }
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
        
        if self.downloadTaskCanceled[msgId] == true {
          DispatchQueue.main.async {
            resolver([
              "success": false,
              "statusCode": 499,
              "message": "Download Canceled",
            ])
          }
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
  
  @objc func decryptFile(
    _ inputFilePath: String,
    keyString: String,
    iv: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock){
      if let url = URL(string: inputFilePath){
        let folderPath = url.deletingLastPathComponent()
        let fileName = url.lastPathComponent
        let streamManager = StreamManager(fileURL: url, folderURL: folderPath, fileName:fileName, key: keyString)
        
        if let (filePath , _ ) = streamManager.decryptStreaming(at: folderPath, fileName: fileName,key:keyString, iv: iv){
          resolver([
            "success": true,
            "statusCode": 200,
            "message": "File decrypted successfully",
            "decryptedFilePath": filePath.absoluteString
          ])
        }else{
          resolver([
            "success": false,
            "statusCode": 500,
            "message": "Failed decrypted",
          ])
        }
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
  
  
  // Override to specify the supported events
  override func supportedEvents() -> [String] {
    return ["downloadProgress","UploadProgress"] // List all event names you will send
  }
  
  
  // React Native calls this when JavaScript starts listening to events
  override func startObserving() {
    hasListeners = true
  }
  
  // React Native calls this when JavaScript stops listening to events
  override func stopObserving() {
    hasListeners = false
  }
  
  
  // Method to send progress updates to React Native
  private func sendEvent(eventName: String, params: [String: Any]) {
    if self.hasListeners {
      self.sendEvent(withName: eventName, body: params)
    }
  }
  
  private func uploadChunk(data: Data, to urlString: String) -> String {
    guard let url = URL(string: urlString) else {
      print("Invalid URL: \(urlString)")
      return "Invalid URL"
    }
    
    var request = URLRequest(url: url)
    request.httpMethod = "put"
    request.setValue("application/octet-stream", forHTTPHeaderField: "Content-Type")
    request.setValue("\(data.count)", forHTTPHeaderField: "Content-Length")
    let semaphore = DispatchSemaphore(value: 0)
    var uploadResult = "Upload Failed"
    
    let task = URLSession.shared.uploadTask(with: request, from: data) { _, response, error in
      if let error = error {
        print("Error uploading chunk: \(error.localizedDescription)")
        uploadResult = "Error: \(error.localizedDescription)"
      } else if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
        print("Chunk uploaded successfully to \(urlString)")
        uploadResult = "Upload Successful"
      } else {
        print("Unexpected response during upload to \(urlString)")
        uploadResult = "Unexpected Response"
      }
      semaphore.signal()
    }
    
    task.resume()
    semaphore.wait() // Wait for the upload task to complete
    return uploadResult
  }
  
  @objc func uploadFileInChunks(
    _ uploadUrls: [String],
    filePath: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    let formattedPath = filePath.replacingOccurrences(of: "file://", with: "")
    let fileManager = FileManager.default
    let chunkSize: Int = (5*1024*1024)
    // Check if the file exists
    if !fileManager.fileExists(atPath: formattedPath) {
      print("File not found at \(formattedPath)")
      resolver([
        "success": false,
        "statusCode": 404,
        "error": "File not found at \(formattedPath)"
      ])
      return
    }
    
    // Check if the file is readable
    if !fileManager.isReadableFile(atPath: formattedPath) {
      print("File is not readable at \(formattedPath)")
      resolver([
        "success": false,
        "statusCode": 403,
        "error": "File is not readable at \(formattedPath)"
      ])
      return
    }
    
    DispatchQueue.global(qos: .background).async {
      do {
        let fileHandle = try FileHandle(forReadingFrom: URL(fileURLWithPath: formattedPath))
        var offset: UInt64 = 0
        var chunkIndex = 0
        let fileSize = fileHandle.seekToEndOfFile()
        fileHandle.seek(toFileOffset: 0) // Reset to the beginning
        while offset < fileSize {
          let length = min(chunkSize, Int(fileSize - offset))
          fileHandle.seek(toFileOffset: offset)
          let data = fileHandle.readData(ofLength: length)
          
          if chunkIndex >= uploadUrls.count {
            print("No more upload URLs available for chunk at offset \(offset)")
            break
          }
          
          let uploadUrl = uploadUrls[chunkIndex]
          print("Uploading chunk \(chunkIndex) to \(uploadUrl)")
          let uploadResult = self.uploadChunk(data: data, to: uploadUrl)
          
          let progressParams: [String: Any] = [
            "chunkIndex": chunkIndex,
            "offset": offset,
            "bytesUploaded": data.count,
            "uploadStatus": uploadResult
          ]
          self.sendEvent(eventName: "UploadProgress", params: progressParams)
          
          offset += UInt64(length)
          chunkIndex += 1
        }
        
        fileHandle.closeFile()
        
        DispatchQueue.main.async {
          resolver([
            "success": true,
            "statusCode": 200,
            "uploadResponses": "File uploaded successfully"
          ])
        }
      } catch {
        DispatchQueue.main.async {
          rejecter("FILE_READ_ERROR", "Error reading file: \(error.localizedDescription)", error)
        }
      }
    }
  }
  
  @objc func downloadFileInChunks(
    _ downloadURL: String,
    fileSize: NSNumber,
    cachePath: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    let chunkSize: Int = 5 * 1024 * 1024 // 5 MB chunk size
    let size = fileSize.intValue
    var startByte = 0
    var endByte = 0
    
    // Create or open the file for writing chunks
    let fileManager = FileManager.default
    let cacheURL = URL(fileURLWithPath: cachePath)
    
    if !fileManager.fileExists(atPath: cachePath) {
      fileManager.createFile(atPath: cachePath, contents: nil, attributes: nil)
    }
    
    DispatchQueue.global(qos: .background).async {
      while startByte <= size {
        if startByte == size {
          break
        }
        
        endByte = startByte + chunkSize
        
        if endByte >= size {
          endByte = size - 1
        }
        
        // Construct the range header
        let rangeHeader = "bytes=\(startByte)-\(endByte)"
        print("Downloading range: \(rangeHeader)")
        
        guard let url = URL(string: downloadURL) else {
          rejecter("INVALID_URL", "Invalid URL: \(downloadURL)", nil)
          return
        }
        
        var request = URLRequest(url: url)
        request.setValue(rangeHeader, forHTTPHeaderField: "Range")
        
        let semaphore = DispatchSemaphore(value: 0)
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
          if let error = error {
            print("Error downloading chunk: \(error.localizedDescription)")
            rejecter("DOWNLOAD_ERROR", "Error downloading chunk: \(error.localizedDescription)", error)
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
                "startByte": startByte,
                "endByte": endByte,
                "downloadedBytes": endByte + 1,
                "totalBytes": size
              ]
              self.sendEvent(eventName: "downloadProgress", params: progressParams)
            }
          } else {
            print("Unexpected response: \(response!)")
            rejecter("DOWNLOAD_ERROR", "Unexpected response during download", nil)
          }
          
          semaphore.signal()
        }
        
        task.resume()
        semaphore.wait() // Wait for the download task to complete
        
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
}
