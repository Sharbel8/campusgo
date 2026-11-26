// The picture of a product: a blue tile with an icon that matches
// its category (a cup for drinks, a book for notebooks...).
// To use real photos later, add them in assets/ and swap the
// <Ionicons> for an <Image>, like the store logos on Home.
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme/theme';

const CATEGORY_ICONS = {
  Sandwiches: 'fast-food',
  'Hot meals': 'pizza',
  Salads: 'leaf',
  'Hot drinks': 'cafe',
  'Cold drinks': 'snow',
  Snacks: 'ice-cream',
  Notebooks: 'book',
  Stationery: 'pencil',
  Clothes: 'shirt',
  Supplies: 'documents',
  Printing: 'print', // print jobs from the Print tab
};

export default function ProductImage({ category, size = 56 }) {
  // a default icon in case a new category is added to the JSON
  const icon = CATEGORY_ICONS[category] || 'pricetag';

  return (
    <View style={[styles.tile, { width: size, height: size }]}>
      <Ionicons name={icon} size={size * 0.45} color={colors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
