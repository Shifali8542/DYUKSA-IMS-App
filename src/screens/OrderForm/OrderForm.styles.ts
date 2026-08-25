import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safe:    { flex: 1 },
  scroll:  { flexGrow: 1 },
  row:     { flexDirection: 'row', gap: 12 },
  half:    { flex: 1 },
  totalRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});