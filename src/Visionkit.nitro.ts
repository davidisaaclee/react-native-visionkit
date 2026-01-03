import type { HybridObject } from 'react-native-nitro-modules';

export interface CIImage extends HybridObject<{ ios: 'swift' }> {
  writePngToFile(path: string): void;
}

export interface CIImageFactory extends HybridObject<{ ios: 'swift' }> {
  createFromFile(path: string): CIImage;
}

export interface CVPixelBuffer extends HybridObject<{ ios: 'swift' }> {
  data(): ArrayBuffer;
  readonly width: number;
  readonly height: number;
  toCIImage(): CIImage;
}

export interface VNInstanceMaskObservation
  extends HybridObject<{ ios: 'swift' }> {
  readonly instanceMask: CVPixelBuffer;
  readonly allInstances: number[];
  generateMaskForInstances(instanceIds: number[]): CVPixelBuffer;
}

export interface VNGenerateForegroundInstanceMaskRequestFactory
  extends HybridObject<{ ios: 'swift' }> {
  create(): VNGenerateForegroundInstanceMaskRequest;
}

export interface VNGenerateForegroundInstanceMaskRequest
  extends HybridObject<{ ios: 'swift' }> {
  readonly results?: VNInstanceMaskObservation[];
}

export interface VNImageRequestHandlerFactory
  extends HybridObject<{ ios: 'swift' }> {
  createWithCIImage(ciImage: CIImage): VNImageRequestHandler;
}

export interface VNImageRequestHandler extends HybridObject<{ ios: 'swift' }> {
  perform(requests: VNGenerateForegroundInstanceMaskRequest[]): void;
}
