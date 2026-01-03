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
  var image: CIImage!

  static func from(_ image: CIImage) -> HybridCIImage {
    let out = HybridCIImage()
    out.image = image
    return out
  }

  var extent: CGRect { convert(image.extent) }

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
}
