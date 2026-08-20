import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  icon: {
    fontSize: 72,
  },
  title: {
    textAlign: 'center',
  },
  desc: {
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {},
  btn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: {},
});
