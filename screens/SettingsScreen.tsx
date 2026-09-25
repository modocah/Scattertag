import React, {
  useState,
} from 'react';

import {
  Ionicons,
} from '@expo/vector-icons';

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

import {
  exportNotes,
  importNotes,
} from '../database/notes';

import * as DocumentPicker from 'expo-document-picker';

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function SettingsScreen() {
  const {
    colors,
    themePreference,
    setTheme,
  } = useTheme();

  const styles = createStyles(colors);

  const navigation =
    useNavigation();

  const [exporting, setExporting] =
    useState(false);

  const options: {
    value: ThemePreference;
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      value: 'system',
      label: 'System',
      description:
        'Follow your device appearance setting',
      icon: 'phone-portrait-outline',
    },
    {
      value: 'light',
      label: 'Light',
      description:
        'Always use the light theme',
      icon: 'sunny-outline',
    },
    {
      value: 'dark',
      label: 'Dark',
      description:
        'Always use the dark theme',
      icon: 'moon-outline',
    },
  ];

  const handleExport = async () => {
    if (exporting) {
      return;
    }

    try {
      setExporting(true);

      const data =
        await exportNotes();

      const json =
        JSON.stringify(
          data,
          null,
          2
        );

      const file =
        new FileSystem.File(
          FileSystem.Paths.cache,
          `scattertag-export-${Date.now()}.json`
        );

        file.create({
        overwrite: true,
        });

        file.write(json);

        const fileUri = file.uri;

      const canShare =
        await Sharing.isAvailableAsync();

      if (!canShare) {
        console.error(
          'Sharing is not available on this device.'
        );
        return;
      }

      await Sharing.shareAsync(
        fileUri,
        {
          mimeType:
            'application/json',
          dialogTitle:
            'Export ScatterTag data',
        }
      );
    } catch (error) {
      console.error(
        'Failed to export data:',
        error
      );
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      const result =
        await DocumentPicker.getDocumentAsync({
          type: 'application/json',
          copyToCacheDirectory: true,
        });

      if (result.canceled) {
        return;
      }

      const fileUri =
        result.assets[0].uri;

      const response =
        await fetch(fileUri);

      const json =
        await response.json();

      if (
        json?.app !== 'ScatterTag' ||
        json?.version !== 1 ||
        !Array.isArray(json?.notes)
      ) {
        throw new Error(
          'Invalid ScatterTag export file.'
        );
      }

      const importedCount =
        await importNotes(json);

      alert(
        importedCount === 0
          ? 'No new notes were imported.'
          : `Imported ${importedCount} ${
              importedCount === 1
                ? 'note'
                : 'notes'
            } successfully.`
      );
    } catch (error) {
      console.error(
        'Failed to import data:',
        error
      );

      alert(
        'Unable to import this file. Please make sure it is a valid ScatterTag JSON export.'
      );
    }
  };



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
                color:
                  colors.primary,
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
                  <Ionicons
                    name={option.icon}
                    size={22}
                    color={
                      selected
                        ? colors.primary
                        : colors.secondary
                    }
                  />

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

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            Data
          </Text>

          <View style={styles.card}>
            <Pressable
              onPress={handleExport}
              disabled={exporting}
              style={styles.dataOption}
            >
              <Ionicons
                name="download-outline"
                size={22}
                color={colors.secondary}
              />

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
                  {exporting
                    ? 'Exporting...'
                    : 'Export Data'}
                </Text>

                <Text
                  style={
                    styles.description
                  }
                >
                  Save your notes and checklists as a JSON file
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleImport}
              style={styles.dataOption}
            >
              <Ionicons
                name="folder-open-outline"
                size={22}
                color={colors.secondary}
              />

              <View
                style={styles.optionText}
              >
                <Text
                  style={styles.optionLabel}
                >
                  Import Data
                </Text>

                <Text
                  style={styles.description}
                >
                  Restore notes and checklists from a JSON file
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
          >
            About ScatterTag
          </Text>

          <View style={styles.card}>
            <View
              style={styles.aboutContent}
            >
              <Text
                style={styles.aboutName}
              >
                ScatterTag
              </Text>

              <Text
                style={styles.aboutVersion}
              >
                Version 1.0.0
              </Text>

              <Text
                style={styles.aboutDeveloper}
              >
                Developed by DeDoom Studio
              </Text>

              <Text
                style={styles.aboutDescription}
              >
                Your notes stay on your device.
              </Text>
            </View>
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
      backgroundColor:
        colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        colors.border,
      overflow: 'hidden',
    },

    option: {
      minHeight: 76,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
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
      borderColor:
        colors.border,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    radioSelected: {
      borderWidth: 2,
    },

    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },

    dataOption: {
      minHeight: 76,
      paddingHorizontal: 16,
      paddingVertical: 14,
      justifyContent:
        'center',
    },

    backButton: {
      alignSelf:
        'flex-start',
      marginBottom: 16,
    },

    backText: {
      fontSize: 15,
      fontWeight: '600',
    },

        aboutContent: {
      padding: 16,
    },

    aboutName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },

    aboutVersion: {
      fontSize: 13,
      color: colors.secondary,
      marginBottom: 12,
    },

    aboutDeveloper: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 6,
    },

    aboutDescription: {
      fontSize: 14,
      color: colors.secondary,
    },
  });
}