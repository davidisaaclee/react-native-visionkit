import type { HybridObject } from 'react-native-nitro-modules';

// --- Values --- //

export interface CGRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GenerateMaskedImageOptions {
  ofInstances: number[];
  from: VNImageRequestHandler;
  croppedToInstancesExtent: boolean;
}

// --- Core Image --- //

export interface CIImage extends HybridObject<{ ios: 'swift' }> {
  readonly extent: CGRect;
  writePngToFile(path: string): void;
}

// --- Core Video --- //

export interface CVPixelBuffer extends HybridObject<{ ios: 'swift' }> {
  data(): ArrayBuffer;
  readonly width: number;
  readonly height: number;
  toCIImage(): CIImage;
}

// -- Vision -- /

export interface VNImageRequestHandler extends HybridObject<{ ios: 'swift' }> {
  perform(requests: VNImageBasedRequest[]): void;
}

export interface VNContour extends HybridObject<{ ios: 'swift' }> {
  readonly pointCount: number;
  /** Flattened array of simd_float2 { x1, y1, x2, y2, ... } */
  readonly normalizedPointsFlat: number[];
  polygonApproximation(epsilon: number): VNContour;
}

// --- VNObservations --- //

export interface VNObservation extends HybridObject<{ ios: 'swift' }> {
  readonly confidence: number;
}

export interface VNInstanceMaskObservation extends VNObservation {
  readonly instanceMask: CVPixelBuffer;
  readonly allInstances: number[];
  generateMaskForInstances(instanceIds: number[]): CVPixelBuffer;
  generateMaskedImage(opts: GenerateMaskedImageOptions): CVPixelBuffer;
}

export interface VNContoursObservation extends VNObservation {
  readonly topLevelContours: VNContour[];
  readonly contourCount: number;
  contourAt(index: number): VNContour;
}

// --- VNRequests --- //

export interface VNImageBasedRequest extends HybridObject<{ ios: 'swift' }> {
  regionOfInterest: CGRect;
}

export interface VNGenerateForegroundInstanceMaskRequest
  extends VNImageBasedRequest {
  readonly results?: VNInstanceMaskObservation[];
}

export interface VNDetectContoursRequest extends VNImageBasedRequest {
  contrastAdjustment: number;
  contrastPivot?: number;
  detectsDarkOnLight: boolean;
  /** https://developer.apple.com/documentation/vision/vndetectcontoursrequest/maximumimagedimension */
  maximumImageDimension: number;
  readonly results?: VNContoursObservation[];
}

// --- Factories --- //

export interface VNGenerateForegroundInstanceMaskRequestFactory
  extends HybridObject<{ ios: 'swift' }> {
  create(): VNGenerateForegroundInstanceMaskRequest;
}

export interface CIImageFactory extends HybridObject<{ ios: 'swift' }> {
  createFromFile(path: string): CIImage;
}

export interface VNImageRequestHandlerFactory
  extends HybridObject<{ ios: 'swift' }> {
  createWithCIImage(ciImage: CIImage): VNImageRequestHandler;
}

export interface VNDetectContoursRequestFactory
  extends HybridObject<{ ios: 'swift' }> {
  create(): VNDetectContoursRequest;
}
