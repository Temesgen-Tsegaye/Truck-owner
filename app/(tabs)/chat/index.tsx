import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useChatRoomsQuery } from '@/query/chat';
import { StatusBar } from 'expo-status-bar';

export default function ChatList() {
  const router = useRouter();
  const { data: rooms = [], isLoading, error } = useChatRoomsQuery();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Loading conversations...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Failed to load conversations</Text>
          <Text style={styles.emptySubtitle}>Please try again later.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable 
            style={styles.roomItem}
            onPress={() => router.push(`/(tabs)/chat/${item.id}`)}
          >
            <BlurView intensity={20} tint="dark" style={styles.roomCard}>
              <View style={styles.roomIcon}>
                <Text style={styles.roomIconText}>
                  {item.merchant?.bussinessName?.charAt(0) || 
                   item.merchant?.user?.firstName?.charAt(0) || 'M'}
                </Text>
              </View>
              <View style={styles.roomInfo}>
                <Text style={styles.roomName}>
                  {item.merchant?.bussinessName || 
                   `${item.merchant?.user?.firstName || ''} ${item.merchant?.user?.lastName || ''}`.trim() || 
                   'Merchant'}
                </Text>
                <Text style={styles.roomSubtext}>Load: {item.load?.location || 'Unknown'}</Text>
              </View>
              <Text style={styles.roomDate}>
                {new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
            </BlurView>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>Start a negotiation from the available loads.</Text>
          </View>
        }
      />
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
  },
  roomIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 100, 47, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roomIconText: {
    color: '#ff642f',
    fontSize: 22,
    fontWeight: '700',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  roomSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  roomDate: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
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
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});
