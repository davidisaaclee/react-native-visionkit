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

      const ciImage = VK.CIImageFactory.createFromFile(FILE_PATH);
      const ciImageOutput = fs.TemporaryDirectoryPath + 'ciImage.png';
      // ciImage.writePngToFile(ciImageOutput);
      // setFromCIImage(ciImageOutput);

      ciImage.generateForegroundMasks().then((masks) => {
        console.log('mask count:', masks.length);
        console.log(
          'allInstances',
          masks.map((m) => m.allInstances)
        );

        const mask = masks.at(0);
        if (mask) {
          mask
            .generateMaskForInstances(mask.allInstances)
            .toCIImage()
            .writePngToFile(ciImageOutput);
          console.log('Wrote mask to ', ciImageOutput);
          setFromCIImage(ciImageOutput);
        }
      });
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
