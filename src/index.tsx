import { NitroModules } from 'react-native-nitro-modules';
import type * as spec from './Visionkit.nitro';

export const CIImageFactory =
  NitroModules.createHybridObject<spec.CIImageFactory>('CIImageFactory');
export const VNGenerateForegroundInstanceMaskRequestFactory =
  NitroModules.createHybridObject<spec.VNGenerateForegroundInstanceMaskRequestFactory>(
    'VNGenerateForegroundInstanceMaskRequestFactory'
  );
export const VNImageRequestHandlerFactory =
  NitroModules.createHybridObject<spec.VNImageRequestHandlerFactory>(
    'VNImageRequestHandlerFactory'
  );
export const VNDetectContoursRequestFactory =
  NitroModules.createHybridObject<spec.VNDetectContoursRequestFactory>(
    'VNDetectContoursRequestFactory'
  );

export type * from './Visionkit.nitro';
