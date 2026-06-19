import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { isDarkMode } = useAppTheme();
  const theme = useMemo(() => Colors[isDarkMode ? 'dark' : 'light'], [isDarkMode]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: 20,
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
    },
    content: {
      paddingHorizontal: 16,
      gap: 16,
    },
    blurCard: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.overlay,
    },
    cardPressed: {
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    },
    cardIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 100, 47, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    cardDescription: {
      fontSize: 14,
      color: theme.subtext,
    },
  }), [theme]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <BlurView intensity={20} tint={isDarkMode ? "dark" : "light"} style={styles.blurCard}>
          <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed
              ]}
              onPress={() => router.push('/(tabs)/profile/edit')}
          >
              <View style={styles.cardIconContainer}>
                  <Ionicons name="person-circle-outline" size={24} color={theme.primary} />
              </View>
              <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>Edit Profile</Text>
                  <Text style={styles.cardDescription}>Manage your personal information</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.icon} />
          </Pressable>
        </BlurView>

        <BlurView intensity={20} tint={isDarkMode ? "dark" : "light"} style={styles.blurCard}>
          <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed
              ]}
              onPress={() => router.push('/(tabs)/profile/settings')}
          >
               <View style={styles.cardIconContainer}>
                  <Ionicons name="settings-outline" size={24} color={theme.primary} />
              </View>
               <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>Settings</Text>
                  <Text style={styles.cardDescription}>App preferences and account settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.icon} />
          </Pressable>
        </BlurView>
      </View>
    </SafeAreaView>
  );
}
