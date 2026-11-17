// Screen 4 — Printing Service.
// The user fills a print form. The price is recalculated live on
// every change, and the job is added to the cart of UA Copy
// (the Printing Office), to be delivered to the classroom.
import { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import campus from '../data/campus.json';
import { useCart } from '../context/CartContext';
import { isStoreOpen } from '../utils/storeHours';
import AppButton from '../components/AppButton';
import { colors, spacing, radius, typography } from '../theme/theme';

// The price table comes from campus.json:
// { bwPerPage: 0.05, colorPerPage: 0.25, staple: 0.1, spiral: 1.5, maxPages: 200 }
const PRICES = campus.printPrices;
const PRINT_STORE_ID = 'printing';

// The choices for each option. "value" is what we store in state,
// "label" is what the user sees.
const COLOR_OPTIONS = [
  { value: 'bw', label: 'Black & white' },
  { value: 'color', label: 'Color' },
];
const SIDE_OPTIONS = [
  { value: 'single', label: 'Single-sided' },
  { value: 'double', label: 'Double-sided' },
];
const BINDING_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'staple', label: 'Staple' },
  { value: 'spiral', label: 'Spiral' },
];

// There is no real file upload in this project (the brief says it
// is simulated). The "Choose document" button picks one of these.
const SAMPLE_DOCUMENTS = [
  { name: 'Lecture 5 - Networks.pdf', pages: 24 },
  { name: 'Lab report - Physics.docx', pages: 8 },
  { name: 'Mobile Dev - Project brief.pdf', pages: 5 },
  { name: 'Database course notes.pdf', pages: 62 },
  { name: 'CV.pdf', pages: 2 },
];

function money(amount) {
  return '$' + Number(amount).toFixed(2);
}

function findById(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return list[i];
    }
  }
  return null;
}

function labelOf(options, value) {
  for (let i = 0; i < options.length; i++) {
    if (options[i].value === value) {
      return options[i].label;
    }
  }
  return '';
}

// Keep only the digits the user typed: "12a" -> "12".
function onlyDigits(text) {
  return text.replace(/[^0-9]/g, '');
}

// A row of pill buttons where exactly one is selected.
// It uses a horizontal FlatList, like the category chips on Home.
function OptionPicker(props) {
  return (
    <FlatList
      horizontal
      data={props.options}
      keyExtractor={(item) => item.value}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => {
        const on = item.value === props.value;
        return (
          <Pressable onPress={() => props.onChange(item.value)} style={[styles.chip, on && styles.chipOn]}>
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{item.label}</Text>
          </Pressable>
        );
      }}
    />
  );
}

export default function PrintingScreen({ navigation }) {
  // ---- Form state: one useState per field -------------------------
  const [docName, setDocName] = useState('');
  const [pagesText, setPagesText] = useState(''); // TextInput gives text
  const [copiesText, setCopiesText] = useState('1');
  const [color, setColor] = useState('bw');
  const [sides, setSides] = useState('single');
  const [binding, setBinding] = useState('none');
  // false until the user presses "Add": then empty fields show errors too
  const [submitted, setSubmitted] = useState(false);

  const { cartStoreId, addItem, clearCart } = useCart();
  const store = findById(campus.stores, PRINT_STORE_ID);
  const open = isStoreOpen(store);

  // ---- Live price ------------------------------------------------
  // Everything below runs again on every render, and every option
  // change causes a render. That's what makes the price "live".
  const pages = pagesText === '' ? 0 : Number(pagesText);
  const copies = copiesText === '' ? 0 : Number(copiesText);
  const totalPages = pages * copies; // pages printed for the whole order

  const pagePrice = color === 'color' ? PRICES.colorPerPage : PRICES.bwPerPage;
  let bindingPrice = 0; // binding is paid once per copy
  if (binding === 'staple') {
    bindingPrice = PRICES.staple;
  } else if (binding === 'spiral') {
    bindingPrice = PRICES.spiral;
  }
  const pricePerCopy = pages * pagePrice + bindingPrice;
  const total = pricePerCopy * copies;
  // double-sided prints 2 pages per sheet: 5 pages -> 3 sheets
  const sheetsPerCopy = sides === 'double' ? Math.ceil(pages / 2) : pages;

  // ---- Validation ------------------------------------------------
  // Each error is '' when the field is fine.
  let nameError = '';
  if (docName.trim() === '') {
    nameError = 'Choose or type a document name.';
  }
  let pagesError = '';
  if (pages <= 0) {
    pagesError = 'Pages must be greater than 0.';
  }
  let copiesError = '';
  if (copies <= 0) {
    copiesError = 'Copies must be greater than 0.';
  } else if (totalPages > PRICES.maxPages) {
    copiesError =
      pages +
      ' pages × ' +
      copies +
      ' copies = ' +
      totalPages +
      ' pages. The maximum is ' +
      PRICES.maxPages +
      ' per order.';
  }
  const formOk = nameError === '' && pagesError === '' && copiesError === '';

  // Show an error if the user pressed Add, or already typed something wrong.
  const showNameError = submitted && nameError !== '';
  const showPagesError = (submitted || pagesText !== '') && pagesError !== '';
  const showCopiesError = (submitted || copiesText !== '') && copiesError !== '';

  // ---- Actions ---------------------------------------------------
  function simulateUpload() {
    const index = Math.floor(Math.random() * SAMPLE_DOCUMENTS.length);
    const doc = SAMPLE_DOCUMENTS[index];
    setDocName(doc.name);
    setPagesText(String(doc.pages));
  }

  function changeCopies(amount) {
    const next = copies + amount;
    if (next >= 1) {
      setCopiesText(String(next));
    }
  }

  function resetForm() {
    setDocName('');
    setPagesText('');
    setCopiesText('1');
    setColor('bw');
    setSides('single');
    setBinding('none');
    setSubmitted(false);
  }

  function buildCartItem() {
    // The options are written as text "extras" so the Cart screen
    // can show them like the options of any other product.
    const details = [
      pages + ' pages × ' + copies + (copies === 1 ? ' copy' : ' copies'),
      labelOf(COLOR_OPTIONS, color),
      labelOf(SIDE_OPTIONS, sides),
    ];
    if (binding !== 'none') {
      details.push(labelOf(BINDING_OPTIONS, binding) + ' binding');
    }
    return {
      key: 'print-' + Date.now(), // every print job is its own cart line
      productId: 'print',
      storeId: PRINT_STORE_ID,
      name: docName.trim(),
      category: 'Printing',
      size: null,
      extras: details,
      unitPrice: total, // the whole job is ONE item, so the cart's
      quantity: 1, //      + / − can't push it past 200 pages
      printJob: { pages, copies, color, sides, binding },
    };
  }

  function addAndConfirm(item) {
    addItem(item);
    resetForm();
    Alert.alert('Added to cart', item.name + ' was added to your UA Copy order.', [
      { text: 'Keep printing', style: 'cancel' },
      { text: 'Go to cart', onPress: () => navigation.navigate('Cart') },
    ]);
  }

  function onAddPress() {
    setSubmitted(true);
    if (!formOk || !open) {
      return;
    }
    const item = buildCartItem();

    // Same rule as Screen 3: the cart holds ONE store only.
    if (cartStoreId !== null && cartStoreId !== PRINT_STORE_ID) {
      const cartStore = findById(campus.stores, cartStoreId);
      Alert.alert(
        'Start a new cart?',
        'Your cart has items from ' + cartStore.name + '. Empty it to add this print job from ' + store.name + '?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Empty cart',
            style: 'destructive',
            onPress: () => {
              clearCart();
              addAndConfirm(item);
            },
          },
        ],
      );
      return;
    }

    addAndConfirm(item);
  }

  // ---- Screen ----------------------------------------------------
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* keyboardShouldPersistTaps: tapping a button closes the keyboard AND presses it */}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={typography.eyebrow}>Printing office</Text>
        <Text style={typography.title}>Print</Text>
        <Text style={styles.subtitle}>
          {store.name} prints it and brings it to your classroom. Ready in about {store.prepMinutes} min.
        </Text>

        {!open && (
          <View style={styles.closedBox}>
            <Ionicons name="time-outline" size={18} color={colors.text} />
            <Text style={styles.closedText}>
              {store.name} is closed now (open {store.opens}–{store.closes}). You can fill the form, but not order.
            </Text>
          </View>
        )}

        {/* Document */}
        <Text style={styles.label}>DOCUMENT</Text>
        <TextInput
          style={[styles.input, showNameError && styles.inputError]}
          value={docName}
          onChangeText={setDocName}
          placeholder="e.g. Lecture notes.pdf"
          placeholderTextColor={colors.textFaint}
        />
        {showNameError && <Text style={styles.error}>{nameError}</Text>}
        <Pressable onPress={simulateUpload} style={styles.uploadButton}>
          <Ionicons name="cloud-upload-outline" size={18} color={colors.text} />
          <Text style={styles.uploadText}>Choose document (simulated upload)</Text>
        </Pressable>

        {/* Pages and copies, side by side */}
        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>PAGES</Text>
            <TextInput
              style={[styles.input, showPagesError && styles.inputError]}
              value={pagesText}
              onChangeText={(text) => setPagesText(onlyDigits(text))}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textFaint}
              maxLength={3}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>COPIES</Text>
            <View style={styles.stepper}>
              <Pressable onPress={() => changeCopies(-1)} style={styles.stepButton}>
                <Ionicons name="remove" size={20} color={colors.text} />
              </Pressable>
              <TextInput
                style={[styles.stepInput, showCopiesError && styles.inputError]}
                value={copiesText}
                onChangeText={(text) => setCopiesText(onlyDigits(text))}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Pressable onPress={() => changeCopies(1)} style={styles.stepButton}>
                <Ionicons name="add" size={20} color={colors.text} />
              </Pressable>
            </View>
          </View>
        </View>
        {showPagesError && <Text style={styles.error}>{pagesError}</Text>}
        {showCopiesError && <Text style={styles.error}>{copiesError}</Text>}

        <Text style={styles.label}>COLOR</Text>
        <OptionPicker options={COLOR_OPTIONS} value={color} onChange={setColor} />

        <Text style={styles.label}>SIDES</Text>
        <OptionPicker options={SIDE_OPTIONS} value={sides} onChange={setSides} />

        <Text style={styles.label}>BINDING</Text>
        <OptionPicker options={BINDING_OPTIONS} value={binding} onChange={setBinding} />

        {/* Live price breakdown */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {pages} pages × {money(pagePrice)}
            </Text>
            <Text style={styles.priceValue}>{money(pages * pagePrice)}</Text>
          </View>
          {binding !== 'none' && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{labelOf(BINDING_OPTIONS, binding)} binding</Text>
              <Text style={styles.priceValue}>{money(bindingPrice)}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price per copy</Text>
            <Text style={styles.priceValue}>{money(pricePerCopy)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Copies</Text>
            <Text style={styles.priceValue}>× {copies}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{money(total)}</Text>
          </View>
          <Text style={styles.sheets}>
            Uses {sheetsPerCopy * copies} sheet{sheetsPerCopy * copies === 1 ? '' : 's'} of paper
          </Text>
        </View>

        <AppButton
          title={open ? 'Add to cart · ' + money(total) : 'Printing office closed'}
          disabled={!open}
          onPress={onAddPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  subtitle: { ...typography.muted, marginTop: spacing.xs },
  closedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  closedText: { color: colors.text, fontWeight: '600', flex: 1 },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    height: 52,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
  },
  inputError: { borderColor: colors.danger, borderWidth: 2 },
  error: { color: colors.text, backgroundColor: 'rgba(239,68,68,0.35)', borderRadius: 8, padding: 8, marginTop: 6 },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  uploadText: { color: colors.text, fontWeight: '600' },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInput: {
    flex: 1,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipOn: { backgroundColor: colors.accent },
  chipText: { color: colors.text, fontWeight: '700' },
  chipTextOn: { color: colors.onAccent },
  priceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  priceLabel: { color: colors.textMuted, fontSize: 15 },
  priceValue: { color: colors.text, fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  totalLabel: { color: colors.text, fontSize: 18, fontWeight: '700' },
  totalValue: { color: colors.text, fontSize: 22, fontWeight: '700' },
  sheets: { ...typography.caption, marginTop: spacing.xs },
});
