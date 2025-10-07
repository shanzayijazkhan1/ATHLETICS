import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, Users, UserPlus, ArrowLeftRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAppStore } from '@/hooks/use-app-store';

export default function ShiftDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { shifts, staff, currentUser, addAvailability, requestSwap, isLoading } = useAppStore();
  
  const shift = shifts.find((s: any) => s.id === id);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!shift) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Shift not found</Text>
      </View>
    );
  }

  const assignedStaff = staff.filter((s: any) => shift.assignedTo.includes(s.id));
  const availableStaff = staff.filter((s: any) => shift.availableFor.includes(s.id));
  const isAssigned = shift.assignedTo.includes(currentUser.id);
  const isAvailable = shift.availableFor.includes(currentUser.id);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.eventName}>{shift.eventName || 'Shift'}</Text>
        {shift.eventType && (
          <View style={styles.eventBadge}>
            <Text style={styles.eventBadgeText}>
              {shift.eventType.charAt(0).toUpperCase() + shift.eventType.slice(1)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Calendar size={20} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{formatDate(shift.date)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={20} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{shift.startTime} - {shift.endTime}</Text>
        </View>
        
        {shift.location && (
          <View style={styles.detailRow}>
            <MapPin size={20} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{shift.location}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Users size={20} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {shift.assignedTo.length}/{shift.requiredStaff} Staff Assigned
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assigned Staff</Text>
        {assignedStaff.map((member: any) => (
          <TouchableOpacity 
            key={member.id}
            style={styles.staffCard}
            onPress={() => router.push(`/employee/${member.id}`)}
          >
            <View style={styles.staffAvatar}>
              <Text style={styles.staffInitials}>
                {member.name.split(' ').map((n: string) => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.staffInfo}>
              <Text style={styles.staffName}>{member.name}</Text>
              <Text style={styles.staffTitle}>{member.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {availableStaff.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Staff</Text>
          {availableStaff.map((member: any) => (
            <View key={member.id} style={styles.availableCard}>
              <Text style={styles.availableName}>{member.name}</Text>
              {currentUser.role !== 'employee' && (
                <TouchableOpacity style={styles.assignButton}>
                  <Text style={styles.assignButtonText}>Assign</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {currentUser.role === 'employee' && !isAssigned && !isAvailable && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => addAvailability({ shiftId: shift.id, userId: currentUser.id })}
          >
            <UserPlus size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Mark as Available</Text>
          </TouchableOpacity>
        )}
        
        {isAssigned && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.swapButton]}
            onPress={() => {
              // Handle swap request
              requestSwap({
                id: `swap-${Date.now()}`,
                fromUserId: currentUser.id,
                toUserId: '',
                shiftId: shift.id,
                status: 'pending',
                requestDate: new Date().toISOString(),
              });
            }}
          >
            <ArrowLeftRight size={20} color={Colors.primary} />
            <Text style={[styles.actionButtonText, styles.swapButtonText]}>
              Request Swap
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  eventName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  eventBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  eventBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  detailsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    color: Colors.text,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  staffInitials: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  staffTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  availableCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  availableName: {
    fontSize: 15,
    color: Colors.text,
  },
  assignButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  actions: {
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  swapButton: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  swapButtonText: {
    color: Colors.primary,
  },
});