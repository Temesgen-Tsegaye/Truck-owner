import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useChatRoomsQuery } from '@/query/chat';

export default function ChatList() {
  const router = useRouter();
  const { data: rooms = [], isLoading, error } = useChatRoomsQuery();

  if (isLoading) {
    return (
      <View style={styles.container}>
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
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable 
            style={styles.roomItem}
            onPress={() => router.push(`/(tabs)/chat/${item.id}`)}
          >
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
            <Text style={styles.roomDate}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  roomItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  roomIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roomIconText: {
    color: '#4F46E5',
    fontSize: 22,
    fontWeight: '700',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  roomSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  roomDate: {
    fontSize: 12,
    color: '#9CA3AF',
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
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
