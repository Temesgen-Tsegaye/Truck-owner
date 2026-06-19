import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useLoadsQuery } from "@/query/loads";
import { LoadCard } from "@/components/loads/load-card";
import { useAppTheme } from "@/context/theme-context";
import { Colors, Fonts } from "@/constants/theme";
import { useProfile } from "@/query/profile/profile-query";

export default function Dashboard() {
  const router = useRouter();
  const { data, isLoading, refetch } = useLoadsQuery();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );
  const { data: profile } = useProfile();
  const { isDarkMode } = useAppTheme();
  const theme = Colors[isDarkMode ? "dark" : "light"];

  const [searchQuery, setSearchQuery] = useState('');
  const firstName = profile?.firstName?.trim() || 'there';

  const profilePicUri = (() => {
    const pic = profile?.profilePicture;
    if (!pic) return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
    if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
    const api = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    return `${api}${pic}`;
  })();

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
          <Image 
            source={{ uri: profilePicUri }} 
            style={styles.profilePic} 
          />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greetingText}>Welcome {firstName}</Text>
          <Text style={styles.userName}>Truck Owner</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/notifications')}>
          <View style={styles.notificationDot} />
          <Ionicons name="notifications-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Search & Filter Component */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={theme.subtext} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Enter tracking number"
          placeholderTextColor={theme.subtext}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.scanBtn}>
          <MaterialCommunityIcons name="line-scan" size={20} color={theme.subtext} />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Loads</Text>
      </View>
    </View>
  );

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    listContent: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 120,
    },
    headerWrapper: {
      marginBottom: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    profilePic: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 16,
    },
    headerTextContainer: {
      flex: 1,
    },
    greetingText: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: theme.subtext,
      marginBottom: 4,
    },
    userName: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: theme.text,
    },
    notificationBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    notificationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#ff4d4d',
      position: 'absolute',
      top: 10,
      right: 12,
      zIndex: 1,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 30,
      paddingHorizontal: 16,
      height: 56,
      marginBottom: 32,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontFamily: Fonts.medium,
      fontSize: 15,
      color: theme.text,
      height: '100%',
    },
    scanBtn: {
      padding: 8,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: theme.text,
    },
    emptyState: {
      padding: 32,
      alignItems: "center",
      marginTop: 40,
      backgroundColor: theme.card,
      borderRadius: 24,
    },
    emptyTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: theme.text,
      textAlign: "center",
    },
    emptySubtitle: {
      marginTop: 8,
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: theme.subtext,
      textAlign: "center",
      lineHeight: 20,
    },
  }), [theme]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LoadCard load={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {isLoading ? "Looking for loads..." : "No loads available"}
            </Text>
            <Text style={styles.emptySubtitle}>
              Check back later for new load opportunities.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

