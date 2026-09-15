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
import {SafeAreaView} from 'react-native-safe-area-context';

export default function App() {
  const [text, setText] = useState('');
  const [listMode, setListMode] = useState(false);
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

  const sendNote = () => {
    if (!text.trim()) return;

    // Persistence will be added in the next milestone.
    setText('');
    setListMode(false);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            ScatterTag
          </Text>
        </View>

        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Have a thought?
          </Text>

          <Text style={[styles.emptyText, { color: colors.secondary }]}>
            Just type it. Organize it later.
          </Text>

          <View style={styles.tips}>
            <Text style={[styles.tip, { color: colors.secondary }]}>
              □  Tap the checkbox to start a list
            </Text>
            <Text style={[styles.tip, { color: colors.secondary }]}>
              #  Add tags to find notes later
            </Text>
            <Text style={[styles.tip, { color: colors.secondary }]}>
              /pin  Keep something important at the top
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.composer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Pressable
            onPress={() => setListMode((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={
              listMode ? 'Turn off list mode' : 'Turn on list mode'
            }
            style={styles.listButton}
          >
            <Text
              style={[
                styles.checkbox,
                { color: listMode ? colors.primary : colors.secondary },
              ]}
            >
              {listMode ? '☑' : '□'}
            </Text>
          </Pressable>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={listMode ? 'Add a list item...' : "What's on your mind?"}
            placeholderTextColor={colors.secondary}
            multiline
            textAlignVertical="top"
            returnKeyType={listMode ? 'next' : 'send'}
            blurOnSubmit={!listMode}
            onSubmitEditing={sendNote}
            style={[
              styles.input,
              {
                color: colors.text,
              },
            ]}
          />

          <Pressable
            onPress={sendNote}
            accessibilityRole="button"
            accessibilityLabel="Save note"
            style={[
              styles.sendButton,
              {
                backgroundColor: text.trim()
                  ? colors.primary
                  : colors.border,
              },
            ]}
          >
            <Text style={styles.sendArrow}>➤</Text>
          </Pressable>
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
    paddingBottom: 8,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
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
