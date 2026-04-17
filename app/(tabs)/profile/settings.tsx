import { View, StyleSheet, Alert } from 'react-native';
import { useSession } from '@/context/auth-context';
import { CustomButton } from '@/components/global/button';
import { StatusBar } from 'expo-status-bar';

export default function Settings() {
  const { signOut } = useSession();

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
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <CustomButton 
          title="Log Out" 
          onPress={signOut} 
          style={styles.button} 
        />
        
        <CustomButton 
          title="Delete Account" 
          onPress={handleDeleteAccount} 
          style={[styles.button, styles.deleteButton]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161412',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    width: '100%',
    borderRadius: 999,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
});
