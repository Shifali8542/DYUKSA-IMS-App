import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safe:      { flex: 1 },
  hero:      { flexDirection: 'row', alignItems: 'flex-start' },
  avatar:    { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  stockGrid: { flexDirection: 'row' },
  stockItem: { flex: 1 },
  row:       { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
});
