import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useChatRoomsQuery } from '@/query/chat';
import { StatusBar } from 'expo-status-bar';
import { useAppTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

export default function ChatList() {
  const router = useRouter();
  const { data: rooms = [], isLoading, isFetching, error, refetch } = useChatRoomsQuery();
  const { isDarkMode } = useAppTheme();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.subtext }]}>Loading conversations...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Failed to load conversations</Text>
          <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>Please try again later.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
      </View>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <Pressable 
            style={styles.roomItem}
            onPress={() => router.push(`/(tabs)/chat/${item.id}`)}
          >
            <BlurView intensity={20} tint={isDarkMode ? 'dark' : 'light'} style={[styles.roomCard, { backgroundColor: colors.overlay, borderColor: colors.border }]}>
              <View style={[styles.roomIcon, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.roomIconText, { color: colors.primary }]}>
                  {item.merchant?.bussinessName?.charAt(0) || 
                   item.merchant?.user?.firstName?.charAt(0) || 'M'}
                </Text>
              </View>
              <View style={styles.roomInfo}>
                <Text style={[styles.roomName, { color: colors.text }]}>
                  {item.merchant?.bussinessName || 
                   `${item.merchant?.user?.firstName || ''} ${item.merchant?.user?.lastName || ''}`.trim() || 
                   'Merchant'}
                </Text>
                <Text style={[styles.roomSubtext, { color: colors.subtext }]}>Load: {item.load?.location || 'Unknown'}</Text>
              </View>
              <Text style={[styles.roomDate, { color: colors.subtext }]}>
                {new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
            </BlurView>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No conversations yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>Start a negotiation from the available loads.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
    gap: 16,
  },
  roomItem: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  roomCard: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
  },
  roomIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roomIconText: {
    fontSize: 22,
    fontWeight: '700',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  roomSubtext: {
    fontSize: 14,
  },
  roomDate: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
