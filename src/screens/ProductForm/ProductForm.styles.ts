import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safe:       { flex: 1 },
  scroll:     { flexGrow: 1 },
  section:    { marginBottom: 8 },
  sectionTitle: { marginBottom: 4 },
  row:        { flexDirection: 'row', gap: 12 },
  half:       { flex: 1 },
  pickerWrap: { flexDirection: 'row', alignItems: 'center' },
  pickerBtn:  { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});