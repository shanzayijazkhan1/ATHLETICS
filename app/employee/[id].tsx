import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock, MapPin, Users, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAppStore, useFilteredShifts } from '@/hooks/use-app-store';
import { Shift } from '@/types';

export default function EmployeeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { staff, teams, isLoading } = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const shifts = useFilteredShifts({});
  
  const employee = staff.find((s: any) => s.id === id);

  const employeeShifts = useMemo(() => {
    if (!employee) return [];
    return shifts.filter((shift: Shift) => shift.assignedTo.includes(employee.id));
  }, [shifts, employee]);

  const monthlyShifts = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    return employeeShifts.filter((shift: Shift) => {
      const shiftDate = new Date(shift.date);
      return shiftDate.getFullYear() === year && shiftDate.getMonth() === month;
    });
  }, [employeeShifts, selectedMonth]);

  const totalHours = useMemo(() => {
    return monthlyShifts.reduce((total: number, shift: Shift) => {
      const start = new Date(`2000-01-01T${shift.startTime}`);
      const end = new Date(`2000-01-01T${shift.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0);
  }, [monthlyShifts]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedMonth(newDate);
  };

  const formatShiftDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTeamColor = (teamId: string) => {
    const teamColors = {
      marketing: Colors.primary,
      operations: Colors.success,
      events: Colors.warning,
    };
    return teamColors[teamId as keyof typeof teamColors] || Colors.textSecondary;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!employee) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Employee not found</Text>
        <TouchableOpacity style={styles.errorBackButton} onPress={() => router.back()}>
          <Text style={styles.errorBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.employeeName}>{employee.name}</Text>
          <Text style={styles.employeeTitle}>{employee.title}</Text>
        </View>
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={() => router.push(`/chat/individual-${employee.id}`)}
        >
          <MessageCircle size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={() => navigateMonth('prev')}>
          <ArrowLeft size={20} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={() => navigateMonth('next')}>
          <ArrowLeft size={20} color={Colors.primary} style={styles.rotatedArrow} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Calendar size={20} color={Colors.primary} />
          <Text style={styles.statNumber}>{monthlyShifts.length}</Text>
          <Text style={styles.statLabel}>Shifts</Text>
        </View>
        <View style={styles.statCard}>
          <Clock size={20} color={Colors.success} />
          <Text style={styles.statNumber}>{totalHours.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Hours</Text>
        </View>
        <View style={styles.statCard}>
          <Users size={20} color={Colors.warning} />
          <Text style={styles.statNumber}>{employee.teams.length}</Text>
          <Text style={styles.statLabel}>Teams</Text>
        </View>
      </View>

      {/* Shifts List */}
      <ScrollView style={styles.shiftsList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Schedule</Text>
        {monthlyShifts.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No shifts scheduled this month</Text>
          </View>
        ) : (
          monthlyShifts
            .sort((a: Shift, b: Shift) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((shift: Shift) => {
              const team = teams.find((t: any) => t.id === shift.teamId);
              return (
                <TouchableOpacity
                  key={shift.id}
                  style={styles.shiftCard}
                  onPress={() => router.push(`/shift/${shift.id}`)}
                >
                  <View style={styles.shiftHeader}>
                    <View style={styles.shiftDate}>
                      <Text style={styles.shiftDateText}>
                        {formatShiftDate(shift.date)}
                      </Text>
                      <Text style={styles.shiftTime}>
                        {shift.startTime} - {shift.endTime}
                      </Text>
                    </View>
                    <View style={[styles.teamBadge, { backgroundColor: getTeamColor(shift.teamId) + '20' }]}>
                      <Text style={[styles.teamBadgeText, { color: getTeamColor(shift.teamId) }]}>
                        {team?.name || 'Team'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.eventName}>{shift.eventName || 'Shift'}</Text>
                  
                  {shift.location && (
                    <View style={styles.locationRow}>
                      <MapPin size={14} color={Colors.textSecondary} />
                      <Text style={styles.locationText}>{shift.location}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  employeeTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  messageButton: {
    padding: 8,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  shiftsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  shiftCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  shiftDate: {
    flex: 1,
  },
  shiftDateText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  shiftTime: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 2,
  },
  teamBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teamBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  eventName: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  errorBackButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  errorBackButtonText: {
    color: '#fff',
    fontWeight: '600' as const,
  },
  rotatedArrow: {
    transform: [{ rotate: '180deg' }],
  },
});