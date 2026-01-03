import { useEffect, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import * as fs from 'react-native-fs';
import * as VK from 'react-native-visionkit';

const FILE_PATH = fs.TemporaryDirectoryPath + '/symbols.png';

export default function App() {
  const [fromCIImage, setFromCIImage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { promise } = fs.downloadFile({
        fromUrl: Image.resolveAssetSource(require('./symbols.png'))!.uri,
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

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: fromCIImage ?? undefined,
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
