import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { List, Surface, Text, useTheme } from 'react-native-paper';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text variant="headlineLarge" style={{ fontWeight: 'bold' }}>Profile</Text>
      </View>

      <View style={styles.content}>
        <Surface style={styles.surface} elevation={1}>
          <List.Item
            title="Edit Profile"
            description="Manage your personal information"
            left={props => <List.Icon {...props} icon="account-circle" color={theme.colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/(tabs)/profile/edit')}
          />
        </Surface>

        <Surface style={styles.surface} elevation={1}>
          <List.Item
            title="Settings"
            description="App preferences and account settings"
            left={props => <List.Icon {...props} icon="cog" color={theme.colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/(tabs)/profile/settings')}
          />
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  surface: {
    borderRadius: 12,
    overflow: 'hidden'
  },
});
