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
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

type Hashtag = {
  id: number;
  name: string;
  note_count: number;
};

export default function TagsScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
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

  const loadHashtags = useCallback(async () => {
    try {
      const {
        getHashtags,
      } = await import('../database/notes');

      const savedHashtags =
        await getHashtags();

      setHashtags(savedHashtags);
    } catch (error) {
      console.error(
        'Failed to load hashtags:',
        error
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHashtags();
    }, [loadHashtags])
  );

  const renderHashtag = ({
    item,
  }: {
    item: Hashtag;
  }) => {
    return (
      <Pressable
        onPress={() =>
          navigation.navigate('TagNotes', {
            hashtag: item.name,
          })
        }
        style={[
          styles.tagCard,
          {
            backgroundColor:
              colors.surface,
            borderColor:
              colors.border,
          },
        ]}
      >
      
        <View style={styles.tagInfo}>
          <Text
            style={[
              styles.tagName,
              {
                color: colors.primary,
              },
            ]}
          >
            #{item.name}
          </Text>

          <Text
            style={[
              styles.noteCount,
              {
                color: colors.secondary,
              },
            ]}
          >
            {item.note_count}{' '}
            {item.note_count === 1
              ? 'note'
              : 'notes'}
          </Text>
        </View>

        <Text
          style={[
            styles.arrow,
            {
              color: colors.secondary,
            },
          ]}
        >
          →
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
          Tags
        </Text>
      </View>

      {hashtags.length === 0 ? (
        <View style={styles.emptyState}>
          <Text
            style={[
              styles.emptyTitle,
              {
                color: colors.text,
              },
            ]}
          >
            No tags yet
          </Text>

          <Text
            style={[
              styles.emptyText,
              {
                color: colors.secondary,
              },
            ]}
          >
            Add a #hashtag to a note and
            it will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={hashtags}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderHashtag}
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

  tagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },

  tagInfo: {
    flex: 1,
  },

  tagName: {
    fontSize: 18,
    fontWeight: '700',
  },

  noteCount: {
    marginTop: 4,
    fontSize: 13,
  },

  arrow: {
    fontSize: 22,
    marginLeft: 12,
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
