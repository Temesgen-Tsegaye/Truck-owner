import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useShipmentsQuery, ShipmentItem } from "@/query/shipments";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/context/theme-context";
import { Colors, Fonts } from "@/constants/theme";
import { Skeleton } from "@/components/global/skeleton";
import { ShipmentCard } from "@/components/shipments/shipment-card";

export default function Shipments() {
  const { data: shipments, isLoading, isFetching, error, refetch } = useShipmentsQuery();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { isDarkMode } = useAppTheme();
  const theme = useMemo(() => Colors[isDarkMode ? "dark" : "light"], [isDarkMode]);

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
      marginBottom: 10,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    eyebrow: {
      fontFamily: Fonts.medium,
      fontSize: 12,
      color: theme.subtext,
      textTransform: 'uppercase',
      letterSpacing: 1.6,
      marginBottom: 8,
    },
    pageTitle: {
      fontFamily: Fonts.bold,
      fontSize: 34,
      color: theme.text,
      letterSpacing: -0.8,
      marginBottom: 6,
    },
    pageSubtitle: {
      fontFamily: Fonts.medium,
      fontSize: 15,
      color: theme.subtext,
    },
    notificationBtn: {
      width: 46,
      height: 46,
      borderRadius: 23,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    notificationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#ff6a3d',
      position: 'absolute',
      top: 11,
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
      marginBottom: 18,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      fontFamily: Fonts.medium,
      fontSize: 15,
      color: theme.text,
    },
    scanBtn: {
      padding: 8,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 26,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 22,
      paddingHorizontal: 18,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: theme.overlay,
    },
    statLabel: {
      fontFamily: Fonts.medium,
      fontSize: 13,
      color: theme.subtext,
      marginBottom: 8,
    },
    statValue: {
      fontFamily: Fonts.bold,
      fontSize: 24,
      color: theme.text,
    },
    emptyState: {
      padding: 32,
      alignItems: "center",
      marginTop: 40,
      backgroundColor: theme.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.overlay,
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
    loadingCard: {
      borderRadius: 28,
      padding: 22,
      marginBottom: 16,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.overlay,
    },
  }), [theme]);

  const shipmentList = shipments || [];
  const filteredShipments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return shipmentList;
    }

    return shipmentList.filter((shipment) => {
      const shipmentId = shipment.id.toLowerCase();
      const origin = shipment.load.origin.toLowerCase();
      const destination = shipment.load.destination.toLowerCase();
      const status = shipment.status.toLowerCase();

      return (
        shipmentId.includes(query) ||
        origin.includes(query) ||
        destination.includes(query) ||
        status.includes(query)
      );
    });
  }, [searchQuery, shipmentList]);

  const activeCount = shipmentList.filter((shipment) => {
    const status = shipment.status.toLowerCase();
    return ["accepted", "in_progress", "in_transit", "in transit", "pending", "created"].includes(status);
  }).length;

  const deliveredCount = shipmentList.filter((shipment) => {
    const status = shipment.status.toLowerCase();
    return ["completed", "delivered"].includes(status);
  }).length;

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.eyebrow}>Shipment Center</Text>
          <Text style={styles.pageTitle}>My Shipments</Text>
          <Text style={styles.pageSubtitle}>Track and manage active deliveries.</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/notifications')}>
          <View style={styles.notificationDot} />
          <Ionicons name="notifications-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={theme.subtext} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search shipments"
          placeholderTextColor={theme.subtext}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.scanBtn}>
          <MaterialCommunityIcons name="line-scan" size={20} color={theme.subtext} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active</Text>
          <Text style={styles.statValue}>{activeCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Delivered</Text>
          <Text style={styles.statValue}>{deliveredCount}</Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
        <FlatList
          data={[1, 2, 3, 4]}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          renderItem={() => (
            <View style={[styles.loadingCard, { height: 180 }]}>
              <Skeleton width="60%" height={24} style={{ marginBottom: 12 }} />
              <Skeleton width="40%" height={16} style={{ marginBottom: 12 }} />
              <Skeleton width="30%" height={16} style={{ marginBottom: 24 }} />
              <Skeleton width="100%" height={52} />
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Oops!</Text>
          <Text style={styles.emptySubtitle}>
            Failed to load shipments. Please try again later.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderShipmentItem = ({ item }: { item: ShipmentItem }) => {
    return (
      <ShipmentCard
        shipment={item}
        onPress={() => router.push(`/shipment/${item.id}`)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <FlatList
        data={filteredShipments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderShipmentItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Shipments</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "No shipments match your search yet."
                : "You don't have any active shipments yet."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
