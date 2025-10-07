import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { Clock, MessageCircle, Users, Calendar, CheckCircle, Bell } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAppStore } from '@/hooks/use-app-store';
import { Notification } from '@/types';

export default function NotificationsScreen() {

  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, isLoading } = useAppStore();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'shift':
        return <Clock size={20} color={Colors.primary} />;
      case 'message':
        return <MessageCircle size={20} color={Colors.primary} />;
      case 'team':
        return <Users size={20} color={Colors.primary} />;
      case 'schedule':
        return <Calendar size={20} color={Colors.primary} />;
      case 'swap':
        return <Bell size={20} color={Colors.warning} />;
      default:
        return <Bell size={20} color={Colors.primary} />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const newNotifications = notifications.filter(n => !n.read);
  const earlierNotifications = notifications.filter(n => n.read);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {newNotifications.length > 0 && (
          <TouchableOpacity onPress={() => markAllNotificationsAsRead()}>
            <Text style={styles.markAllRead}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {/* New Notifications */}
        {newNotifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>New</Text>
            {newNotifications.map(notification => (
              <TouchableOpacity
                key={notification.id}
                style={[styles.notificationItem, styles.unreadNotification]}
                onPress={() => markNotificationAsRead(notification.id)}
              >
                <View style={styles.iconContainer}>
                  {getNotificationIcon(notification.type)}
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationDescription}>
                    {notification.description}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {formatTimestamp(notification.timestamp)}
                  </Text>
                </View>
                <View style={styles.unreadIndicator} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Earlier Notifications */}
        {earlierNotifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Earlier</Text>
            {earlierNotifications.map(notification => (
              <TouchableOpacity
                key={notification.id}
                style={styles.notificationItem}
              >
                <View style={styles.iconContainer}>
                  {getNotificationIcon(notification.type)}
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationDescription}>
                    {notification.description}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {formatTimestamp(notification.timestamp)}
                  </Text>
                </View>
                <CheckCircle size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Bell size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyDescription}>
              You&apos;re all caught up! Check back later for updates.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  markAllRead: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  notificationsList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  unreadNotification: {
    backgroundColor: Colors.primaryLight + '08',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  notificationDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});