import { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Button, Dimensions } from 'react-native';
import * as fs from 'react-native-fs';
import * as VK from 'react-native-visionkit';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';

const FILE_PATH = fs.TemporaryDirectoryPath + '/symbols.png';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const targetAsset = require('./worms.png');

export default function App() {
  const [fromCIImage, setFromCIImage] = useState<string | null>(null);
  const [contourPaths, setContourPaths] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { promise } = fs.downloadFile({
        fromUrl: Image.resolveAssetSource(targetAsset)!.uri,
        // fromUrl: Image.resolveAssetSource(require('./doggie.jpg'))!.uri,
        toFile: FILE_PATH,
      });

      await promise;

      let start = Date.now();
      const ciImage = VK.CIImage.createFromFile(FILE_PATH);
      const ciImageOutput = fs.TemporaryDirectoryPath + 'ciImage.png';

      console.log(Date.now() - start, 'Create CIImage');
      start = Date.now();

      const req = VK.VNGenerateForegroundInstanceMaskRequest.create();
      const handler = VK.VNImageRequestHandler.createWithCIImage(ciImage);

      console.log(Date.now() - start, 'Create handler');
      start = Date.now();

      handler.perform([req]);
      const masks = req.results;
      if (masks == null) {
        console.log('No masks generated');
        return;
      }

      console.log('mask count:', masks.length);
      console.log(
        'allInstances',
        masks.map((m) => m.allInstances)
      );
      console.log(Date.now() - start, 'Generate mask');

      const mask = masks.at(0);
      if (mask) {
        mask
          .generateMaskForInstances(mask.allInstances)
          .toCIImage()
          .writePngToFile(ciImageOutput);
        setFromCIImage(ciImageOutput);
        console.log('wrote mask to file');
      }
    })();
  }, []);

  const detectContours = async () => {
    console.log('Detecting contours...');
    const start = Date.now();

    const ciImage = VK.CIImage.createFromFile(FILE_PATH);

    const request = VK.VNDetectContoursRequest.create();
    request.contrastAdjustment = 1.0;
    request.detectsDarkOnLight = true;

    const handler = VK.VNImageRequestHandler.createWithCIImage(ciImage);
    handler.perform([request]);

    console.log(Date.now() - start, 'Contour detection');

    if (request.results) {
      const paths: string[] = [];

      for (const observation of request.results) {
        console.log('Contour observation confidence:', observation.confidence);
        console.log('Top level contours:', observation.topLevelContours.length);

        for (const contour of observation.topLevelContours) {
          const pathString = contourToSVGPath(contour);
          paths.push(pathString);
        }
      }

      console.log('Generated', paths.length, 'contour paths');
      setContourPaths(paths);
    }
  };

  const contourToSVGPath = (contour: VK.VNContour): string => {
    const points = contour.normalizedPointsFlat;
    if (points.length < 2) return '';

    // Vision coordinates are normalized (0-1) with origin at bottom-left
    // Convert to screen coordinates with origin at top-left
    let path = `M ${points[0] * SCREEN_WIDTH} ${
      (1 - points[1]) * SCREEN_HEIGHT
    }`;

    for (let i = 2; i < points.length; i += 2) {
      path += ` L ${points[i] * SCREEN_WIDTH} ${
        (1 - points[i + 1]) * SCREEN_HEIGHT
      }`;
    }

    path += ' Z';
    return path;
  };

  return (
    <View style={styles.container}>
      <Image
        source={targetAsset}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
        }}
        resizeMode="contain"
      />

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
        <Button title="Detect Contours" onPress={detectContours} />
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
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
});
