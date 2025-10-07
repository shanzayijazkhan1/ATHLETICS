import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  User, 
  Calendar, 
  Shield,
  Clock,
  MapPin
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAppStore, useFilteredShifts } from '@/hooks/use-app-store';

export default function TeamViewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { teams, staff, isLoading } = useAppStore();
  
  const team = teams.find((t: any) => t.id === id);
  const teamMembers = staff.filter((member: any) => member.teams.includes(id));
  
  const shifts = useFilteredShifts({
    teamId: id as string,
  });

  const memberShifts = useMemo(() => {
    const memberShiftCounts: Record<string, number> = {};
    const memberUpcomingShifts: Record<string, any[]> = {};
    
    teamMembers.forEach((member: any) => {
      memberShiftCounts[member.id] = 0;
      memberUpcomingShifts[member.id] = [];
    });
    
    shifts.forEach((shift: any) => {
      shift.assignedTo.forEach((memberId: string) => {
        if (memberShiftCounts[memberId] !== undefined) {
          memberShiftCounts[memberId]++;
          
          // Add to upcoming shifts if it's in the future
          const shiftDate = new Date(shift.date);
          const today = new Date();
          if (shiftDate >= today) {
            memberUpcomingShifts[memberId].push(shift);
          }
        }
      });
    });
    
    return { memberShiftCounts, memberUpcomingShifts };
  }, [teamMembers, shifts]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'manager':
        return { text: 'Manager', color: Colors.success };
      case 'sub-manager':
        return { text: 'Team Lead', color: Colors.warning };
      case 'employee':
        return { text: 'Marketing and GameDay Crew', color: Colors.primary };
      default:
        return { text: 'Team Member', color: Colors.textSecondary };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!team) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Team not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{
          title: team.name,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '700' },
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Team Header */}
        <View style={styles.teamHeader}>
          <Text style={styles.teamName}>{team.name}</Text>
          {team.description && (
            <Text style={styles.teamDescription}>{team.description}</Text>
          )}
          <View style={styles.teamStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{teamMembers.length}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{shifts.length}</Text>
              <Text style={styles.statLabel}>Total Shifts</Text>
            </View>
          </View>
        </View>

        {/* Team Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Members</Text>
          {teamMembers.map((member: any) => {
            const roleBadge = getRoleBadge(member.role);
            const shiftCount = memberShifts.memberShiftCounts[member.id] || 0;
            const upcomingShifts = memberShifts.memberUpcomingShifts[member.id] || [];
            
            return (
              <TouchableOpacity 
                key={member.id} 
                style={styles.memberCard}
                onPress={() => router.push(`/employee/${member.id}`)}
              >
                <View style={styles.memberInfo}>
                  <View style={styles.memberAvatar}>
                    <User size={24} color="#fff" />
                  </View>
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberTitle}>{member.title}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: roleBadge.color + '20' }]}>
                      <Shield size={12} color={roleBadge.color} />
                      <Text style={[styles.roleBadgeText, { color: roleBadge.color }]}>
                        {roleBadge.text}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.memberStats}>
                  <View style={styles.memberStat}>
                    <Clock size={16} color={Colors.textSecondary} />
                    <Text style={styles.memberStatText}>{shiftCount} shifts</Text>
                  </View>
                  {upcomingShifts.length > 0 && (
                    <View style={styles.memberStat}>
                      <Calendar size={16} color={Colors.primary} />
                      <Text style={styles.memberStatText}>{upcomingShifts.length} upcoming</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recent Shifts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Team Shifts</Text>
          {shifts.slice(0, 5).map((shift: any) => {
            const assignedMembers = teamMembers.filter((member: any) => 
              shift.assignedTo.includes(member.id)
            );
            
            return (
              <TouchableOpacity 
                key={shift.id} 
                style={styles.shiftCard}
                onPress={() => router.push(`/shift/${shift.id}`)}
              >
                <View style={styles.shiftHeader}>
                  <Text style={styles.shiftTitle}>{shift.eventName || 'Shift'}</Text>
                  <Text style={styles.shiftDate}>
                    {new Date(shift.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                
                <View style={styles.shiftDetails}>
                  <View style={styles.shiftTime}>
                    <Clock size={14} color={Colors.textSecondary} />
                    <Text style={styles.shiftTimeText}>
                      {shift.startTime} - {shift.endTime}
                    </Text>
                  </View>
                  
                  {shift.location && (
                    <View style={styles.shiftLocation}>
                      <MapPin size={14} color={Colors.textSecondary} />
                      <Text style={styles.shiftLocationText}>{shift.location}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.shiftStaff}>
                  {assignedMembers.slice(0, 3).map((member: any) => (
                    <View key={member.id} style={styles.staffAvatar}>
                      <Text style={styles.staffInitial}>
                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                      </Text>
                    </View>
                  ))}
                  {assignedMembers.length > 3 && (
                    <Text style={styles.moreStaff}>+{assignedMembers.length - 3}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
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
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
  },
  content: {
    flex: 1,
  },
  teamHeader: {
    padding: 20,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  teamName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  teamDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  teamStats: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  memberTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  memberStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  memberStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  shiftTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  shiftDate: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  shiftDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  shiftTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shiftTimeText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  shiftLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shiftLocationText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  shiftStaff: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -8,
  },
  staffAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },
  staffInitial: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600' as const,
  },
  moreStaff: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 12,
  },
});