import { useRef, useState } from 'react';
import { View, StyleSheet, Image, Button, Dimensions } from 'react-native';
import * as fs from 'react-native-fs';
import * as VK from 'react-native-visionkit';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// const targetAsset = require('./gnome.jpg');
const targetAsset = require('./symbols.png');

function newTmpPath(): string {
  return fs.TemporaryDirectoryPath + `/img_${Date.now()}.png`;
}

const contourToSVGPath = (contour: VK.VNContour): string => {
  const points = contour.normalizedPointsFlat;
  if (points.length < 2) return '';

  // Vision coordinates are normalized (0-1) with origin at bottom-left
  // Convert to screen coordinates with origin at top-left
  let path = `M ${points[0]! * SCREEN_WIDTH} ${
    (1 - points[1]!) * SCREEN_HEIGHT
  }`;

  for (let i = 2; i < points.length; i += 2) {
    path += ` L ${points[i]! * SCREEN_WIDTH} ${
      (1 - points[i + 1]!) * SCREEN_HEIGHT
    }`;
  }

  path += ' Z';
  return path;
};

const rectToSVGPath = (rect: VK.CGRect): string => {
  // Vision coordinates are normalized (0-1) with origin at bottom-left
  // Convert to screen coordinates with origin at top-left
  const x = rect.x * SCREEN_WIDTH;
  const y = (1 - rect.y - rect.height) * SCREEN_HEIGHT;
  const width = rect.width * SCREEN_WIDTH;
  const height = rect.height * SCREEN_HEIGHT;

  return `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${
    y + height
  } Z`;
};

async function writeAssetToFile(asset: any, path: string): Promise<void> {
  const { promise } = fs.downloadFile({
    fromUrl: Image.resolveAssetSource(asset)!.uri,
    // fromUrl: Image.resolveAssetSource(require('./doggie.jpg'))!.uri,
    toFile: path,
  });
  await promise;
}

export default function App() {
  const [imageSet, setImageSet] = useState<string[]>([]);
  const [maskObservation, setMaskObservation] =
    useState<VK.VNInstanceMaskObservation | null>(null);
  const imageHandlerRef = useRef<VK.VNImageRequestHandler | null>(null);
  const [contourPaths, setContourPaths] = useState<string[]>([]);

  const detectContours = async () => {
    const basePath = newTmpPath();
    await writeAssetToFile(targetAsset, basePath);

    const baseImage = new VK.CIImage(basePath);

    const contoursReq = new VK.VNDetectContoursRequest();
    contoursReq.contrastAdjustment = 2.0;
    // contoursReq.detectsDarkOnLight = false;

    const contoursHandler = new VK.VNImageRequestHandler(baseImage);
    contoursHandler.perform([contoursReq]);
    const contourResult = contoursReq.results?.at(0);
    if (contourResult == null) {
      console.log('no contours detected');
      return;
    }
    setContourPaths(
      contourResult.topLevelContours.map((c) => contourToSVGPath(c))
    );
  };

  const generateMasks = async (
    regionsOfInterest?: Array<VK.CGRect | undefined>
  ) => {
    const rois = regionsOfInterest ?? [undefined];

    const basePath = newTmpPath();
    await writeAssetToFile(targetAsset, basePath);

    console.log('Create CIImage');
    const base = new VK.CIImage(basePath);
    console.log('Created');

    const nextImageSet: string[] = [];
    for (const roi of rois) {
      // Generate foreground masks
      const maskReq = new VK.VNGenerateForegroundInstanceMaskRequest();
      if (roi) {
        maskReq.regionOfInterest = roi;
      }
      const handler = new VK.VNImageRequestHandler(base);
      handler.perform([maskReq]);

      const masks = maskReq.results;
      if (!masks || masks.length === 0) {
        console.log('No masks generated');
        return;
      }
      console.log('Generated masks:', masks.length);

      const mask = masks.at(0)!;
      console.log('mask instances:', mask.allInstances);

      const maskImages: string[] = [];
      for (const id of mask.allInstances) {
        const maskPath = newTmpPath();
        const maskBuffer = mask.generateMaskForInstances([id]);
        maskBuffer.toCIImage().writePngToFile(maskPath);
        maskImages.push(maskPath);
      }
      imageHandlerRef.current = handler;

      // TODO: this only sets the last mask observation if multiple ROIs are used
      setMaskObservation(mask);
      nextImageSet.push(...maskImages);
    }

    console.log('Generated', nextImageSet.length, 'mask images');
    setImageSet(nextImageSet);
  };

  const detectMaskContours = async () => {
    const basePath = newTmpPath();
    await writeAssetToFile(targetAsset, basePath);

    console.log('Detecting mask contours...');

    const ciImage = new VK.CIImage(basePath);
    const baseImagePath = newTmpPath();
    ciImage.writePngToFile(baseImagePath);
    // setFromCIImage(baseImagePath);

    // Generate foreground masks
    const maskReq = new VK.VNGenerateForegroundInstanceMaskRequest();
    const handler = new VK.VNImageRequestHandler(ciImage);
    handler.perform([maskReq]);

    const masks = maskReq.results;
    if (!masks || masks.length === 0) {
      console.log('No masks generated');
      return;
    }

    const maskPath = newTmpPath();
    const mask = masks[0]!;
    const maskImage = mask
      .generateMaskForInstances(mask.allInstances)
      .toCIImage();

    maskImage.writePngToFile(maskPath);
    console.log('Wrote mask to', maskPath);
    setImageSet([maskPath]);

    const allPaths: string[] = [];
    const contourReq = new VK.VNDetectContoursRequest();
    // contourReq.maximumImageDimension = 9999999999;
    // contourReq.contrastAdjustment = 1.0;
    // contourReq.detectsDarkOnLight = true;
    // contourReq.detectsDarkOnLight = false;

    const contourHandler = new VK.VNImageRequestHandler(maskImage);
    contourHandler.perform([contourReq]);

    if (contourReq.results) {
      for (const observation of contourReq.results) {
        console.log(
          'Mask contour observation confidence:',
          observation.confidence
        );
        console.log('Top level contours:', observation.topLevelContours.length);
        console.log('All contours:', observation.contourCount);

        for (const contour of observation.topLevelContours) {
          const pathString = contourToSVGPath(contour);
          allPaths.push(pathString);
        }
      }
    }
    console.log('Set paths', allPaths.length);
    setContourPaths(allPaths);
  };

  const detectRects = async (requestType: 'object' | 'attention') => {
    const basePath = newTmpPath();
    await writeAssetToFile(targetAsset, basePath);

    setImageSet([basePath]);

    console.log('Detecting object rects...');
    const start = Date.now();

    const ciImage = new VK.CIImage(basePath);

    const request =
      requestType === 'object'
        ? new VK.VNGenerateObjectnessBasedSaliencyImageRequest()
        : new VK.VNGenerateAttentionBasedSaliencyImageRequest();
    const handler = new VK.VNImageRequestHandler(ciImage);
    handler.perform([request]);

    console.log(Date.now() - start, 'Object rect detection');

    console.log(
      'Request results:',
      request.results?.length ?? 0,
      request.results?.map((x) => x.salientObjects?.length ?? 0)
    );

    const rects: VK.CGRect[] = [];

    if (request.results) {
      const paths: string[] = [];

      for (const observation of request.results) {
        console.log('Saliency observation confidence:', observation.confidence);
        console.log(
          'Salient objects:',
          observation.salientObjects?.length ?? 0
        );

        if (observation.salientObjects) {
          rects.push(
            ...observation.salientObjects.map((obj) => obj.boundingBox)
          );
          for (const obj of observation.salientObjects) {
            console.log('Object bounding box:', obj.boundingBox);
            const pathString = rectToSVGPath(obj.boundingBox);
            paths.push(pathString);
          }
        }
      }

      console.log('Generated', paths.length, 'bounding box paths');
      setContourPaths(paths);
    }
    return rects;
  };

  const detectObjectRects = () => detectRects('object');
  const detectAttentionRects = () => detectRects('attention');

  const renderMask = (index: number) => {
    if (index < 0 || index >= imageSet.length) return;
    if (maskObservation == null) return;
    if (imageHandlerRef.current == null) return;
    const maskImage = maskObservation
      .generateMaskedImage({
        ofInstances: [maskObservation.allInstances[index]!],
        from: imageHandlerRef.current,
        croppedToInstancesExtent: true,
      })
      .toCIImage();

    const imgPath = newTmpPath();
    maskImage.writePngToFile(imgPath);
    const newImageSet = [...imageSet];
    newImageSet[index] = imgPath;
    setImageSet(newImageSet);
  };

  const [counter, setCounter] = useState(0);
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCounter((c) => c + 1);
  //   }, 800);
  //   return () => clearInterval(interval);
  // }, []);
  const displayedImage =
    imageSet.length === 0 ? null : imageSet[counter % imageSet.length];

  return (
    <View style={styles.container}>
      {displayedImage != null && (
        <Image
          source={{ uri: displayedImage }}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}
          resizeMode="contain"
        />
      )}

      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        {contourPaths.map((pathStr, index) => {
          const path = Skia.Path.MakeFromSVGString(pathStr);
          return path ? (
            <Path
              key={index}
              path={path}
              style="stroke"
              strokeWidth={2}
              color="red"
            />
          ) : null;
        })}
      </Canvas>

      <View style={styles.buttonContainer}>
        {imageSet.length > 0 && (
          <>
            <Slider
              value={1}
              minimumValue={0}
              maximumValue={imageSet.length - 1}
              step={1}
              onValueChange={(val) => setCounter(val)}
            />
            <Button
              title="Render mask"
              onPress={() => {
                renderMask(counter % imageSet.length);
              }}
            />
          </>
        )}
        <Button title="Detect Contours" onPress={detectContours} />
        <Button title="Draw Mask Contour" onPress={detectMaskContours} />
        <Button
          title="VNGenerateObjectnessBasedSaliencyImageRequest"
          onPress={detectObjectRects}
        />
        <Button
          title="VNGenerateAttentionBasedSaliencyImageRequest"
          onPress={detectAttentionRects}
        />
        <Button title="Gen masks" onPress={() => generateMasks()} />
        <Button
          title="Gen masks from object rects"
          onPress={async () => {
            const rects = await detectObjectRects();
            generateMasks(rects);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    gap: 10,
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
});
