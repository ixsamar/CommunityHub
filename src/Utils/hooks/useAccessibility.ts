import {useState, useEffect, useCallback} from 'react';
import {AccessibilityInfo, PixelRatio} from 'react-native';

export const useFontScale = (): number => {
  const [fontScale, setFontScale] = useState<number>(PixelRatio.getFontScale());

  useEffect(() => {
    const subscription = AccessibilityInfo.addEventListener('boldTextChanged', () =>
      setFontScale(PixelRatio.getFontScale()),
    );
    return () => subscription.remove();
  }, []);

  return fontScale;
};

export const useReduceMotion = (): boolean => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  return reduceMotion;
};

export const useScreenReader = (): boolean => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setIsActive);
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setIsActive);
    return () => subscription.remove();
  }, []);

  return isActive;
};

export const useAccessibilityAnnounce = () => {
  const announce = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  return announce;
};

export const useAccessibility = () => {
  const fontScale = useFontScale();
  const reduceMotion = useReduceMotion();
  const screenReaderActive = useScreenReader();
  const announce = useAccessibilityAnnounce();

  return {fontScale, reduceMotion, screenReaderActive, announce};
};
