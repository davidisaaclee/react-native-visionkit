import type { HybridObject } from 'react-native-nitro-modules';

export interface Visionkit extends HybridObject<{ ios: 'swift' }> {
  multiply(a: number, b: number): number;
}
