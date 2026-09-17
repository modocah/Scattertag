import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';

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

type Note = {
  id: number;
  text: string;
  created_at: string;
  updated_at: string;
  is_pinned: number;
  type: string;
};

type ListItem = {
  id: number;
  note_id: number;
  text: string;
  position: number;
  is_completed: number;
};

export default function NotesScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const [notes, setNotes] = useState<Note[]>([]);
  const [listItems, setListItems] = useState<
    Record<number, ListItem[]>
  >({});
  const [searchText, setSearchText] = useState('');

    const {
    colors,
  } = useTheme();

  const loadNotes = useCallback(async () => {
    try {
      const {
        getNotes,
        getListItems,
      } = await import('../database/notes');

      const savedNotes = await getNotes();

      setNotes(savedNotes);

      const itemsByNote: Record<
        number,
        ListItem[]
      > = {};

      for (const note of savedNotes) {
        if (note.type === 'list') {
          const items =
            await getListItems(note.id);

          itemsByNote[note.id] = items;
        }
      }

      setListItems(itemsByNote);
    } catch (error) {
      console.error(
        'Failed to load notes:',
        error
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  )

  const toggleListItem = async (
    itemId: number,
    completed: boolean
  ) => {
    try {
      const {
        toggleListItem: saveToggle,
      } = await import('../database/notes');

      await saveToggle(
        itemId,
        completed
      );

      setListItems((current) => {
        const updated = {
          ...current,
        };

        for (const noteId of Object.keys(
          updated
        )) {
          updated[Number(noteId)] =
            updated[Number(noteId)].map(
              (item) =>
                item.id === itemId
                  ? {
                      ...item,
                      is_completed:
                        completed ? 1 : 0,
                    }
                  : item
            );
        }

        return updated;
      });
    } catch (error) {
      console.error(
        'Failed to update list item:',
        error
      );
    }
  };

  /*
   * Render normal note text with tappable hashtags.
   */
  const renderNoteText = (
    note: Note
  ) => {
    const parts =
      note.text.split(
        /(#[A-Za-z0-9_]+)/
      );

    return (
      <Text
        style={[
          styles.noteText,
          {
            color: colors.text,
          },
        ]}
      >
        {parts.map(
          (part, index) => {
            if (
              /^#[A-Za-z0-9_]+$/.test(
                part
              )
            ) {
              const hashtag =
                part
                  .replace(/^#/, '')
                  .toLowerCase();

              return (
                <Text
                  key={`${part}-${index}`}
                  onPress={() =>
                    navigation.navigate(
                      'TagNotes',
                      {
                        hashtag,
                      }
                    )
                  }
                  style={[
                    styles.hashtag,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  {part}
                </Text>
              );
            }

            return (
              <Text
                key={`${part}-${index}`}
              >
                {part}
              </Text>
            );
          }
        )}
      </Text>
    );
  };

    /*
   * Render checklist item text with tappable hashtags.
   */
  const renderChecklistItemText = (
    listItem: ListItem
  ) => {
    const parts =
      listItem.text.split(
        /(#[A-Za-z0-9_]+)/
      );

    return (
      <Text
        style={[
          styles.itemText,
          {
            color: colors.text,
          },
          listItem.is_completed === 1 &&
            styles.completedText,
        ]}
      >
        {parts.map(
          (part, index) => {
            if (
              /^#[A-Za-z0-9_]+$/.test(
                part
              )
            ) {
              const hashtag =
                part
                  .replace(/^#/, '')
                  .toLowerCase();

              return (
                <Text
                  key={`${part}-${index}`}
                  onPress={() =>
                    navigation.navigate(
                      'TagNotes',
                      {
                        hashtag,
                      }
                    )
                  }
                  style={[
                    styles.hashtag,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  {part}
                </Text>
              );
            }

            return (
              <Text
                key={`${part}-${index}`}
              >
                {part}
              </Text>
            );
          }
        )}
      </Text>
    );
  };

  const filteredNotes =
    notes.filter((note) => {
      const query =
        searchText
          .trim()
          .toLowerCase();

      if (!query) {
        return true;
      }

      return note.text
        .toLowerCase()
        .includes(query);
    });

  const renderNote = ({
    item,
  }: {
    item: Note;
  }) => {
    const items =
      listItems[item.id] ?? [];

    return (
      <View
        style={[
          styles.noteCard,
          {
            backgroundColor:
              colors.surface,
            borderColor:
              colors.border,
          },
        ]}
      >
        {/* Card header */}
        <View style={styles.noteHeader}>
          <View
            style={styles.noteHeaderLeft}
          >
            {item.is_pinned === 1 && (
              <Text
                style={[
                  styles.pin,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                📌
              </Text>
            )}

            <Text
              style={[
                styles.date,
                {
                  color:
                    colors.secondary,
                },
              ]}
            >
              {new Date(
                item.created_at
              ).toLocaleString()}
            </Text>
          </View>

          <View
            style={styles.headerRight}
          >
            {item.type === 'list' && (
              <Text
                style={[
                  styles.listLabel,
                  {
                    color:
                      colors.secondary,
                  },
                ]}
              >
                Checklist
              </Text>
            )}

            {/* Edit button */}
            <Pressable
              onPress={() =>
                navigation.navigate(
                  'NoteDetail',
                  {
                    noteId: item.id,
                  }
                )
              }
              style={[
                styles.editButton,
                {
                  borderColor:
                    colors.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Edit note"
            >
              <Text
                style={[
                  styles.editIcon,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                ✎
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Note content */}
        {item.type === 'list' ? (
          <View
            style={styles.listContainer}
          >
            <Text
              style={[
                styles.listTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {item.text}
            </Text>

            {items.map(
              (listItem) => (
                <View
                  key={listItem.id}
                  style={
                    styles.listItemRow
                  }
                >
                  <Pressable
                    onPress={() =>
                      toggleListItem(
                        listItem.id,
                        listItem.is_completed ===
                          0
                      )
                    }
                    accessibilityRole="checkbox"
                    accessibilityState={{
                      checked:
                        listItem.is_completed === 1,
                    }}
                  >
                    <Text
                      style={[
                        styles.itemCheckbox,
                        {
                          color:
                            listItem.is_completed
                              ? colors.primary
                              : colors.secondary,
                        },
                      ]}
                    >
                      {listItem.is_completed
                        ? '☑'
                        : '□'}
                    </Text>
                  </Pressable>

                  {renderChecklistItemText(
                    listItem
                  )}
                </View>
              )
            )}
          </View>
        ) : (
          renderNoteText(item)
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            justifyContent: 'space-between',
          },
        ]}
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

      
      </View>

      {/* Search */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor:
              colors.surface,
            borderColor:
              colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.searchIcon,
            {
              color:
                colors.secondary,
            },
          ]}
        >
          🔍
        </Text>

        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search notes..."
          placeholderTextColor={
            colors.secondary
          }
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            styles.searchInput,
            {
              color: colors.text,
            },
          ]}
        />

        {searchText.length > 0 && (
          <Pressable
            onPress={() =>
              setSearchText('')
            }
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Text
              style={[
                styles.clearText,
                {
                  color:
                    colors.secondary,
                },
              ]}
            >
              ×
            </Text>
          </Pressable>
        )}
      </View>

      {/* Notes */}
      {filteredNotes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text
            style={[
              styles.emptyTitle,
              {
                color: colors.text,
              },
            ]}
          >
            {searchText.trim()
              ? 'No matching notes'
              : 'No notes yet'}
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
            {searchText.trim()
              ? 'Try a different search.'
              : 'Your saved thoughts will appear here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderNote}
          contentContainerStyle={
            styles.list
          }
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },

  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 16,
    marginBottom: 4,
  },

  backText: {
    fontSize: 16,
    fontWeight: '600',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 50,
    paddingHorizontal: 12,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },

  clearButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  clearText: {
    fontSize: 26,
    lineHeight: 28,
  },

  list: {
    padding: 12,
    gap: 10,
  },

  noteCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },

  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  noteHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  pin: {
    marginRight: 6,
    fontSize: 14,
  },

  date: {
    fontSize: 12,
  },

  listLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  editButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  editIcon: {
    fontSize: 19,
    fontWeight: '600',
  },

  noteText: {
    fontSize: 17,
    lineHeight: 24,
  },

  hashtag: {
    fontWeight: '600',
  },

  listContainer: {
    gap: 8,
  },

  listTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },

  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  itemCheckbox: {
    fontSize: 20,
    marginRight: 8,
  },

  itemText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },

  completedText: {
    textDecorationLine:
      'line-through',
    opacity: 0.6,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },


});