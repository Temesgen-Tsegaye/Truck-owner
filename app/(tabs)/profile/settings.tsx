import { View, StyleSheet, Alert } from 'react-native';
import { useSession } from '@/context/auth-context';
import { CustomButton } from '@/components/global/button';

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
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 10,
  },
  button: {
    width: '100%',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    marginTop: 10,
  },
});
