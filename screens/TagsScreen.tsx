import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import {
  Ionicons,
} from '@expo/vector-icons';

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
  id: string;
  name: string;
  note_count: number;
};

export default function TagsScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const {
    colors,
  } = useTheme();

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
            style={[
              styles.tab,
              styles.activeTab,
              {
                borderBottomColor:
                  colors.primary,
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
              Tags
            </Text>
          </Pressable>
        </View>
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
