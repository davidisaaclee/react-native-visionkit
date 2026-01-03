import Vision
import NitroModules

class HybridCVPixelBuffer: HybridCVPixelBufferSpec {
  var buffer: CVPixelBuffer!

  static func from(_ buffer: CVPixelBuffer) -> HybridCVPixelBuffer {
    let out = HybridCVPixelBuffer()
    out.buffer = buffer
    return out
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
