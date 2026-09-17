import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useNavigation,
} from '@react-navigation/native';

import {
  useTheme,
} from '../context/ThemeContext';

import type {
  ThemePreference,
} from '../lib/theme';

export default function SettingsScreen() {
  const {
    colors,
    themePreference,
    setTheme,
  } = useTheme();

  const styles = createStyles(colors);
  const navigation =
  useNavigation();

  const options: {
    value: ThemePreference;
    label: string;
    description: string;
  }[] = [
    {
      value: 'system',
      label: 'System',
      description:
        'Follow your device appearance setting',
    },
    {
      value: 'light',
      label: 'Light',
      description:
        'Always use the light theme',
    },
    {
      value: 'dark',
      label: 'Dark',
      description:
        'Always use the dark theme',
    },
  ];

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={
          styles.container
        }
      >
        <Pressable
          onPress={() =>
            navigation.goBack()
          }
          style={styles.backButton}
        >
          <Text
            style={[
              styles.backText,
              {
                color: colors.primary,
              },
            ]}
          >
            ← Back
          </Text>
        </Pressable>

        <Text style={styles.title}>
          Settings
        </Text>

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Appearance
          </Text>

          <View style={styles.card}>
            {options.map((option) => {
              const selected =
                themePreference ===
                option.value;

              return (
                <Pressable
                  key={option.value}
                  style={[
                    styles.option,
                    selected &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    setTheme(
                      option.value
                    )
                  }
                >
                  <View
                    style={
                      styles.optionText
                    }
                  >
                    <Text
                      style={
                        styles.optionLabel
                      }
                    >
                      {option.label}
                    </Text>

                    <Text
                      style={
                        styles.description
                      }
                    >
                      {option.description}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.radio,
                      selected &&
                        styles.radioSelected,
                      selected && {
                        borderColor:
                          colors.primary,
                      },
                    ]}
                  >
                    {selected && (
                      <View
                        style={[
                          styles.radioDot,
                          {
                            backgroundColor:
                              colors.primary,
                          },
                        ]}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(
  colors: ReturnType<
    typeof useTheme
  >['colors']
) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    container: {
      padding: 20,
    },

    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 28,
    },

    section: {
      marginBottom: 24,
    },

    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 10,
    },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },

    option: {
      minHeight: 76,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    selectedOption: {
      backgroundColor:
        colors.background,
    },

    optionText: {
      flex: 1,
      paddingRight: 16,
    },

    optionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 3,
    },

    description: {
      fontSize: 13,
      color: colors.secondary,
    },

    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    radioSelected: {
      borderWidth: 2,
    },

    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },

    backButton: {
      alignSelf: 'flex-start',
      marginBottom: 16,
    },

    backText: {
      fontSize: 15,
      fontWeight: '600',
},
  });
}

