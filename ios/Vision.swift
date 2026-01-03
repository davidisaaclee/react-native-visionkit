import Vision
import NitroModules

class HybridVNImageRequestHandler: HybridVNImageRequestHandlerSpec {
  var value: VNImageRequestHandler!

  static func from(_ value: VNImageRequestHandler) -> HybridVNImageRequestHandler {
    let out = HybridVNImageRequestHandler()
    out.value = value
    return out
  }
  
  func perform(requests: [any HybridVNImageBasedRequestSpec]) throws {
    try value.perform(
      requests.compactMap { ($0 as? VNImageBasedRequestBacked)?.backingRequest }
    )
  }
}

class HybridVNContour: HybridVNContourSpec {
  var value: VNContour!
  static func from(_ value: VNContour) -> HybridVNContour {
    let out = HybridVNContour()
    out.value = value
    return out
  }

  var pointCount: Double {
    Double(value.pointCount)
  }

  var normalizedPointsFlat: [Double] {
    value.normalizedPoints.flatMap { [Double($0.x), Double($0.y)] }
  }

  func polygonApproximation(epsilon: Double) throws -> any HybridVNContourSpec {
    HybridVNContour.from(try value.polygonApproximation(epsilon: Float(epsilon)))
  }
}

// MARK: Observations

class HybridVNInstanceMaskObservation: HybridVNInstanceMaskObservationSpec {
  var value: VNInstanceMaskObservation!

  static func from(_ value: VNInstanceMaskObservation) -> HybridVNInstanceMaskObservation {
    let out = HybridVNInstanceMaskObservation()
    out.value = value
    return out
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

  func generateMaskedImage(opts: GenerateMaskedImageOptions) throws -> any HybridCVPixelBufferSpec {
    HybridCVPixelBuffer.from(
      try value.generateMaskedImage(
        ofInstances: IndexSet(opts.ofInstances.map { Int($0) }),
        from: (opts.from as! HybridVNImageRequestHandler).value,
        croppedToInstancesExtent: opts.croppedToInstancesExtent
      )
    )
  }
}

extension HybridVNInstanceMaskObservation: VNObservationBacked {
  var backingObservation: VNObservation { value }
}

class HybridVNContoursObservation: HybridVNContoursObservationSpec {
  var value: VNContoursObservation!
  static func from(_ value: VNContoursObservation) -> HybridVNContoursObservation {
    let out = HybridVNContoursObservation()
    out.value = value
    return out
  }

  var topLevelContours: [any HybridVNContourSpec] {
    value.topLevelContours.map { HybridVNContour.from($0) }
  }

  var contourCount: Double {
    Double(value.contourCount)
  }

  func contourAt(index: Double) throws -> any HybridVNContourSpec {
    HybridVNContour.from(try value.contour(at: Int(index)))
  }
}

extension HybridVNContoursObservation: VNObservationBacked {
  var backingObservation: VNObservation { value }
}

// MARK: Requests

class HybridVNDetectContoursRequest: HybridVNDetectContoursRequestSpec {
  let request = VNDetectContoursRequest()

  var contrastAdjustment: Double {
    get { Double(request.contrastAdjustment) }
    set { request.contrastAdjustment = Float(newValue) }
  }

  var contrastPivot: Double? {
    get { request.contrastPivot.map { Double(truncating: $0) } }
    set { request.contrastPivot = newValue.map { NSNumber(value: $0) } }
  }

  var detectsDarkOnLight: Bool {
    get { request.detectsDarkOnLight }
    set { request.detectsDarkOnLight = newValue }
  }

  var maximumImageDimension: Double {
    get { Double(request.maximumImageDimension) }
    set { request.maximumImageDimension = Int(newValue) }
  }

  var results: [any HybridVNContoursObservationSpec]? {
    request.results?.map { HybridVNContoursObservation.from($0) }
  }
  
  var prefersBackgroundProcessing: Bool {
    get { request.preferBackgroundProcessing }
    set { request.preferBackgroundProcessing = newValue }
  }
}
extension HybridVNDetectContoursRequest: VNImageBasedRequestBacked {
  var backingRequest: VNImageBasedRequest { request }
}

class HybridVNGenerateForegroundInstanceMaskRequest: HybridVNGenerateForegroundInstanceMaskRequestSpec {
  let request = VNGenerateForegroundInstanceMaskRequest()
  
  var prefersBackgroundProcessing: Bool {
    get { request.preferBackgroundProcessing }
    set { request.preferBackgroundProcessing = newValue }
  }

  var results: [any HybridVNInstanceMaskObservationSpec]? {
    request.results?.map { HybridVNInstanceMaskObservation.from($0) }
  }
}
extension HybridVNGenerateForegroundInstanceMaskRequest: VNImageBasedRequestBacked {
  var backingRequest: VNImageBasedRequest { request }
}

// MARK: Factories

class HybridVNDetectContoursRequestFactory: HybridVNDetectContoursRequestFactorySpec {
  func create() throws -> any HybridVNDetectContoursRequestSpec {
    HybridVNDetectContoursRequest()
  }
}

class HybridVNImageRequestHandlerFactory: HybridVNImageRequestHandlerFactorySpec {
  func createWithCIImage(ciImage: any HybridCIImageSpec) throws -> any HybridVNImageRequestHandlerSpec {
    HybridVNImageRequestHandler.from(VNImageRequestHandler(ciImage: (ciImage as! HybridCIImage).image))
  }
}

class HybridVNGenerateForegroundInstanceMaskRequestFactory: HybridVNGenerateForegroundInstanceMaskRequestFactorySpec {
  func create() throws -> any HybridVNGenerateForegroundInstanceMaskRequestSpec {
    HybridVNGenerateForegroundInstanceMaskRequest()
  }
}

// MARK: Helpers

protocol VNImageBasedRequestBacked {
  var backingRequest: VNImageBasedRequest { get }
}

extension HybridVNImageBasedRequestSpec_protocol where Self: VNImageBasedRequestBacked {
  var regionOfInterest: CGRect {
    get { convert(backingRequest.regionOfInterest) }
    set { backingRequest.regionOfInterest = convert(newValue) }
  }
  
  var prefersBackgroundProcessing: Bool {
    get { backingRequest.preferBackgroundProcessing }
    set { backingRequest.preferBackgroundProcessing = newValue }
  }
}

protocol VNObservationBacked {
  var backingObservation: VNObservation { get }
}

extension HybridVNObservationSpec_protocol where Self: VNObservationBacked {
  var confidence: Double { Double(backingObservation.confidence) }
}
