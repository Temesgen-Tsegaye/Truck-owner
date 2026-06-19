import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { LoadItem } from "@/lib/load-schemas";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { Fonts, Colors } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";

type Props = {
  load: LoadItem;
  onEdit?: () => void;
};

const TEXTURE_DOTS = Array.from({ length: 54 }, (_, index) => ({
  id: index,
  opacity: 0.05 + ((index % 5) * 0.025),
  size: 2 + (index % 2),
}));

export function LoadCard({ load, onEdit }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useAppTheme();
  const theme = Colors[isDarkMode ? "dark" : "light"];

  const gradientColors = isDarkMode
    ? ["rgba(74, 63, 57, 0.94)", "rgba(56, 49, 44, 0.9)", "rgba(42, 37, 34, 0.86)"]
    : ["rgba(255, 255, 255, 0.94)", "rgba(250, 245, 242, 0.9)", "rgba(245, 238, 235, 0.86)"];

  const highlightColors = isDarkMode
    ? ["rgba(255,255,255,0.14)", "rgba(255,255,255,0.03)", "rgba(255,255,255,0)"]
    : ["rgba(0,0,0,0.04)", "rgba(0,0,0,0.01)", "rgba(0,0,0,0)"];

  const handleStartChat = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await api.post("/chat/room", {
        loadId: load.id,
        merchantId: load.merchantId,
      });
      const room = response.data;
      router.push(`/(tabs)/chat/${room.id}`);
    } catch (error) {
      console.error("Failed to start chat", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.cardShell, { borderColor: theme.border, backgroundColor: theme.card }]}>
      <BlurView intensity={24} tint={isDarkMode ? "dark" : "light"} style={[styles.card, { backgroundColor: isDarkMode ? "rgba(68, 57, 51, 0.34)" : "rgba(255, 255, 255, 0.5)" }]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View pointerEvents="none" style={styles.textureLayer}>
          {TEXTURE_DOTS.map((dot) => (
            <View
              key={dot.id}
              style={[
                styles.textureDot,
                {
                  opacity: dot.opacity,
                  width: dot.size,
                  height: dot.size,
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.06)",
                },
              ]}
            />
          ))}
        </View>
        <LinearGradient
          pointerEvents="none"
          colors={highlightColors}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          style={styles.highlightMask}
        />

        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.kicker, { color: isDarkMode ? '#C9B8AD' : '#78716C' }]}>Active Load</Text>
              <Text style={[styles.orderId, { color: isDarkMode ? '#E2D8D2' : '#57534E' }]} numberOfLines={1}>ID - {load.id.slice(0, 8).toUpperCase()}</Text>
            </View>
            {onEdit ? (
              <TouchableOpacity
                style={[styles.trackingPill, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                onPress={onEdit}
              >
                <Text style={styles.trackingPillText}>Edit Load</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.trackingPill, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                onPress={handleStartChat}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.trackingPillText}>Negotiate</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailsCol}>
              <Text style={[styles.labelSmall, { color: isDarkMode ? '#B4A6A0' : '#78716C' }]}>From</Text>
              <Text style={[styles.cityText, { color: isDarkMode ? '#FFF6F0' : '#1C1917' }]} numberOfLines={1}>{load.startingPlace}</Text>
              <Text style={[styles.dateText, { color: isDarkMode ? '#D1C4BE' : '#78716C' }]} numberOfLines={1}>Ready Now</Text>

              <View style={styles.spacer} />

              <Text style={[styles.labelSmall, { color: isDarkMode ? '#B4A6A0' : '#78716C' }]}>Category</Text>
              <Text style={[styles.personText, { color: isDarkMode ? '#F2E8E3' : '#292524' }]} numberOfLines={1}>{load.loadCategory.replace(/_/g, " ")}</Text>

              <View style={styles.contactRow}>
                <View style={[styles.actionBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
                  <Ionicons name="cube-outline" size={16} color={isDarkMode ? "#d8cec6" : "#57534E"} />
                </View>
              </View>
            </View>

            <View style={styles.detailsCol}>
              <Text style={[styles.labelSmall, { color: isDarkMode ? '#B4A6A0' : '#78716C' }]}>To</Text>
              <Text style={[styles.cityText, { color: isDarkMode ? '#FFF6F0' : '#1C1917' }]} numberOfLines={1}>{load.destinationPlace}</Text>
              <Text style={[styles.dateText, { color: isDarkMode ? '#D1C4BE' : '#78716C' }]} numberOfLines={1}>{new Date(load.deliveryDate).toLocaleDateString()}</Text>

              <View style={styles.spacer} />

              <Text style={[styles.labelSmall, { color: isDarkMode ? '#B4A6A0' : '#78716C' }]}>Specs</Text>
              <Text style={[styles.personText, { color: isDarkMode ? '#F2E8E3' : '#292524' }]} numberOfLines={1}>{load.weight} kg</Text>

              <View style={styles.contactRow}>
                <View
                  style={[
                    styles.actionBtn,
                    load.isApproved ? styles.statusApproved : styles.statusPending,
                  ]}
                >
                  <Ionicons
                    name={load.isApproved ? "checkmark-circle-outline" : "time-outline"}
                    size={16}
                    color={load.isApproved ? "#C8F5DB" : "#FFD89A"}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    marginBottom: 18,
    borderRadius: 28,
    borderWidth: 1,
    backgroundColor: "rgba(62, 53, 48, 0.18)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    backgroundColor: "rgba(68, 57, 51, 0.34)",
    borderRadius: 28,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  textureLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'space-between',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
    textureDot: {
      borderRadius: 999,
      marginVertical: 5,
    },
  highlightMask: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  kicker: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: '#C9B8AD',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  orderId: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: '#E2D8D2',
  },
  trackingPill: {
    backgroundColor: '#f15a2b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#f15a2b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 4,
  },
  trackingPillText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#fff',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsCol: {
    flex: 1,
    paddingRight: 10,
  },
  labelSmall: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: '#B4A6A0',
    marginBottom: 6,
  },
  cityText: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#FFF6F0',
    marginBottom: 4,
  },
  dateText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#D1C4BE',
  },
  spacer: {
    height: 24,
  },
  personText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#F2E8E3',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusApproved: {
    backgroundColor: 'rgba(91, 175, 127, 0.18)',
    borderColor: 'rgba(165, 232, 192, 0.12)',
  },
  statusPending: {
    backgroundColor: 'rgba(241, 90, 43, 0.15)',
    borderColor: 'rgba(255, 193, 165, 0.12)',
  },
});
