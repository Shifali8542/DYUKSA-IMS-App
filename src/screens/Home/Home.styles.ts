import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safe:         { flex: 1 },
  scroll:       { flexGrow: 1 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting:     {},
  name:         {},
  orgBadge:     {},
  sectionTitle: { letterSpacing: 0.8 },
  kpiRow:       { flexDirection: 'row' },
  actionsRow:   { flexDirection: 'row' },
  actionBtn:    { flex: 1, alignItems: 'center' },
  alertCard:    {},
  alertRow:     { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  whRow:        {},
  whHeader:     { flexDirection: 'row', justifyContent: 'space-between' },
  progressBg:   { height: 6 },
  progressFill: { height: 6 },
});
