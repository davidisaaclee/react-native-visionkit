import { NitroModules } from 'react-native-nitro-modules';
import type * as spec from './Visionkit.nitro';

export const CIImage =
  NitroModules.createHybridObject<spec.CIImageFactory>('CIImageFactory');
export const VNGenerateForegroundInstanceMaskRequest =
  NitroModules.createHybridObject<spec.VNGenerateForegroundInstanceMaskRequestFactory>(
    'VNGenerateForegroundInstanceMaskRequestFactory'
  );
export const VNImageRequestHandler =
  NitroModules.createHybridObject<spec.VNImageRequestHandlerFactory>(
    'VNImageRequestHandlerFactory'
  );
