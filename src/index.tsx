import { NitroModules } from 'react-native-nitro-modules';
import type { Visionkit } from './Visionkit.nitro';

const VisionkitHybridObject =
  NitroModules.createHybridObject<Visionkit>('Visionkit');

export function multiply(a: number, b: number): number {
  return VisionkitHybridObject.multiply(a, b);
}
