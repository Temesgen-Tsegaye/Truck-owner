import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable 
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/profile/edit')}
        >
          <BlurView intensity={20} tint="dark" style={styles.menuCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-outline" size={24} color="#ff642f" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.menuTitle}>Edit Profile</Text>
              <Text style={styles.menuSubtitle}>Manage your personal information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
          </BlurView>
        </Pressable>

        <Pressable 
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/profile/settings')}
        >
          <BlurView intensity={20} tint="dark" style={styles.menuCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="settings-outline" size={24} color="#ff642f" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.menuTitle}>Settings</Text>
              <Text style={styles.menuSubtitle}>App preferences and account settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
          </BlurView>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161412',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#161412',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: 24,
    gap: 16,
    paddingBottom: 100,
  },
  menuItem: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  menuCard: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 100, 47, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
});
