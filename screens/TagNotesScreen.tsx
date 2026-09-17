import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

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

type Note = {
  id: number;
  text: string;
  created_at: string;
  updated_at: string;
  is_pinned: number;
  type: string;
};

export default function TagNotesScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const route =
    useRoute<
      RouteProp<RootStackParamList, 'TagNotes'>
    >();

  const [notes, setNotes] = useState<Note[]>([]);

  const {
    colors,
  } = useTheme();

  const loadNotes = useCallback(async () => {
    try {
      const {
        getNotesByHashtag,
      } = await import('../database/notes');

      const savedNotes =
        await getNotesByHashtag(
          route.params.hashtag
        );

      setNotes(savedNotes);
    } catch (error) {
      console.error(
        'Failed to load tagged notes:',
        error
      );
    }
  }, [route.params.hashtag]);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  const renderNote = ({
    item,
  }: {
    item: Note;
  }) => {
    return (
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
          styles.noteCard,
          {
            backgroundColor:
              colors.surface,
            borderColor:
              colors.border,
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
      </Pressable>
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
          #{route.params.hashtag}
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
            No notes found
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderNote}
          contentContainerStyle={
            styles.list
          }
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

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
});
