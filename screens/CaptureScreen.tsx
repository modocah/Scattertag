import React, {
  useEffect,
  useState,
} from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  useNavigation,
} from '@react-navigation/native';

import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useTheme,
} from '../context/ThemeContext';

import {
  createNote,
  createList,
  addHashtagsToNote,
  getHashtags,
} from '../database/notes';

import {
  Ionicons,
} from '@expo/vector-icons';

type RootStackParamList = {
  Capture: undefined;
  Notes: undefined;
  NoteDetail: {
    noteId: number;
  };
  Tags: undefined;
  TagNotes: {
    hashtag: string;
  };
  Settings: undefined;
};

type ListItem = {
  id: number;
  text: string;
  completed: boolean;
};

export default function CaptureScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const [text, setText] = useState('');
  const [listMode, setListMode] = useState(false);
  const [listItems, setListItems] =
    useState<ListItem[]>([]);

  const [existingTags, setExistingTags] =
    useState<string[]>([]);

  const {
    isDark,
    colors,
  } = useTheme();

  useEffect(() => {
    getHashtags()
      .then((tags) => {
        setExistingTags(
          tags.map((tag) => tag.name)
        );
      })
      .catch((error) => {
        console.error(
          'Failed to load hashtags:',
          error
        );
      });
  }, []);

  const refreshTags = async () => {
    try {
      const tags = await getHashtags();

      setExistingTags(
        tags.map((tag) => tag.name)
      );
    } catch (error) {
      console.error(
        'Failed to refresh hashtags:',
        error
      );
    }
  };

  const hashtagMatch =
    text.match(/(?:^|\s)#([A-Za-z0-9_]*)$/);

  const hashtagQuery =
    hashtagMatch?.[1]?.toLowerCase() ?? '';

  const hashtagSuggestions =
    hashtagMatch
      ? existingTags
          .filter((tag) =>
            tag.startsWith(hashtagQuery)
          )
          .slice(0, 5)
      : []; 
    
  const pinMatch =
    text.match(/(?:^|\s)\/(p(?:i(?:n)?)?)$/i);

  const showPinSuggestion =
    !!pinMatch;
  
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
        const noteId = await createList(
          finalItems.map((item) => ({
            text: item.text,
            completed: item.completed,
          }))
        );

        const hashtags = finalItems.flatMap(
          (item) =>
            item.text.match(
              /#[A-Za-z0-9_]+/g
            ) ?? []
        );

        await addHashtagsToNote(
          noteId,
          hashtags
        );

        setText('');
        setListItems([]);
        setListMode(false);

        await refreshTags();
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
     * /pin shortcut.
     */
    const pinCommand = /\/pin\b/i;
    const isPinned =
      pinCommand.test(noteText);

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
       * Extract hashtags.
       */
      const hashtags =
        cleanedText.match(
          /#[A-Za-z0-9_]+/g
        ) ?? [];

            await addHashtagsToNote(
              noteId,
              hashtags
            );

            setText('');

            await refreshTags();
    } catch (error) {
      console.error(
        'Failed to save note:',
        error
      );
    }
  };

  const toggleListMode = () => {
    if (listMode) {
      setListMode(false);
      setListItems([]);
      return;
    }

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
    if (!listMode) {
      finishNote();
      return;
    }

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

  const toggleListItem = (
    id: number
  ) => {
    setListItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              completed:
                !item.completed,
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
          <View style={styles.headerTop}>
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

            <Pressable
              onPress={() =>
                navigation.navigate('Settings')
              }
              style={styles.settingsButton}
              accessibilityRole="button"
              accessibilityLabel="Settings"
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={colors.primary}
              />
            </Pressable>
          </View>

          <View style={styles.tabBar}>
            <Pressable
              onPress={() =>
                navigation.navigate('Capture')
              }
              style={[
                styles.tab,
                styles.activeTab,
                {
                  borderBottomColor: colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                Capture
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                navigation.navigate('Notes')
              }
              style={styles.tab}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: colors.secondary,
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
              style={styles.tab}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: colors.secondary,
                  },
                ]}
              >
                Tags
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Main content */}
        <View
          style={styles.emptyState}
        >
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
                color:
                  colors.secondary,
              },
            ]}
          >
            {listMode
              ? 'Press Enter to add the next item.'
              : 'Just type it. Organize it later.'}
          </Text>

          {!listMode && (
            <View
              style={styles.tips}
            >
              <Text
                style={[
                  styles.tip,
                  {
                    color:
                      colors.secondary,
                  },
                ]}
              >
                □ Tap the checkbox to start a list
              </Text>

              <Text
                style={[
                  styles.tip,
                  {
                    color:
                      colors.secondary,
                  },
                ]}
              >
                # Add tags to find notes later
              </Text>

              <Text
                style={[
                  styles.tip,
                  {
                    color:
                      colors.secondary,
                  },
                ]}
              >
                /pin Keep something important at the top
              </Text>
            </View>
          )}

          {listMode &&
            listItems.length > 0 && (
              <View
                style={styles.listPreview}
              >
                {listItems.map(
                  (item) => (
                    <Pressable
                      key={item.id}
                      onPress={() =>
                        toggleListItem(
                          item.id
                        )
                      }
                      style={
                        styles.previewRow
                      }
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
                            color:
                              colors.text,
                          },
                          item.completed &&
                            styles.completedText,
                        ]}
                      >
                        {item.text}
                      </Text>
                    </Pressable>
                  )
                )}
              </View>
            )}
        </View>

        {/* Composer */}
        <View>
          {showPinSuggestion && (
            <View
              style={[
                styles.tagSuggestions,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Pressable
                onPress={() => {
                  if (!pinMatch) {
                    return;
                  }

                  const matchIndex =
                    pinMatch.index ?? 0;

                  const prefix =
                    text.slice(0, matchIndex);

                  const separator =
                    prefix && !/\s$/.test(prefix)
                      ? ' '
                      : '';

                  setText(
                    `${prefix}${separator}/pin `
                  );
                }}
                style={styles.tagSuggestion}
              >
                <Text
                  style={[
                    styles.tagSuggestionText,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  📌 Pin note
                </Text>
              </Pressable>
            </View>
          )}
          {hashtagSuggestions.length > 0 && (
            <View
              style={[
                styles.tagSuggestions,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              {hashtagSuggestions.map(
                (tag) => (
                  <Pressable
                    key={tag}
                    onPress={() => {
                      if (!hashtagMatch) {
                        return;
                      }

                      const matchIndex =
                        hashtagMatch.index ?? 0;

                      const prefix =
                        text.slice(
                          0,
                          matchIndex
                        );

                      const separator =
                        prefix && !/\s$/.test(prefix)
                          ? ' '
                          : '';

                      const completedText =
                        `${prefix}${separator}#${tag} `;

                      setText(
                        completedText
                      );
                    }}
                    style={
                      styles.tagSuggestion
                    }
                  >
                    <Text
                      style={[
                        styles.tagSuggestionText,
                        {
                          color:
                            colors.primary,
                        },
                      ]}
                    >
                      #{tag}
                    </Text>
                  </Pressable>
                )
              )}
            </View>
          )}

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
            <Pressable
              onPress={
                toggleListMode
              }
              accessibilityRole="button"
              accessibilityLabel={
                listMode
                  ? 'Turn off list mode'
                  : 'Turn on list mode'
              }
              style={
                styles.listButton
              }
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
                {listMode
                  ? '☑'
                  : '□'}
              </Text>
            </Pressable>

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
                listMode
                  ? 'next'
                  : 'send'
              }
              submitBehavior={
                listMode
                  ? 'submit'
                  : 'blurAndSubmit'
              }
              onSubmitEditing={
                handleSubmit
              }
              style={[
                styles.input,
                {
                  color: colors.text,
                },
              ]}
            />

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
              <Text
                style={styles.sendArrow}
              >
                ➤
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingBottom: 0,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
  },

  settingsButton: {
    padding: 4,
  },

  settingsIcon: {
    fontSize: 20,
  },

  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
    gap: 28,
  },

  tab: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },

  activeTab: {
    borderBottomWidth: 2,
  },

  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 18,
    textAlign: 'center',
  },

  tips: {
    marginTop: 28,
    gap: 10,
    alignItems: 'center',
  },

  tip: {
    fontSize: 14,
    textAlign: 'center',
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

  tagSuggestions: {
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 6,
    overflow: 'hidden',
  },

  tagSuggestion: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  tagSuggestionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});