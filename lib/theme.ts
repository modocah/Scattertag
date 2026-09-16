import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference =
  | 'system'
  | 'light'
  | 'dark';

const THEME_KEY =
  '@scattertag/theme';

export async function getThemePreference(): Promise<ThemePreference> {
  const saved =
    await AsyncStorage.getItem(
      THEME_KEY
    );

  if (
    saved === 'light' ||
    saved === 'dark' ||
    saved === 'system'
  ) {
    return saved;
  }

  return 'system';
}

export async function setThemePreference(
  preference: ThemePreference
) {
  await AsyncStorage.setItem(
    THEME_KEY,
    preference
  );
}
