import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  TextInput,
} from 'react-native';

import { ChevronLeft, ChevronRight, Users, Calendar as CalendarIcon, List, Search, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useAppStore, useFilteredShifts } from '@/hooks/use-app-store';
import { CalendarView, Shift } from '@/types';

export default function ScheduleScreen() {
  const router = useRouter();

  const { currentUser, teams, selectedTeamId, setSelectedTeamId, staff, isLoading } = useAppStore();
  const [calendarView, setCalendarView] = useState<CalendarView>('weekly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const shifts = useFilteredShifts({
    teamId: selectedTeamId === 'all' ? undefined : selectedTeamId,
  });

  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  }, [selectedDate]);

  const monthDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty days for alignment
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add all days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, [selectedDate]);

  const getShiftsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter((shift: Shift) => shift.date === dateStr);
  };

  const getEmployeeShiftsForDate = (employeeId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter((shift: Shift) => 
      shift.date === dateStr && shift.assignedTo.includes(employeeId)
    );
  };

  const renderEmployeeSchedules = (date: Date) => {
    const teamStaff = selectedTeamId === 'all' 
      ? staff 
      : staff.filter((s: any) => s.teams.includes(selectedTeamId));
    
    // Filter out Nina, Kassidy, and Sam from the schedules display
    let filteredStaff = teamStaff.filter((s: any) => 
      !['1', '2', '3'].includes(s.id)
    );
    
    // Apply search filter
    if (searchQuery.trim()) {
      filteredStaff = filteredStaff.filter((s: any) => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return (
      <View style={styles.employeeSchedules}>
        <Text style={styles.employeeSchedulesTitle}>Team Schedules</Text>
        {filteredStaff.map((employee: any) => {
          const employeeShifts = getEmployeeShiftsForDate(employee.id, date);
          const totalHours = employeeShifts.reduce((total: number, shift: Shift) => {
            const start = new Date(`2000-01-01 ${shift.startTime}`);
            const end = new Date(`2000-01-01 ${shift.endTime}`);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return total + hours;
          }, 0);
          
          return (
            <TouchableOpacity 
              key={employee.id}
              style={styles.employeeScheduleCard}
              onPress={() => router.push(`/employee/${employee.id}`)}
            >
              <View style={styles.employeeHeader}>
                <View style={styles.employeeInfo}>
                  <View style={styles.employeeAvatar}>
                    <Text style={styles.employeeInitial}>
                      {employee.name.split(' ').map((n: string) => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.employeeDetails}>
                    <Text style={styles.employeeName}>{employee.name}</Text>
                    <Text style={styles.employeeTitle}>{employee.title}</Text>
                  </View>
                </View>
                <View style={styles.employeeStats}>
                  <Text style={styles.employeeHours}>{totalHours.toFixed(1)}h</Text>
                  <Text style={styles.employeeShiftCount}>{employeeShifts.length} shifts</Text>
                </View>
              </View>
              
              {employeeShifts.length > 0 && (
                <View style={styles.employeeShiftsList}>
                  {employeeShifts.map((shift: Shift) => (
                    <View key={shift.id} style={styles.employeeShiftItem}>
                      <Text style={styles.shiftTimeRange}>{shift.startTime} - {shift.endTime}</Text>
                      <Text style={styles.shiftEvent}>{shift.eventName}</Text>
                      <Text style={styles.shiftLocation}>{shift.location}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {employeeShifts.length === 0 && (
                <Text style={styles.noShiftsText}>No shifts scheduled</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (calendarView === 'daily') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (calendarView === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const formatDateHeader = () => {
    if (calendarView === 'daily') {
      return selectedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } else if (calendarView === 'weekly') {
      const endOfWeek = new Date(weekDays[6]);
      return `${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
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
      {/* Header Controls */}
      <View style={styles.header}>
        <View style={styles.dropdownRow}>
          <Pressable 
            style={styles.teamDropdown}
            onPress={() => setShowTeamDropdown(!showTeamDropdown)}
          >
            <Text style={styles.teamDropdownText}>
              {selectedTeamId === 'all' ? 'All Teams' : teams.find((t: any) => t.id === selectedTeamId)?.name || 'Select Team'}
            </Text>
            <ChevronRight size={16} color={Colors.textSecondary} style={[styles.chevronIcon, { transform: [{ rotate: showTeamDropdown ? '90deg' : '0deg' }] }]} />
          </Pressable>
          
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Search size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        {showSearch && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search employees..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery('')}
              >
                <X size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {showTeamDropdown && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedTeamId('all');
                setShowTeamDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>All Teams</Text>
            </TouchableOpacity>
            {teams.map((team: any) => (
              <TouchableOpacity 
                key={team.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedTeamId(team.id);
                  setShowTeamDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{team.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[styles.viewButton, calendarView === 'daily' && styles.viewButtonActive]}
            onPress={() => setCalendarView('daily')}
          >
            <List size={16} color={calendarView === 'daily' ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.viewButtonText, calendarView === 'daily' && styles.viewButtonTextActive]}>
              Daily
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewButton, calendarView === 'weekly' && styles.viewButtonActive]}
            onPress={() => setCalendarView('weekly')}
          >
            <CalendarIcon size={16} color={calendarView === 'weekly' ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.viewButtonText, calendarView === 'weekly' && styles.viewButtonTextActive]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewButton, calendarView === 'monthly' && styles.viewButtonActive]}
            onPress={() => setCalendarView('monthly')}
          >
            <CalendarIcon size={16} color={calendarView === 'monthly' ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.viewButtonText, calendarView === 'monthly' && styles.viewButtonTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateNavigation}>
          <TouchableOpacity onPress={() => navigateDate('prev')}>
            <ChevronLeft size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.dateText}>{formatDateHeader()}</Text>
          <TouchableOpacity onPress={() => navigateDate('next')}>
            <ChevronRight size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Content */}
      <ScrollView style={styles.calendarContainer} showsVerticalScrollIndicator={false}>
        {calendarView === 'daily' && (
          <View style={styles.dailyView}>
            <Text style={styles.dayHeader}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </Text>
            {renderEmployeeSchedules(selectedDate)}
          </View>
        )}

        {calendarView === 'weekly' && (
          <View style={styles.weeklyView}>
            <View style={styles.weekHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <Text key={day} style={styles.weekDayHeader}>{day}</Text>
              ))}
            </View>
            <View style={styles.weekGrid}>
              {weekDays.map((date) => {
                const dayShifts = getShiftsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                
                return (
                  <TouchableOpacity
                    key={date.toISOString()}
                    style={[
                      styles.weekDay,
                      isToday && styles.weekDayToday,
                      isSelected && styles.weekDaySelected,
                    ]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[
                      styles.weekDayNumber,
                      isSelected && styles.weekDayNumberSelected,
                    ]}>
                      {date.getDate()}
                    </Text>
                    {dayShifts.length > 0 && (
                      <View style={styles.shiftIndicator}>
                        <Text style={styles.shiftCount}>{dayShifts.length}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* Show selected day's employee schedules */}
            <View style={styles.selectedDayShifts}>
              <Text style={styles.selectedDayTitle}>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
              {renderEmployeeSchedules(selectedDate)}
            </View>
          </View>
        )}

        {calendarView === 'monthly' && (
          <View style={styles.monthlyView}>
            <View style={styles.weekHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.monthDayHeader}>{day}</Text>
              ))}
            </View>
            <View style={styles.monthGrid}>
              {monthDays.map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={styles.monthDay} />;
                }
                
                const dayShifts = getShiftsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                
                return (
                  <TouchableOpacity
                    key={date.toISOString()}
                    style={[
                      styles.monthDay,
                      isToday && styles.monthDayToday,
                      isSelected && styles.monthDaySelected,
                    ]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[
                      styles.monthDayNumber,
                      isSelected && styles.monthDayNumberSelected,
                    ]}>
                      {date.getDate()}
                    </Text>
                    {dayShifts.length > 0 && (
                      <View style={styles.monthShiftDots}>
                        {dayShifts.slice(0, 3).map((shift: any, i: number) => (
                          <View key={`${shift.id}-${i}`} style={styles.shiftDot} />
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* Show selected day's employee schedules */}
            <View style={styles.selectedDayShifts}>
              <Text style={styles.selectedDayTitle}>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
              {renderEmployeeSchedules(selectedDate)}
            </View>
          </View>
        )}
      </ScrollView>

      {/* View Team Button */}
      {(currentUser.role === 'manager' || currentUser.role === 'sub-manager') && (
        <TouchableOpacity 
          style={styles.viewTeamButton}
          onPress={() => {
            const teamId = selectedTeamId === 'all' ? currentUser.teams[0] : selectedTeamId;
            router.push(`/team/${teamId}`);
          }}
        >
          <Users size={20} color={Colors.primary} />
          <Text style={styles.viewTeamText}>View Team</Text>
        </TouchableOpacity>
      )}
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
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teamDropdownText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemText: {
    fontSize: 14,
    color: Colors.text,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  viewButtonActive: {
    backgroundColor: Colors.primary,
  },
  viewButtonText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  viewButtonTextActive: {
    color: '#fff',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  calendarContainer: {
    flex: 1,
  },
  dailyView: {
    padding: 16,
  },
  dayHeader: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  weeklyView: {
    padding: 16,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  weekGrid: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  weekDay: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 8,
    marginHorizontal: 2,
    paddingTop: 8,
    position: 'relative',
  },
  weekDayToday: {
    backgroundColor: Colors.surface,
  },
  weekDaySelected: {
    backgroundColor: Colors.primary,
  },
  weekDayNumber: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  weekDayNumberSelected: {
    color: '#fff',
  },
  shiftIndicator: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  shiftCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600' as const,
  },
  selectedDayShifts: {
    marginTop: 8,
  },
  selectedDayTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  monthlyView: {
    padding: 16,
  },
  monthDayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthDay: {
    width: '14.285714%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 8,
  },
  monthDayToday: {
    backgroundColor: Colors.surface,
  },
  monthDaySelected: {
    backgroundColor: Colors.primary,
  },
  monthDayNumber: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  monthDayNumberSelected: {
    color: '#fff',
    fontWeight: '600' as const,
  },
  monthShiftDots: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  shiftDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
  dayEventCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.primary,
  },
  eventLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  workingToday: {
    gap: 4,
  },
  workingTodayLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  staffNames: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  staffNameText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  shiftCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shiftTime: {
    marginRight: 16,
    alignItems: 'center',
  },
  shiftTimeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  timeDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  shiftDetails: {
    flex: 1,
  },
  shiftTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },

  shiftStaff: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  staffChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 6,
  },
  staffAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffInitial: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600' as const,
  },
  staffName: {
    fontSize: 12,
    color: Colors.text,
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },
  miniAvatarText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600' as const,
  },
  moreStaff: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
    alignSelf: 'center',
  },
  viewTeamButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  viewTeamText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  chevronIcon: {
    // Empty style for transform
  },
  employeeSchedules: {
    marginTop: 16,
  },
  employeeSchedulesTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  employeeScheduleCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  employeeInitial: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  employeeTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  employeeStats: {
    alignItems: 'flex-end',
  },
  employeeHours: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  employeeShiftCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  employeeShiftsList: {
    gap: 8,
  },
  employeeShiftItem: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
  },
  shiftTimeRange: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  shiftEvent: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  shiftLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  noShiftsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  searchButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 4,
  },
  clearSearchButton: {
    padding: 4,
  },
});