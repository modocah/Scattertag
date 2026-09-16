import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import NotesScreen from './screens/NotesScreen';
import NoteDetailScreen from './screens/NoteDetailScreen';
import TagsScreen from './screens/TagsScreen';
import TagNotesScreen from './screens/TagNotesScreen';

import { getDatabase } from './database/database';
import {
  createNote,
  createList,
  addHashtagsToNote,
  resetDevelopmentDatabase,
} from './database/notes';

type ListItem = {
  id: number;
  text: string;
  completed: boolean;
};

type RootStackParamList = {
  Capture: undefined;
  Notes: undefined;
  Tags: undefined;
  TagNotes: {
    hashtag: string;
  };
  NoteDetail: {
    noteId: number;
  };
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

function CaptureScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const [text, setText] = useState('');
  const [listMode, setListMode] = useState(false);
  const [listItems, setListItems] =
    useState<ListItem[]>([]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#111114' : '#F7F7FA',
    surface: isDark ? '#1B1B20' : '#FFFFFF',
    text: isDark ? '#F5F5F7' : '#202124',
    secondary: isDark ? '#A1A1AA' : '#6B7280',
    border: isDark ? '#303038' : '#E5E7EB',
    primary: isDark ? '#8B83FF' : '#6C63FF',
  };

  const finishNote = async () => {
    /*
     * Finish a list.
     */
    if (listMode) {
      const finalItem = text.trim();

      const finalItems = finalItem
        ? [
            ...listItems,
            {
              id: Date.now(),
              text: finalItem,
              completed: false,
            },
          ]
        : listItems;

      if (finalItems.length === 0) {
        return;
      }

      try {
        await createList(
          finalItems.map((item) => ({
            text: item.text,
            completed: item.completed,
          }))
        );

        setText('');
        setListItems([]);
        setListMode(false);
      } catch (error) {
        console.error(
          'Failed to save list:',
          error
        );
      }

      return;
    }

    /*
     * Normal note.
     */
    const noteText = text.trim();

    if (!noteText) {
      return;
    }

    /*
     * /pin shortcut
     *
     * Works anywhere in the note.
     * Example:
     * Call dentist tomorrow /pin
     * /pin Call dentist tomorrow
     * Call /pin dentist tomorrow
     */
    const pinCommand = /\/pin\b/i;
    const isPinned = pinCommand.test(noteText);

    const cleanedText = noteText
      .replace(pinCommand, '')
      .trim();

    if (!cleanedText) {
      return;
    }

    try {
      const noteId = await createNote(
        cleanedText,
        isPinned
      );

      /*
       * Extract hashtags from the cleaned note.
       */
      const hashtags =
        cleanedText.match(
          /#[A-Za-z0-9_]+/g
        ) ?? [];

      /*
       * Save hashtag relationships.
       */
      await addHashtagsToNote(
        noteId,
        hashtags
      );

      /*
       * TEMPORARY DIAGNOSTIC
       *
       * This lets us see exactly what is happening
       * with the hashtag tables after saving.
       */

      setText('');
    } catch (error) {
      console.error(
        'Failed to save note:',
        error
      );
    }
  };

  const toggleListMode = () => {
    /*
     * Turn list mode off.
     */
    if (listMode) {
      setListMode(false);
      setListItems([]);
      return;
    }

    /*
     * If the user already typed something,
     * preserve it as the first list item.
     */
    const currentText = text.trim();

    if (currentText) {
      setListItems([
        {
          id: Date.now(),
          text: currentText,
          completed: false,
        },
      ]);

      setText('');
    }

    setListMode(true);
  };

  const handleSubmit = () => {
    /*
     * Normal mode:
     * Enter saves the note.
     */
    if (!listMode) {
      finishNote();
      return;
    }

    /*
     * List mode:
     * Enter creates the next list item.
     */
    const item = text.trim();

    if (!item) {
      return;
    }

    setListItems((current) => [
      ...current,
      {
        id: Date.now(),
        text: item,
        completed: false,
      },
    ]);

    setText('');
  };

  const toggleListItem = (id: number) => {
    setListItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
            }
          : item
      )
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            ScatterTag
          </Text>

          <View style={styles.headerButtons}>
            <Pressable
              onPress={() =>
                navigation.navigate('Notes')
              }
              style={styles.headerButton}
            >
              <Text
                style={[
                  styles.headerButtonText,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                Notes
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                navigation.navigate('Tags')
              }
              style={styles.headerButton}
            >
              <Text
                style={[
                  styles.headerButtonText,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                Tags
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Main content */}
        <View style={styles.emptyState}>
          <Text
            style={[
              styles.emptyTitle,
              {
                color: colors.text,
              },
            ]}
          >
            {listMode
              ? 'Make a list'
              : 'Have a thought?'}
          </Text>

          <Text
            style={[
              styles.emptyText,
              {
                color: colors.secondary,
              },
            ]}
          >
            {listMode
              ? 'Press Enter to add the next item.'
              : 'Just type it. Organize it later.'}
          </Text>

          {/* Normal-mode tips */}
          {!listMode && (
            <View style={styles.tips}>
              <Text
                style={[
                  styles.tip,
                  {
                    color: colors.secondary,
                  },
                ]}
              >
                □ Tap the checkbox to start a list
              </Text>

              <Text
                style={[
                  styles.tip,
                  {
                    color: colors.secondary,
                  },
                ]}
              >
                # Add tags to find notes later
              </Text>

              <Text
                style={[
                  styles.tip,
                  {
                    color: colors.secondary,
                  },
                ]}
              >
                /pin Keep something important at the top
              </Text>
            </View>
          )}

          {/* Temporary list preview */}
          {listMode &&
            listItems.length > 0 && (
              <View style={styles.listPreview}>
                {listItems.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      toggleListItem(item.id)
                    }
                    style={styles.previewRow}
                  >
                    <Text
                      style={[
                        styles.previewCheckbox,
                        {
                          color:
                            item.completed
                              ? colors.primary
                              : colors.secondary,
                        },
                      ]}
                    >
                      {item.completed
                        ? '☑'
                        : '□'}
                    </Text>

                    <Text
                      style={[
                        styles.previewText,
                        {
                          color: colors.text,
                        },
                        item.completed &&
                          styles.completedText,
                      ]}
                    >
                      {item.text}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
        </View>

        {/* Composer */}
        <View
          style={[
            styles.composer,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          {/* List toggle */}
          <Pressable
            onPress={toggleListMode}
            accessibilityRole="button"
            accessibilityLabel={
              listMode
                ? 'Turn off list mode'
                : 'Turn on list mode'
            }
            style={styles.listButton}
          >
            <Text
              style={[
                styles.checkbox,
                {
                  color: listMode
                    ? colors.primary
                    : colors.secondary,
                },
              ]}
            >
              {listMode ? '☑' : '□'}
            </Text>
          </Pressable>

          {/* Text input */}
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={
              listMode
                ? 'Add a list item...'
                : "What's on your mind?"
            }
            placeholderTextColor={
              colors.secondary
            }
            multiline
            textAlignVertical="top"
            returnKeyType={
              listMode ? 'next' : 'send'
            }
            submitBehavior={
              listMode
                ? 'submit'
                : 'blurAndSubmit'
            }
            onSubmitEditing={handleSubmit}
            style={[
              styles.input,
              {
                color: colors.text,
              },
            ]}
          />

          {/* Send button */}
          <Pressable
            onPress={finishNote}
            accessibilityRole="button"
            accessibilityLabel={
              listMode
                ? 'Finish list'
                : 'Save note'
            }
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  text.trim() ||
                  listItems.length > 0
                    ? colors.primary
                    : colors.border,
              },
            ]}
          >
            <Text style={styles.sendArrow}>
              ➤
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function App() {
  /*
   * Initialize the local SQLite database
   * when the app starts.
   */
  React.useEffect(() => {
    getDatabase()
      .then(() =>
        console.log(
          'ScatterTag database initialized'
        )
      )
      .catch((error) =>
        console.error(
          'Database initialization failed:',
          error
        )
      );
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Capture"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Capture"
          component={CaptureScreen}
        />

        <Stack.Screen
          name="Notes"
          component={NotesScreen}
        />

        <Stack.Screen
          name="NoteDetail"
          component={NoteDetailScreen}
        />

        <Stack.Screen
          name="Tags"
          component={TagsScreen}
        />

        <Stack.Screen
          name="TagNotes"
          component={TagNotesScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
  },

  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginLeft: 4,
  },

  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 17,
  },

  tips: {
    marginTop: 32,
    gap: 10,
  },

  tip: {
    fontSize: 14,
  },

  listPreview: {
    marginTop: 28,
    alignSelf: 'stretch',
    maxWidth: 320,
    gap: 10,
  },

  previewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  previewCheckbox: {
    fontSize: 20,
    marginRight: 8,
  },

  previewText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },

  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 7,
    minHeight: 56,
  },

  listButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkbox: {
    fontSize: 27,
  },

  input: {
    flex: 1,
    fontSize: 17,
    lineHeight: 23,
    maxHeight: 150,
    paddingHorizontal: 8,
    paddingTop: 9,
    paddingBottom: 8,
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 2,
  },
});