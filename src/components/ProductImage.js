// The picture of a product. Each product in campus.json has a
// photo in assets/products/. Print jobs have no photo, so they
// keep the printer icon.
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme/theme';

// require() has to be written out here. A path built from a
// variable (assets/products/${id}.jpg) is not bundled.
const PHOTOS = {
  p1: require('../../assets/products/p1-chicken-sandwich.jpg'),
  p2: require('../../assets/products/p2-cheese-manakish.jpg'),
  p3: require('../../assets/products/p3-falafel-wrap.jpg'),
  p4: require('../../assets/products/p4-beef-burger.jpg'),
  p5: require('../../assets/products/p5-pasta.jpg'),
  p6: require('../../assets/products/p6-pizza-slice.jpg'),
  p7: require('../../assets/products/p7-caesar-salad.jpg'),
  p8: require('../../assets/products/p8-fruit-yogurt.jpg'),
  p9: require('../../assets/products/p9-espresso.jpg'),
  p10: require('../../assets/products/p10-cappuccino.jpg'),
  p11: require('../../assets/products/p11-latte.jpg'),
  p12: require('../../assets/products/p12-tea.jpg'),
  p13: require('../../assets/products/p13-iced-coffee.jpg'),
  p14: require('../../assets/products/p14-hot-chocolate.jpg'),
  p15: require('../../assets/products/p15-croissant.jpg'),
  p16: require('../../assets/products/p16-notebook.jpg'),
  p17: require('../../assets/products/p17-pens.jpg'),
  p18: require('../../assets/products/p18-highlighters.jpg'),
  p19: require('../../assets/products/p19-binder.jpg'),
  p20: require('../../assets/products/p20-sticky-notes.jpg'),
  p21: require('../../assets/products/p21-pencil-case.jpg'),
  p22: require('../../assets/products/p22-hoodie.jpg'),
  p23: require('../../assets/products/p23-paper.jpg'),
  p24: require('../../assets/products/p24-binding-cover.jpg'),
  p25: require('../../assets/products/p25-spiral.jpg'),
};

export default function ProductImage({ productId, category, size = 56 }) {
  const photo = PHOTOS[productId];
  if (photo) {
    return (
      <Image
        source={photo}
        resizeMode="cover"
        style={[styles.photo, { width: size, height: size }]}
      />
    );
  }

  // Print jobs, and any future item with no photo, keep an icon.
  const icon = category === 'Printing' ? 'print' : 'pricetag';
  return (
    <View style={[styles.tile, { width: size, height: size }]}>
      <Ionicons name={icon} size={size * 0.45} color={colors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
  },
  tile: {
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
