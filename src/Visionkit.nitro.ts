import type { HybridObject } from 'react-native-nitro-modules';

export interface CIImage extends HybridObject<{ ios: 'swift' }> {
  writePngToFile(path: string): void;
  generateForegroundMasks(): Promise<VNInstanceMaskObservation[]>;
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
