import { useEffect, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ImageBackground, 
  TouchableOpacity,
  Modal,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useSession } from "@/context/auth-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/constants/theme";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => setShowWebView(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#09090B' }}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sign in via Telegram</Text>
                <TouchableOpacity onPress={() => setShowWebView(false)} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#a1a1aa" />
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

      <AnimatedImageBackground 
        source={require('@/assets/images/truck-bg.jpg')} 
        style={styles.backgroundImage}
        resizeMode="cover"
        entering={FadeIn.duration(800)}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}
          locations={[0, 0.4, 0.95]}
          style={styles.gradientOverlay}
        />
        
        <SafeAreaView style={styles.content}>
          {/* Top Brand Name */}
          <Animated.View style={styles.header} entering={FadeInDown.delay(600).duration(800).springify()}>
            <Text style={styles.brandText}>EthioLogistics.</Text>
          </Animated.View>
          
          {/* Bottom Texts and Button */}
          <View style={styles.bottomSection}>
            <Animated.Text style={styles.title} entering={FadeInDown.delay(900).duration(800).springify()}>Manage{"\n"}Your Fleet</Animated.Text>
            <Animated.Text style={styles.subtitle} entering={FadeInDown.delay(1200).duration(800).springify()}>
              Find reliable loads and seamlessly{"\n"}track your trucks in seconds.
            </Animated.Text>

            <Animated.View style={styles.buttonRow} entering={FadeInDown.delay(1500).duration(800).springify()}>
              {/* Telegram Login Button */}
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleTelegramLogin}
                activeOpacity={0.8}
              >
                <View style={styles.actionCircle}>
                  <Ionicons name="paper-plane" size={24} color="#fff" />
                </View>
                
                <Text style={styles.buttonText}>Sign in with Telegram</Text>
                
                <View style={styles.arrowsContainer}>
                  <Ionicons name="chevron-forward" size={16} color="#fff" style={{ opacity: 0.3 }} />
                  <Ionicons name="chevron-forward" size={16} color="#fff" style={{ opacity: 0.6, marginLeft: -8 }} />
                  <Ionicons name="chevron-forward" size={16} color="#fff" style={{ opacity: 1, marginLeft: -8 }} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </SafeAreaView>
      </AnimatedImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 40,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  header: {
    marginTop: 10, 
  },
  brandText: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: '#ffffff',
    letterSpacing: 1,
  },
  bottomSection: {
    width: '100%',
  },
  title: {
    fontFamily: Fonts.extraBold,
    fontSize: 36,
    color: '#ffffff',
    lineHeight: 40,
    marginBottom: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 40,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    height: 72,
  },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F36F45', // matching the orange from the image
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: '#ffffff',
    flex: 1,
  },
  arrowsContainer: {
    flexDirection: 'row',
    marginRight: 16,
  },
  modalHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#09090B',
  },
  modalTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: '#fff',
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#27272a',
    borderRadius: 20,
  },
});
