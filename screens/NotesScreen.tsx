import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Capture: undefined;
  Notes: undefined;
  NoteDetail: {
    noteId: number;
  };
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

type NoteWithItems = Note & {
  items?: ListItem[];
};

export default function NotesScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [notes, setNotes] = useState<NoteWithItems[]>([]);
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

  const loadNotes = useCallback(async () => {
    try {
      const {
        getNotes,
        getListItems,
      } = await import('../database/notes');

      const savedNotes = await getNotes();

      const notesWithItems = await Promise.all(
        savedNotes.map(async (note) => {
          if (note.type === 'list') {
            const items = await getListItems(note.id);

            return {
              ...note,
              items,
            };
          }

          return note;
        })
      );

      setNotes(notesWithItems);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  const handleToggleListItem = async (
    noteId: number,
    listItem: ListItem
  ) => {
    try {
      const { toggleListItem } = await import('../database/notes');

      const newCompleted = listItem.is_completed !== 1;

      await toggleListItem(
        listItem.id,
        newCompleted
      );

      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === noteId
            ? {
                ...note,
                items: note.items?.map((currentItem) =>
                  currentItem.id === listItem.id
                    ? {
                        ...currentItem,
                        is_completed: newCompleted ? 1 : 0,
                      }
                    : currentItem
                ),
              }
            : note
        )
      );
    } catch (error) {
      console.error(
        'Failed to toggle list item:',
        error
      );
    }
  };

  const renderNote = ({
    item,
  }: {
    item: NoteWithItems;
  }) => {
    const isList = item.type === 'list';

    return (
      <Pressable
        onPress={() =>
          navigation.navigate('NoteDetail', {
            noteId: item.id,
          })
        }
        style={[
          styles.noteCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.noteHeader}>
          {item.is_pinned === 1 && (
            <Text
              style={[
                styles.pin,
                {
                  color: colors.primary,
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
                color: colors.secondary,
              },
            ]}
          >
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>

        {isList ? (
          <View>
            <Text
              style={[
                styles.listTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Checklist
            </Text>

            <View style={styles.items}>
              {item.items?.map((listItem) => (
                <Pressable
                  key={listItem.id}
                  onPress={(event) => {
                    event.stopPropagation();
                    handleToggleListItem(
                      item.id,
                      listItem
                    );
                  }}
                  style={styles.listRow}
                >
                  <Text
                    style={[
                      styles.listCheckbox,
                      {
                        color: listItem.is_completed
                          ? colors.primary
                          : colors.secondary,
                      },
                    ]}
                  >
                    {listItem.is_completed
                      ? '☑'
                      : '□'}
                  </Text>

                  <Text
                    style={[
                      styles.listItemText,
                      {
                        color: colors.text,
                      },
                      listItem.is_completed === 1 &&
                        styles.completedText,
                    ]}
                  >
                    {listItem.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <Text
            style={[
              styles.noteText,
              {
                color: colors.text,
              },
            ]}
          >
            {item.text}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() =>
            navigation.navigate('Capture')
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

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Notes
        </Text>
      </View>

      {notes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text
            style={[
              styles.emptyTitle,
              {
                color: colors.text,
              },
            ]}
          >
            No notes yet
          </Text>

          <Text
            style={[
              styles.emptyText,
              {
                color: colors.secondary,
              },
            ]}
          >
            Capture a thought and it will show up here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderNote}
          contentContainerStyle={styles.list}
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
    paddingBottom: 12,
  },

  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 16,
    marginBottom: 8,
  },

  backText: {
    fontSize: 16,
    fontWeight: '600',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
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
    marginBottom: 8,
  },

  pin: {
    marginRight: 6,
    fontSize: 14,
  },

  date: {
    fontSize: 12,
  },

  noteText: {
    fontSize: 17,
    lineHeight: 24,
  },

  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },

  items: {
    gap: 8,
  },

  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 3,
  },

  listCheckbox: {
    fontSize: 20,
    width: 28,
  },

  listItemText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
  },

  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});