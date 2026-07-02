/**
 * Theme System Tests
 * Tests theme slice reducer actions, and dark/light color tokens.
 */

import {themeReducer, setThemeMode} from '../themeSlice';
import {colors} from '../colors';
import {lightTheme, darkTheme} from '../index';

describe('themeSlice', () => {
  const initialState = themeReducer(undefined, {type: '@@INIT'});

  it('defaults to system theme', () => {
    expect(initialState.mode).toBe('system');
  });

  it('updates the theme mode', () => {
    const state = themeReducer(initialState, setThemeMode('dark'));
    expect(state.mode).toBe('dark');
  });

  it('updates the theme mode to light', () => {
    const state = themeReducer(initialState, setThemeMode('light'));
    expect(state.mode).toBe('light');
  });
});

describe('Theme Tokens', () => {
  it('has identical token keys for light and dark modes', () => {
    const lightKeys = Object.keys(colors.light).sort();
    const darkKeys = Object.keys(colors.dark).sort();
    expect(lightKeys).toEqual(darkKeys);
  });

  it('light theme should define all ColorTokens properties', () => {
    expect(lightTheme.colors.primary).toBeDefined();
    expect(lightTheme.colors.background).toBeDefined();
    expect(lightTheme.colors.surface).toBeDefined();
    expect(lightTheme.colors.text).toBeDefined();
    expect(lightTheme.colors.border).toBeDefined();
    expect(lightTheme.colors.skeleton).toBeDefined();
  });

  it('dark theme should define all ColorTokens properties', () => {
    expect(darkTheme.colors.primary).toBeDefined();
    expect(darkTheme.colors.background).toBeDefined();
    expect(darkTheme.colors.surface).toBeDefined();
    expect(darkTheme.colors.text).toBeDefined();
    expect(darkTheme.colors.border).toBeDefined();
    expect(darkTheme.colors.skeleton).toBeDefined();
  });

  it('light theme colors background is white or off-white HSL', () => {
    expect(lightTheme.colors.background.includes('100%')).toBe(true);
  });

  it('dark theme colors background is dark HSL', () => {
    expect(darkTheme.colors.background.includes('5%')).toBe(true);
  });
});
