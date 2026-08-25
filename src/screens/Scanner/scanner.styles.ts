import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#000' },
  camera:      { flex: 1 },
  overlay:     { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanArea:    { width: 280, height: 280, borderRadius: 20, borderWidth: 3, borderColor: 'rgba(59,130,246,0.8)' },
  topBar:      { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bottomBar:   { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center' },
  resultCard:  { width: '90%', borderRadius: 16 },
  permBox:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
});