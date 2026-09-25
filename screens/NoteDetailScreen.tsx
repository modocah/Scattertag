import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import type {
  RouteProp,
} from '@react-navigation/native';

type RootStackParamList = {
  Capture: undefined;
  Notes: undefined;
  NoteDetail: {
    noteId: number;
  };
};

type ListItem = {
  id: number;
  note_id: number;
  text: string;
  position: number;
  is_completed: number;
};

type Note = {
  id: number;
  text: string;
  created_at: string;
  updated_at: string;
  is_pinned: number;
  type: string;
};

export default function NoteDetailScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const route =
    useRoute<
      RouteProp<RootStackParamList, 'NoteDetail'>
    >();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [note, setNote] = useState<Note | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingItemId, setEditingItemId] =
    useState<number | null>(null);

  const [editingText, setEditingText] =
    useState('');

  const [newItemText, setNewItemText] =
    useState('');
  
  const addInputRef = useRef<TextInput>(null);

  const scrollViewRef =
    useRef<ScrollView>(null);

  const [isEditingNote, setIsEditingNote] =
    useState(false);

  const [editingNoteText, setEditingNoteText] =
    useState('');

  const colors = {
    background: isDark ? '#111114' : '#F7F7FA',
    surface: isDark ? '#1B1B20' : '#FFFFFF',
    text: isDark ? '#F5F5F7' : '#202124',
    secondary: isDark ? '#A1A1AA' : '#6B7280',
    border: isDark ? '#303038' : '#E5E7EB',
    primary: isDark ? '#8B83FF' : '#6C63FF',
  };

  useEffect(() => {
    const loadNote = async () => {
      try {
        const {
          getNotes,
          getListItems,
        } = await import('../database/notes');

        const savedNotes = await getNotes();

        const foundNote = savedNotes.find(
          (item) =>
            item.id === route.params.noteId
        );

        if (!foundNote) {
          navigation.goBack();
          return;
        }

        setNote(foundNote);

        if (foundNote.type === 'list') {
          const savedItems =
            await getListItems(foundNote.id);

          setItems(savedItems);
        }
      } catch (error) {
        console.error(
          'Failed to load note:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [
    navigation,
    route.params.noteId,
  ]);

  const handleToggleItem = async (
    item: ListItem
  ) => {
    try {
      const {
        toggleListItem,
      } = await import('../database/notes');

      const newCompleted =
        item.is_completed !== 1;

      await toggleListItem(
        item.id,
        newCompleted
      );

      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? {
                ...currentItem,
                is_completed:
                  newCompleted ? 1 : 0,
              }
            : currentItem
        )
      );
    } catch (error) {
      console.error(
        'Failed to toggle list item:',
        error
      );
    }
  };

  const startEditing = (
    item: ListItem
  ) => {
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const saveEditing = async () => {
    if (editingItemId === null) {
      return;
    }

    const cleanedText =
      editingText.trim();

    if (!cleanedText) {
      setEditingItemId(null);
      setEditingText('');
      return;
    }

    try {
      const {
        updateListItem,
      } = await import('../database/notes');

      await updateListItem(
        editingItemId,
        cleanedText
      );

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                text: cleanedText,
              }
            : item
        )
      );

      setEditingItemId(null);
      setEditingText('');

      Keyboard.dismiss();
    } catch (error) {
      console.error(
        'Failed to update list item:',
        error
      );
    }
  };

  const handleAddItem = async () => {
    const cleanedText =
      newItemText.trim();

    if (!cleanedText || !note) {
      return;
    }

    try {
      const {
        addListItem,
      } = await import('../database/notes');

      const position = items.length;

      const newItemId =
        await addListItem(
          note.id,
          cleanedText,
          position
        );

      setItems((currentItems) => [
        ...currentItems,
        {
          id: newItemId,
          note_id: note.id,
          text: cleanedText,
          position,
          is_completed: 0,
        },
      ]);

      setNewItemText('');

      requestAnimationFrame(() => {
        addInputRef.current?.focus();

        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({
            animated: true,
          });
        }, 50);
      });
    } catch (error) {
      console.error(
        'Failed to add list item:',
        error
      );
    }
  };
  const handleDeleteItem = async (
    itemId: number
  ) => {
    try {
      const {
        deleteListItem,
      } = await import('../database/notes');

      await deleteListItem(itemId);

      setItems((currentItems) =>
        currentItems
          .filter(
            (item) => item.id !== itemId
          )
          .map((item, index) => ({
            ...item,
            position: index,
          }))
      );
    } catch (error) {
      console.error(
        'Failed to delete list item:',
        error
      );
    }
  };

  const handleTogglePin = async () => {
    if (!note) {
      return;
    }

    try {
      const {
        updateNotePin,
      } = await import('../database/notes');

      const newPinned =
        note.is_pinned !== 1;

      await updateNotePin(
        note.id,
        newPinned
      );

      setNote({
        ...note,
        is_pinned: newPinned ? 1 : 0,
      });
    } catch (error) {
      console.error(
        'Failed to update pin:',
        error
      );
    }
  };

  const handleSaveNote = async () => {
    if (!note) {
      return;
    }

    const cleanedText =
      editingNoteText.trim();

    if (!cleanedText) {
      return;
    }

    try {
      const {
        updateNoteText,
      } = await import('../database/notes');

      await updateNoteText(
        note.id,
        cleanedText
      );

      setNote({
        ...note,
        text: cleanedText,
        updated_at:
          new Date().toISOString(),
      });

      setIsEditingNote(false);
      Keyboard.dismiss();
    } catch (error) {
      console.error(
        'Failed to update note:',
        error
      );
    }
  };

  const handleDeleteNote = () => {
    if (!note) {
      return;
    }

    Alert.alert(
      'Delete this note?',
      "This action can't be undone.",
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const {
                deleteNoteAndItems,
              } = await import(
                '../database/notes'
              );

              await deleteNoteAndItems(
                note.id
              );

              navigation.goBack();
            } catch (error) {
              console.error(
                'Failed to delete note:',
                error
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
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
        <View style={styles.center}>
          <Text
            style={{
              color: colors.secondary,
            }}
          >
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!note) {
    return null;
  }

  const isList = note.type === 'list';

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
      <View style={styles.header}>
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

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          {isList ? 'Checklist' : 'Note'}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }
        >
        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Pressable
            onPress={handleTogglePin}
            style={styles.pinButton}
          >
            <Text
              style={[
                styles.pinButtonText,
                {
                  color: colors.primary,
                },
              ]}
            >
              {note.is_pinned === 1
                ? '📌 Unpin'
                : '📌 Pin'}
            </Text>
          </Pressable>

          {!isList &&
            (isEditingNote ? (
              <View>
                <TextInput
                  value={editingNoteText}
                  onChangeText={
                    setEditingNoteText
                  }
                  autoFocus
                  multiline
                  style={[
                    styles.noteEditInput,
                    {
                      color: colors.text,
                      borderColor:
                        colors.primary,
                    },
                  ]}
                />

                <View
                  style={
                    styles.editActions
                  }
                >
                  <Pressable
                    onPress={() => {
                      setIsEditingNote(
                        false
                      );
                      Keyboard.dismiss();
                    }}
                    style={
                      styles.cancelButton
                    }
                  >
                    <Text
                      style={[
                        styles.cancelButtonText,
                        {
                          color:
                            colors.secondary,
                        },
                      ]}
                    >
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSaveNote}
                    style={[
                      styles.saveNoteButton,
                      {
                        backgroundColor:
                          colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.saveNoteButtonText
                      }
                    >
                      Save
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => {
                  setEditingNoteText(
                    note.text
                  );
                  setIsEditingNote(true);
                }}
              >
                <Text
                  style={[
                    styles.noteText,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {note.text}
                </Text>
              </Pressable>
            ))}

          {isList && (
            <View style={styles.items}>
              {items.map((item) => {
                const isEditing =
                  editingItemId === item.id;

                return (
                  <View
                    key={item.id}
                    style={styles.itemRow}
                  >
                    <Pressable
                      onPress={() =>
                        handleToggleItem(
                          item
                        )
                      }
                      style={
                        styles.checkboxButton
                      }
                    >
                      <Text
                        style={[
                          styles.checkbox,
                          {
                            color:
                              item.is_completed
                                ? colors.primary
                                : colors.secondary,
                          },
                        ]}
                      >
                        {item.is_completed
                          ? '☑'
                          : '□'}
                      </Text>
                    </Pressable>

                    {isEditing ? (
                      <TextInput
                        value={editingText}
                        onChangeText={
                          setEditingText
                        }
                        autoFocus
                        returnKeyType="done"
                        onSubmitEditing={
                          saveEditing
                        }
                        style={[
                          styles.editInput,
                          {
                            color:
                              colors.text,
                            borderColor:
                              colors.primary,
                          },
                        ]}
                      />
                    ) : (
                      <Pressable
                        onPress={() =>
                          startEditing(
                            item
                          )
                        }
                        style={
                          styles.textButton
                        }
                      >
                        <Text
                          style={[
                            styles.itemText,
                            {
                              color:
                                colors.text,
                            },
                            item.is_completed ===
                              1 &&
                              styles.completed,
                          ]}
                        >
                          {item.text}
                        </Text>
                      </Pressable>
                    )}

                    <Pressable
                      onPress={() =>
                        handleDeleteItem(
                          item.id
                        )
                      }
                      style={
                        styles.deleteButton
                      }
                    >
                      <Text
                        style={[
                          styles.deleteText,
                          {
                            color:
                              colors.secondary,
                          },
                        ]}
                      >
                        ×
                      </Text>
                    </Pressable>
                  </View>
                );
              })}

              <View style={styles.addItemRow}>
                <TextInput
                  ref={addInputRef}
                  value={newItemText}
                  onChangeText={setNewItemText}
                  placeholder="Add an item..."
                  placeholderTextColor={colors.secondary}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  onSubmitEditing={handleAddItem}
                  onKeyPress={({ nativeEvent }) => {
                    if (
                      nativeEvent.key === 'Enter' &&
                      newItemText.trim()
                    ) {
                      handleAddItem();
                    }
                  }}
                  style={[
                    styles.addInput,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                />

  <Pressable
    onPress={handleAddItem}
    style={[
      styles.addButton,
      {
        backgroundColor: colors.primary,
      },
    ]}
  >
    <Text style={styles.addButtonText}>
      +
    </Text>
  </Pressable>
              </View>
            </View>
          )}

          <Text
            style={[
              styles.date,
              {
                color: colors.secondary,
              },
            ]}
          >
            Created{' '}
            {new Date(
              note.created_at
            ).toLocaleString()}
          </Text>

          <Pressable
            onPress={handleDeleteNote}
            style={styles.deleteNoteButton}
          >
            <Text
              style={styles.deleteNoteText}
            >
              Delete Note
            </Text>
          </Pressable>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
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

  scrollContent: {
    paddingBottom: 40,
  },

  card: {
    marginHorizontal: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },

  pinButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderRadius: 8,
  },

  pinButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  noteText: {
    fontSize: 18,
    lineHeight: 27,
  },

  noteEditInput: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 17,
    lineHeight: 25,
    textAlignVertical: 'top',
  },

  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },

  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  saveNoteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  saveNoteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  items: {
    gap: 12,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkboxButton: {
    width: 32,
    alignItems: 'flex-start',
  },

  checkbox: {
    fontSize: 22,
  },

  textButton: {
    flex: 1,
  },

  itemText: {
    fontSize: 17,
    lineHeight: 25,
  },

  editInput: {
    flex: 1,
    fontSize: 17,
    lineHeight: 25,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  completed: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },

  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },

  deleteText: {
    fontSize: 24,
    fontWeight: '300',
  },

  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  addInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '400',
    marginTop: -2,
  },

  date: {
    marginTop: 20,
    fontSize: 12,
  },

  deleteNoteButton: {
    alignSelf: 'flex-start',
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },

  deleteNoteText: {
    color: '#D64545',
    fontSize: 15,
    fontWeight: '600',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});