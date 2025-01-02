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
    return ["downloadProgress"] // List all event names you will send
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
        
        var uploadResponses: [[String: Any]] = []
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
          
          uploadResponses.append([
            "chunkIndex": chunkIndex,
            "offset": offset,
            "bytesUploaded": data.count,
            "uploadStatus": uploadResult
          ])
          
          offset += UInt64(length)
          chunkIndex += 1
        }
        
        fileHandle.closeFile()
        
        DispatchQueue.main.async {
          resolver([
            "success": true,
            "statusCode": 200,
            "uploadResponses": uploadResponses
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
