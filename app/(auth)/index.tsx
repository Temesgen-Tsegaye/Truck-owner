import { useEffect, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity,
  Modal,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useSession } from "@/context/auth-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const { signIn } = useSession();
  const router = useRouter();
  const [showWebView, setShowWebView] = useState(false);

  useEffect(() => {
    // Handle deep link when app is already open or opened from cold start
    const handleDeepLink = (event: { url: string }) => {
      let data = Linking.parse(event.url);
      if (data.queryParams?.token) {
        signIn(data.queryParams.token as string);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Check initial URL
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleTelegramLogin = () => {
    setShowWebView(true);
  };

  const handleAuthRedirect = (url: string) => {
    if (url.startsWith('flowera-truck-owner://')) {
      setShowWebView(false);
      const data = Linking.parse(url);
      if (data.queryParams?.token) {
        signIn(data.queryParams.token as string);
      }
      return true;
    }
    return false;
  };

  const onShouldStartLoadWithRequest = (event: any) => {
    if (handleAuthRedirect(event.url)) return false;
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => setShowWebView(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowWebView(false)} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
            <WebView
            source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}/authentication/telegram/login/vehicleOwner` }}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            onNavigationStateChange={(event) => handleAuthRedirect(event.url)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            style={{ flex: 1 }}
            originWhitelist={['*']}
            setSupportMultipleWindows={false}
            />
        </SafeAreaView>
      </Modal>

      <View style={styles.content}>
        {/* Make sure the logo path is correct */}
        <Image 
          source={require('@/assets/images/logo/flowera-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to Flowera</Text>
          <Text style={styles.subtitle}>
             Join the network of fresh flower trade.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.telegramButton]} 
            onPress={handleTelegramLogin}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#0088CC', '#00A2E8', '#00C6FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            />
            <Ionicons name="paper-plane" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Continue with Telegram</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B3A57',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  telegramButton: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#0088CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});
