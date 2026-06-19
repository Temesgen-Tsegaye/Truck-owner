import { View, Text, StyleSheet, Alert, Switch } from 'react-native';
import { useSession } from '@/context/auth-context';
import { CustomButton } from '@/components/global/button';
import { StatusBar } from 'expo-status-bar';
import { useAppTheme } from '@/context/theme-context';
import { Colors, Fonts } from '@/constants/theme';

export default function Settings() {
  const { signOut } = useSession();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => console.log("Account deleted") }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View style={styles.content}>

        <View style={[styles.toggleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <View style={[styles.toggleIcon, { backgroundColor: colors.primaryLight }]}>
                <View style={[styles.toggleCircle, { backgroundColor: colors.primary }]} />
              </View>
              <View>
                <Text style={[styles.toggleTitle, { color: colors.text }]}>
                  Appearance
                </Text>
                <Text style={[styles.toggleSubtitle, { color: colors.subtext }]}>
                  {isDarkMode ? 'Dark' : 'Light'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E4E4E7', true: colors.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E4E4E7"
            />
          </View>
        </View>

        <CustomButton 
          title="Log Out" 
          onPress={signOut} 
          style={styles.button} 
        />
        
        <CustomButton 
          title="Delete Account" 
          onPress={handleDeleteAccount} 
          style={[styles.button, { backgroundColor: colors.statusCancelledBg, borderWidth: 1, borderColor: colors.statusCancelled }]}
          textStyle={{ color: colors.statusCancelled }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  toggleCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  toggleTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  toggleSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  button: {
    width: '100%',
    borderRadius: 999,
  },
});
