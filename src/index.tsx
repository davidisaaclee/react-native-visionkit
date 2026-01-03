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
const VNGenerateObjectnessBasedSaliencyImageRequestFactory =
  NitroModules.createHybridObject<spec.VNGenerateObjectnessBasedSaliencyImageRequestFactory>(
    'VNGenerateObjectnessBasedSaliencyImageRequestFactory'
  );
const VNGenerateAttentionBasedSaliencyImageRequestFactory =
  NitroModules.createHybridObject<spec.VNGenerateAttentionBasedSaliencyImageRequestFactory>(
    'VNGenerateAttentionBasedSaliencyImageRequestFactory'
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

export const VNGenerateObjectnessBasedSaliencyImageRequest = constructorFactory<
  spec.VNGenerateObjectnessBasedSaliencyImageRequest,
  { construct: [] }
>(() => VNGenerateObjectnessBasedSaliencyImageRequestFactory.create());

export const VNGenerateAttentionBasedSaliencyImageRequest = constructorFactory<
  spec.VNGenerateAttentionBasedSaliencyImageRequest,
  { construct: [] }
>(() => VNGenerateAttentionBasedSaliencyImageRequestFactory.create());

export type CIImage = spec.CIImage;
export type VNGenerateForegroundInstanceMaskRequest =
  spec.VNGenerateForegroundInstanceMaskRequest;
export type VNImageRequestHandler = spec.VNImageRequestHandler;
export type VNDetectContoursRequest = spec.VNDetectContoursRequest;
export type VNGenerateObjectnessBasedSaliencyImageRequest =
  spec.VNGenerateObjectnessBasedSaliencyImageRequest;
export type VNGenerateAttentionBasedSaliencyImageRequest =
  spec.VNGenerateAttentionBasedSaliencyImageRequest;

export type {
  CGRect,
  CVPixelBuffer,
  VNContour,
  VNContoursObservation,
  VNDetectedObjectObservation,
  VNImageBasedRequest,
  VNInstanceMaskObservation,
  VNSaliencyImageObservation,
} from './Visionkit.nitro';
