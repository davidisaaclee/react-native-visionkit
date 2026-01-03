import { NitroModules } from 'react-native-nitro-modules';
import type * as spec from './Visionkit.nitro';

// export const CIImage = NitroModules.createHybridObject<spec.CIImage>('CIImage');
export const CIImageFactory =
  NitroModules.createHybridObject<spec.CIImageFactory>('CIImageFactory');
// export const CVPixelBuffer =
//   NitroModules.createHybridObject<spec.CVPixelBuffer>('CVPixelBuffer');
// export const VNInstanceMaskObservation =
//   NitroModules.createHybridObject<spec.VNInstanceMaskObservation>(
//     'VNInstanceMaskObservation'
//   );
