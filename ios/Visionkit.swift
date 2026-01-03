import Vision
import NitroModules

class HybridCIImageFactory: HybridCIImageFactorySpec {
  func createFromFile(path: String) throws -> any HybridCIImageSpec {
    let url = URL(fileURLWithPath: path)
    guard let ciImage = CIImage(contentsOf: url) else {
      throw NSError(domain: "HybridCIImageFactory", code: 1, userInfo: [
        NSLocalizedDescriptionKey: "Failed to load image from path: \(path)"
      ])
    }
    return HybridCIImage.from(ciImage)
  }
}

class HybridCIImage: HybridCIImageSpec {
  private var image: CIImage!
  
  static func from(_ image: CIImage) -> HybridCIImage {
    let out = HybridCIImage()
    out.initialize(image: image)
    return out
  }
  
  fileprivate func initialize(image: CIImage) {
    self.image = image
  }
  
  func writePngToFile(path: String) throws {
    let context = CIContext()

    guard let colorSpace = image.colorSpace else {
      throw RuntimeError.error(withMessage: "Image has no colorspace - cannot write to PNG")
    }

    // Use appropriate format based on colorspace
    let format: CIFormat = colorSpace.model == .monochrome ? .L8 : .RGBA8

    try context.writePNGRepresentation(
      of: image,
      to: URL(filePath: path),
      format: format,
      colorSpace: colorSpace
    )
  }
  
  func generateForegroundMasks() throws -> Promise<[any HybridVNInstanceMaskObservationSpec]> {
    return Promise.async {
      let results = try self._generateForegroundMasks()
      return results.map { obs in
        let out = HybridVNInstanceMaskObservation()
        out.initialize(value: obs)
        return out
      }
    }
  }
  
  private func _generateForegroundMasks() throws -> [VNInstanceMaskObservation] {
    let req = VNGenerateForegroundInstanceMaskRequest()
    let requestHandler = VNImageRequestHandler(ciImage: image)
    try requestHandler.perform([req])
    
    guard let results = req.results else {
      return []
    }
    
    return results
  }
}

class HybridCVPixelBuffer: HybridCVPixelBufferSpec {
  private var buffer: CVPixelBuffer!
  
  static func from(_ buffer: CVPixelBuffer) -> HybridCVPixelBuffer {
    let out = HybridCVPixelBuffer()
    out.initialize(buffer: buffer)
    return out
  }
  
  fileprivate func initialize(buffer: CVPixelBuffer) {
    self.buffer = buffer
  }
  
  var width: Double {
    Double(CVPixelBufferGetWidth(buffer))
  }
  
  var height: Double {
    Double(CVPixelBufferGetHeight(buffer))
  }
  
  func data() throws -> ArrayBuffer {
    // TODO: we could probably avoid copy here
    CVPixelBufferLockBaseAddress(buffer, .readOnly)
    defer { CVPixelBufferUnlockBaseAddress(buffer, .readOnly) }
    
    guard let baseAddress = CVPixelBufferGetBaseAddress(buffer) else {
      throw RuntimeError.error(withMessage: "Failed to get CVPixelBuffer base address")
    }
    
    let bytesPerRow = CVPixelBufferGetBytesPerRow(buffer)
    let height = CVPixelBufferGetHeight(buffer)
    let size = bytesPerRow * height
    
    // Copy the data into a new ArrayBuffer
    return ArrayBuffer.copy(
      of: baseAddress.assumingMemoryBound(to: UInt8.self),
      size: size
    )
  }
  
  func toCIImage() throws -> any HybridCIImageSpec {
    let ciImage = CIImage(cvPixelBuffer: buffer)

    // If the image doesn't have a colorspace (like masks), assign a grayscale one
    if ciImage.colorSpace == nil {
      guard let grayColorSpace = CGColorSpace(name: CGColorSpace.linearGray) else {
        throw RuntimeError.error(withMessage: "Failed to create gray colorspace")
      }
      let imageWithColorSpace = ciImage.matchedToWorkingSpace(from: grayColorSpace)
      return HybridCIImage.from(imageWithColorSpace ?? ciImage)
    }

    return HybridCIImage.from(ciImage)
  }
}

class HybridVNInstanceMaskObservation: HybridVNInstanceMaskObservationSpec {
  private var value: VNInstanceMaskObservation!
  
  static func from(_ value: VNInstanceMaskObservation) -> HybridVNInstanceMaskObservation {
    let out = HybridVNInstanceMaskObservation()
    out.initialize(value: value)
    return out
  }
  
  fileprivate func initialize(value: VNInstanceMaskObservation) {
    self.value = value
  }
  
  var instanceMask: any HybridCVPixelBufferSpec {
    HybridCVPixelBuffer.from(value.instanceMask)
  }
  
  var allInstances: [Double] {
    value.allInstances.map { Double($0) }
  }
  
  func generateMaskForInstances(instanceIds: [Double]) throws -> any HybridCVPixelBufferSpec {
    let mask = try value.generateMask(forInstances: IndexSet(instanceIds.map { Int($0) }))
    return HybridCVPixelBuffer.from(mask)
  }
}
