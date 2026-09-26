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
  useColorScheme,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import CaptureScreen from './screens/CaptureScreen';
import NotesScreen from './screens/NotesScreen';
import NoteDetailScreen from './screens/NoteDetailScreen';
import TagsScreen from './screens/TagsScreen';
import TagNotesScreen from './screens/TagNotesScreen';
import SettingsScreen from './screens/SettingsScreen';
import {
  ThemeProvider,
  useTheme,
} from './context/ThemeContext';
import { getDatabase } from './database/database';
import {
  createNote,
  createList,
  addHashtagsToNote,
  getHashtags,
} from './database/notes';
import mobileAds from 'react-native-google-mobile-ads';




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

const Stack =
  createNativeStackNavigator<RootStackParamList>();



export default function App() {
  React.useEffect(() => {
    // Initialize AdMob
    mobileAds()
      .initialize()
      .then(() => {
        console.log('AdMob initialized');
      })
      .catch((error) => {
        console.error('AdMob initialization failed:', error);
      });

    // Initialize database
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Capture"
            screenOptions={{
              headerShown: false,
            }}
        >
          <Stack.Screen
            name="Capture"
            component={
              CaptureScreen
            }
          />

          <Stack.Screen
            name="Notes"
            component={NotesScreen}
            
          />

          <Stack.Screen
            name="NoteDetail"
            component={
              NoteDetailScreen
            }
          />

          <Stack.Screen
            name="Tags"
            component={
              TagsScreen
            }
          />

          <Stack.Screen
            name="TagNotes"
            component={
              TagNotesScreen
            }
          />

          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
    </GestureHandlerRootView>
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
    justifyContent:
      'space-between',
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
    textDecorationLine:
      'line-through',
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