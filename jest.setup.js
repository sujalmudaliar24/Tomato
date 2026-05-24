// Jest setup file to neutralize native dependencies that don't exist in the test environment.

// react-native-gesture-handler depends on native RNGestureHandlerModule.
// For unit tests, we can safely mock it.
jest.mock('react-native-gesture-handler', () => {
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    // Most navigation stacks only need these exports to exist.
    GestureHandlerRootView: View,
    // Provide a no-op gesture handler component.
    PanGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    LongPressGestureHandler: View,
    Swipeable: View,

    // Also provide the native wrapper used by some builds.
    __esModule: true,
    default: View,
  };
});

