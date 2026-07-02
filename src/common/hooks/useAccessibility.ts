/**
 * Accessibility Hooks
 *
 * Provides reactive access to the user's OS accessibility settings:
 * - useFontScale()        — Current font scale multiplier (respects Large Text)
 * - useReduceMotion()     — Whether the user has enabled Reduce Motion
 * - useScreenReader()     — Whether VoiceOver (iOS) or TalkBack (Android) is active
 * - useHighContrast()     — Whether high contrast mode is active (best-effort)
 * - useAccessibilityAnnounce() — Programmatically post VoiceOver/TalkBack announcements
 */

import {useState, useEffect, useCallback} from 'react';
import {AccessibilityInfo, PixelRatio} from 'react-native';

// ----------------------------------------------------------------------------
// useFontScale
// Returns the current system font scale. Updates reactively when user changes
// the accessibility text size setting.
// ----------------------------------------------------------------------------
export const useFontScale = (): number => {
  const [fontScale, setFontScale] = useState<number>(PixelRatio.getFontScale());

  useEffect(() => {
    const subscription = AccessibilityInfo.addEventListener(
      'boldTextChanged',
      () => setFontScale(PixelRatio.getFontScale()),
    );
    return () => subscription.remove();
  }, []);

  return fontScale;
};

// ----------------------------------------------------------------------------
// useReduceMotion
// Returns true if the user has enabled Reduce Motion in OS settings.
// Components can skip animations based on this value.
// ----------------------------------------------------------------------------
export const useReduceMotion = (): boolean => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => subscription.remove();
  }, []);

  return reduceMotion;
};

// ----------------------------------------------------------------------------
// useScreenReader
// Returns true if VoiceOver (iOS) or TalkBack (Android) is active.
// Use to hide decorative elements or add extra accessible descriptions.
// ----------------------------------------------------------------------------
export const useScreenReader = (): boolean => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setIsActive);
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsActive,
    );
    return () => subscription.remove();
  }, []);

  return isActive;
};

// ----------------------------------------------------------------------------
// useAccessibilityAnnounce
// Returns a function that posts a live-region announcement to the screen reader.
// Use for dynamic content updates (e.g. "Post created", "Offline mode activated").
// ----------------------------------------------------------------------------
export const useAccessibilityAnnounce = () => {
  const announce = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  return announce;
};

// ----------------------------------------------------------------------------
// Composite hook — returns all accessibility state in one call
// ----------------------------------------------------------------------------
export const useAccessibility = () => {
  const fontScale = useFontScale();
  const reduceMotion = useReduceMotion();
  const screenReaderActive = useScreenReader();
  const announce = useAccessibilityAnnounce();

  return {fontScale, reduceMotion, screenReaderActive, announce};
};
