import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { Filter, UserCheck, Users, Plus, X, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useAppStore, useFilteredShifts } from '@/hooks/use-app-store';
import { Shift } from '@/types';

export default function ShiftsScreen() {
  const router = useRouter();

  const { currentUser, staff, addAvailability, updateShift, isLoading, shifts: allShifts } = useAppStore();
  const [activeTab, setActiveTab] = useState<'assigned' | 'available'>('assigned');
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'night'>('all');
  // const [eventFilter, setEventFilter] = useState<string>('all');
  
  const shifts = useFilteredShifts({
    timeOfDay: timeFilter,
  });

  const filteredShifts = useMemo(() => {
    console.log('Filtering shifts:', { activeTab, timeFilter, shiftsCount: shifts.length });
    return shifts.filter((shift: Shift) => {
      // First apply tab filter
      if (activeTab === 'assigned') {
        if (shift.assignedTo.length === 0) return false;
      } else {
        if (shift.status !== 'available' && shift.availableFor.length === 0) return false;
      }
      
      // Then apply time filter
      if (timeFilter !== 'all') {
        const hour = parseInt(shift.startTime.split(':')[0]);
        if (timeFilter === 'morning' && hour >= 12) return false;
        if (timeFilter === 'afternoon' && (hour < 12 || hour >= 18)) return false;
        if (timeFilter === 'night' && hour < 18) return false;
      }
      
      return true;
    });
  }, [shifts, activeTab, timeFilter]);

  const handleAddAvailability = (shiftId: string) => {
    if (currentUser.role === 'employee') {
      addAvailability({ shiftId, userId: currentUser.id });
    }
  };

  const handleRemoveFromShift = (shiftId: string, staffId: string) => {
    console.log('Removing staff from shift:', { shiftId, staffId, userRole: currentUser.role });
    if (currentUser.role !== 'employee') {
      const shift = allShifts.find((s: any) => s.id === shiftId);
      if (shift) {
        console.log('Found shift:', shift);
        console.log('Current assignedTo:', shift.assignedTo);
        const updatedShift = {
          ...shift,
          assignedTo: shift.assignedTo.filter((id: string) => id !== staffId),
          availableFor: shift.availableFor.includes(staffId) ? shift.availableFor : [...shift.availableFor, staffId],
        };
        console.log('Updated shift:', updatedShift);
        updateShift(updatedShift);
      } else {
        console.log('Shift not found');
      }
    } else {
      console.log('User is employee, cannot remove from shift');
    }
  };

  const handleAssignToShift = (shiftId: string, staffId: string) => {
    console.log('Assigning staff to shift:', { shiftId, staffId, userRole: currentUser.role });
    if (currentUser.role !== 'employee') {
      const shift = allShifts.find((s: any) => s.id === shiftId);
      if (shift && !shift.assignedTo.includes(staffId)) {
        console.log('Found shift:', shift);
        console.log('Current assignedTo:', shift.assignedTo);
        const updatedShift = {
          ...shift,
          assignedTo: [...shift.assignedTo, staffId],
          availableFor: shift.availableFor.filter((id: string) => id !== staffId),
          status: 'assigned' as const,
        };
        console.log('Updated shift:', updatedShift);
        updateShift(updatedShift);
      } else if (shift && shift.assignedTo.includes(staffId)) {
        console.log('Staff already assigned to this shift');
      } else {
        console.log('Shift not found');
      }
    } else {
      console.log('User is employee, cannot assign to shift');
    }
  };

  const getStaffInitials = (staffId: string) => {
    const member = staff.find((s: any) => s.id === staffId);
    if (!member) return '??';
    return member.name.split(' ').map((n: string) => n[0]).join('');
  };

  // const getStaffName = (staffId: string) => {
  //   const member = staff.find(s => s.id === staffId);
  //   return member?.name || 'Unknown';
  // };

  const formatShiftDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const getShiftTimeCategory = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Night';
  };

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
        <Text style={styles.headerTitle}>All Shifts</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Time Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {(['all', 'morning', 'afternoon', 'night'] as const).map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.filterChip,
              timeFilter === time && styles.filterChipActive,
            ]}
            onPress={() => setTimeFilter(time)}
          >
            <Text style={[
              styles.filterChipText,
              timeFilter === time && styles.filterChipTextActive,
            ]}>
              {time.charAt(0).toUpperCase() + time.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assigned' && styles.tabActive]}
          onPress={() => setActiveTab('assigned')}
        >
          <UserCheck size={18} color={activeTab === 'assigned' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'assigned' && styles.tabTextActive]}>
            Assigned
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.tabActive]}
          onPress={() => setActiveTab('available')}
        >
          <Users size={18} color={activeTab === 'available' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>
            Available
          </Text>
        </TouchableOpacity>
      </View>

      {/* Shifts List */}
      <ScrollView style={styles.shiftsList} showsVerticalScrollIndicator={false}>
        {filteredShifts.map((shift: Shift) => (
          <View key={shift.id} style={styles.shiftSection}>
            <View style={styles.dateHeader}>
              <Calendar size={16} color={Colors.primary} />
              <Text style={styles.dateText}>{formatShiftDate(shift.date)}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.shiftCard}
              onPress={() => router.push(`/shift/${shift.id}`)}
            >
              <View style={styles.shiftHeader}>
                <View style={styles.shiftTimeContainer}>
                  <Text style={styles.shiftTime}>
                    {shift.startTime} - {shift.endTime}
                  </Text>
                  <View style={[styles.timeBadge, { backgroundColor: Colors.primaryLight + '20' }]}>
                    <Text style={styles.timeBadgeText}>
                      {getShiftTimeCategory(shift.startTime)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.shiftStatus}>
                  {shift.assignedTo.length}/{shift.requiredStaff} filled
                </Text>
              </View>

              {shift.eventName && (
                <Text style={styles.eventName}>{shift.eventName}</Text>
              )}
              {shift.location && (
                <Text style={styles.location}>{shift.location}</Text>
              )}

              {activeTab === 'available' && shift.availableFor.length > 0 && (
                <View style={styles.availableSection}>
                  <Text style={styles.availableCount}>
                    {shift.availableFor.length} available
                  </Text>
                  {currentUser.role !== 'employee' && (
                    <View style={styles.availableStaff}>
                      {shift.availableFor.map((staffId: string) => {
                        const member = staff.find((s: any) => s.id === staffId);
                        if (!member) return null;
                        return (
                          <TouchableOpacity
                            key={staffId}
                            style={styles.availableStaffItem}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleAssignToShift(shift.id, staffId);
                            }}
                          >
                            <View style={styles.availableAvatar}>
                              <Text style={styles.availableInitials}>
                                {member.name.split(' ').map((n: string) => n[0]).join('')}
                              </Text>
                            </View>
                            <Text style={styles.availableStaffName}>{member.name}</Text>
                            <Plus size={14} color={Colors.success} />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              <View style={styles.staffContainer}>
                {shift.assignedTo.map(staffId => (
                  <TouchableOpacity
                    key={staffId}
                    style={styles.staffBubble}
                    onPress={() => router.push(`/employee/${staffId}`)}
                  >
                    <View style={styles.staffAvatar}>
                      <Text style={styles.staffInitials}>
                        {getStaffInitials(staffId)}
                      </Text>
                    </View>
                    {currentUser.role !== 'employee' && (
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleRemoveFromShift(shift.id, staffId);
                        }}
                      >
                        <X size={12} color={Colors.error} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
                
                {currentUser.role === 'employee' && 
                 !shift.assignedTo.includes(currentUser.id) &&
                 !shift.availableFor.includes(currentUser.id) && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddAvailability(shift.id)}
                  >
                    <Plus size={16} color={Colors.textSecondary} />
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          </View>
        ))}
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
  filterButton: {
    padding: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 60,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  shiftsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  shiftSection: {
    marginTop: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  shiftCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shiftTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shiftTime: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  shiftStatus: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  eventName: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  availableCount: {
    fontSize: 13,
    color: Colors.success,
    marginBottom: 8,
  },
  staffContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  staffBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffInitials: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  removeButton: {
    marginLeft: -8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed' as const,
    gap: 4,
  },
  addButtonText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  availableSection: {
    marginBottom: 8,
  },
  availableStaff: {
    marginTop: 8,
    gap: 8,
  },
  availableStaffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '10',
    borderRadius: 8,
    padding: 8,
    gap: 8,
  },
  availableAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availableInitials: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600' as const,
  },
  availableStaffName: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500' as const,
  },
});