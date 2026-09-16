import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useColorScheme,
} from 'react-native';

import {
  getThemePreference,
  setThemePreference,
  ThemePreference,
} from '../lib/theme';

type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  secondary: string;
  border: string;
  primary: string;
};

type ThemeContextValue = {
  themePreference: ThemePreference;
  setTheme: (
    preference: ThemePreference
  ) => Promise<void>;
  isDark: boolean;
  colors: ThemeColors;
};

const ThemeContext =
  createContext<
    ThemeContextValue | undefined
  >(undefined);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemColorScheme =
    useColorScheme();
  

  const [
    themePreference,
    setThemePreferenceState,
  ] = useState<ThemePreference>(
    'system'
  );

  useEffect(() => {
    getThemePreference()
      .then(
        setThemePreferenceState
      )
      .catch((error) =>
        console.error(
          'Failed to load theme preference:',
          error
        )
      );
  }, []);

  const setTheme = async (
    preference: ThemePreference
  ) => {
    await setThemePreference(
      preference
    );

    setThemePreferenceState(
      preference
    );
  };

  const isDark =
    themePreference === 'dark' ||
    (
      themePreference === 'system' &&
      systemColorScheme === 'dark'
    );

  const colors: ThemeColors =
    useMemo(
      () => ({
        background: isDark
          ? '#111114'
          : '#F7F7FA',

        surface: isDark
          ? '#1B1B20'
          : '#FFFFFF',

        text: isDark
          ? '#F5F5F7'
          : '#202124',

        secondary: isDark
          ? '#A1A1AA'
          : '#6B7280',

        border: isDark
          ? '#303038'
          : '#E5E7EB',

        primary: isDark
          ? '#8B83FF'
          : '#6C63FF',
      }),
      [isDark]
    );

  const value = useMemo(
    () => ({
      themePreference,
      setTheme,
      isDark,
      colors,
    }),
    [
      themePreference,
      isDark,
      colors,
    ]
  );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme must be used inside ThemeProvider'
    );
  }

  return context;
}
