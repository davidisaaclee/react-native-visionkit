import { NitroModules } from 'react-native-nitro-modules';
import type * as spec from './Visionkit.nitro';

const CIImageFactory =
  NitroModules.createHybridObject<spec.CIImageFactory>('CIImageFactory');
const VNGenerateForegroundInstanceMaskRequestFactory =
  NitroModules.createHybridObject<spec.VNGenerateForegroundInstanceMaskRequestFactory>(
    'VNGenerateForegroundInstanceMaskRequestFactory'
  );
const VNImageRequestHandlerFactory =
  NitroModules.createHybridObject<spec.VNImageRequestHandlerFactory>(
    'VNImageRequestHandlerFactory'
  );
const VNDetectContoursRequestFactory =
  NitroModules.createHybridObject<spec.VNDetectContoursRequestFactory>(
    'VNDetectContoursRequestFactory'
  );

function constructorFactory<
  T extends object,
  Config extends {
    construct: [...unknown[]];
  }
>(
  construct: (...args: Config['construct']) => T
): {
  new (...args: Config['construct']): T;
} {
  return new Proxy(function () {} as any, {
    construct(_target, args) {
      return construct(...(args as Config['construct']));
    },
  });
}

export const CIImage = constructorFactory<
  spec.CIImage,
  { construct: [string] }
>((path) => CIImageFactory.createFromFile(path));

export const VNGenerateForegroundInstanceMaskRequest = constructorFactory<
  spec.VNGenerateForegroundInstanceMaskRequest,
  { construct: [] }
>(() => VNGenerateForegroundInstanceMaskRequestFactory.create());

export const VNImageRequestHandler = constructorFactory<
  spec.VNImageRequestHandler,
  { construct: [spec.CIImage] }
>((image) => VNImageRequestHandlerFactory.createWithCIImage(image));

export const VNDetectContoursRequest = constructorFactory<
  spec.VNDetectContoursRequest,
  { construct: [] }
>(() => VNDetectContoursRequestFactory.create());

export type CIImage = spec.CIImage;
export type VNGenerateForegroundInstanceMaskRequest =
  spec.VNGenerateForegroundInstanceMaskRequest;
export type VNImageRequestHandler = spec.VNImageRequestHandler;
export type VNDetectContoursRequest = spec.VNDetectContoursRequest;

export type {
  CVPixelBuffer,
  VNContour,
  VNContoursObservation,
  VNImageBasedRequest,
  VNInstanceMaskObservation,
} from './Visionkit.nitro';
