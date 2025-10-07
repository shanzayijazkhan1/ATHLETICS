import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { TeamMember, Team, Shift, Chat, Notification, SwapRequest } from '@/types';
import { staffDirectory } from '@/mocks/staff-directory';
import { mockTeams } from '@/mocks/teams';
import { mockShifts } from '@/mocks/shifts';

export const [AppProvider, useAppStore] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<TeamMember>(staffDirectory[0]);
  const [profileOverrides, setProfileOverrides] = useState<Partial<TeamMember>>({});
  const [selectedTeamId, setSelectedTeamId] = useState<string>('marketing');
  
  // Load persisted user
  const userQuery = useQuery({
    queryKey: ['currentUser', currentUser.id],
    queryFn: async () => {
      // Mock storage for demo
      const stored = null;
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        return user;
      }
      return currentUser;
    },
  });

  // Teams
  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      // Mock storage for demo
      const stored = null;
      return stored ? JSON.parse(stored) : mockTeams;
    },
  });

  // Staff Directory
  const staffQuery = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      // Mock storage for demo
      const stored = null;
      return stored ? JSON.parse(stored) : staffDirectory;
    },
  });

  // Shifts
  const shiftsQuery = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => {
      // Mock storage for demo
      const stored = null;
      return stored ? JSON.parse(stored) : mockShifts;
    },
  });

  // Chats
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 'c1',
      type: 'group',
      name: 'Marketing Team',
      teamId: 'marketing',
      participants: ['1', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
      lastMessage: {
        id: 'm1',
        chatId: 'c1',
        senderId: '5',
        text: "I'll handle the social media for tomorrow's game",
        timestamp: new Date().toISOString(),
        read: false,
      },
      unreadCount: 3,
    },
    {
      id: 'c2',
      type: 'channel',
      name: '#marketing-general',
      teamId: 'marketing',
      participants: ['1', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
      lastMessage: {
        id: 'm2',
        chatId: 'c2',
        senderId: '1',
        text: 'Welcome to the marketing team channel!',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
      },
      unreadCount: 0,
    },
    // Individual chats
    {
      id: 'individual-4',
      type: 'individual',
      name: 'Charlotte Waters',
      teamId: 'marketing',
      participants: ['1', '4'],
      lastMessage: {
        id: 'm3',
        chatId: 'individual-4',
        senderId: '4',
        text: 'Thanks for updating the schedule! See you at the volleyball game tomorrow.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
      unreadCount: 1,
    },
    {
      id: 'individual-5',
      type: 'individual',
      name: 'Shanzay Khan',
      teamId: 'marketing',
      participants: ['1', '5'],
      lastMessage: {
        id: 'm4',
        chatId: 'individual-5',
        senderId: '1',
        text: 'Great job on the social media posts for the last event!',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: true,
      },
      unreadCount: 0,
    },
    {
      id: 'individual-3',
      type: 'individual',
      name: 'Sam Gilla',
      teamId: 'marketing',
      participants: ['1', '3'],
      lastMessage: {
        id: 'm5',
        chatId: 'individual-3',
        senderId: '3',
        text: 'I can cover the extra shift on Friday if needed.',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        read: false,
      },
      unreadCount: 2,
    },
    {
      id: 'individual-9',
      type: 'individual',
      name: 'Martin Manriquez',
      teamId: 'marketing',
      participants: ['1', '9'],
      lastMessage: {
        id: 'm6',
        chatId: 'individual-9',
        senderId: '9',
        text: 'The equipment is all set up for tomorrow\'s game. Ready to go!',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        read: true,
      },
      unreadCount: 0,
    },
    {
      id: 'individual-7',
      type: 'individual',
      name: 'Edie Wortzman',
      teamId: 'marketing',
      participants: ['1', '7'],
      lastMessage: {
        id: 'm7',
        chatId: 'individual-7',
        senderId: '1',
        text: 'Can you help with the fan engagement activities this weekend?',
        timestamp: new Date(Date.now() - 18000000).toISOString(),
        read: true,
      },
      unreadCount: 0,
    },
  ]);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'n1',
      type: 'shift',
      title: 'Shift Reminder',
      description: 'Your shift starts in 2 hours - UCONN (2:00 PM - 5:30 PM) at McGrath-Phillips Arena',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: false,
    },
    {
      id: 'n2',
      type: 'shift',
      title: 'Tomorrow\'s Shift',
      description: 'Tomorrow\'s shift: Providence (2:30 PM - 6:30 PM) at McGrath-Phillips Arena',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
    },
    {
      id: 'n3',
      type: 'message',
      title: 'New message from Sarah',
      description: 'Thanks for the schedule update!',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false,
    },
    {
      id: 'n4',
      type: 'shift',
      title: 'Shift Reminder',
      description: 'Your shift starts in 45 minutes - Move In (8:00 AM - 4:00 PM) at Campus',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      read: true,
    },
    {
      id: 'n5',
      type: 'team',
      title: 'Team Update',
      description: 'New shift assignments have been posted for next week',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
    },
    {
      id: 'n6',
      type: 'schedule',
      title: 'Schedule Change',
      description: 'Your Thursday shift has been moved to 10:00 AM',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      read: true,
    },
  ]);

  // Generate shift reminders function
  const generateShiftReminders = useCallback(() => {
    if (!shiftsQuery.data || !currentUser) return;
    
    const now = new Date();
    const userShifts = shiftsQuery.data.filter((shift: Shift) => 
      shift.assignedTo.includes(currentUser.id)
    );
    
    const newReminders: Notification[] = [];
    
    userShifts.forEach((shift: Shift) => {
      const shiftDate = new Date(`${shift.date}T${shift.startTime}:00`);
      const timeDiff = shiftDate.getTime() - now.getTime();
      const hoursUntilShift = timeDiff / (1000 * 60 * 60);
      
      // Create reminders for shifts in the next 24 hours
      if (hoursUntilShift > 0 && hoursUntilShift <= 24) {
        const existingReminder = notifications.find(n => 
          n.type === 'shift' && n.description.includes(shift.eventName || '')
        );
        
        if (!existingReminder) {
          let reminderText = '';
          if (hoursUntilShift <= 1) {
            const minutesUntil = Math.floor(timeDiff / (1000 * 60));
            reminderText = `Your shift starts in ${minutesUntil} minutes`;
          } else {
            const hoursRounded = Math.floor(hoursUntilShift);
            reminderText = `Your shift starts in ${hoursRounded} hour${hoursRounded !== 1 ? 's' : ''}`;
          }
          
          const formatTime = (time: string) => {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${displayHour}:${minutes} ${ampm}`;
          };
          
          newReminders.push({
            id: `reminder-${shift.id}-${Date.now()}`,
            type: 'shift',
            title: 'Shift Reminder',
            description: `${reminderText} - ${shift.eventName || 'Shift'} (${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}) at ${shift.location}`,
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      }
      
      // Create day-before reminders
      if (hoursUntilShift > 12 && hoursUntilShift <= 36) {
        const existingDayBeforeReminder = notifications.find(n => 
          n.type === 'shift' && n.description.includes(`Tomorrow's shift`) && n.description.includes(shift.eventName || '')
        );
        
        if (!existingDayBeforeReminder) {
          const formatTime = (time: string) => {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${displayHour}:${minutes} ${ampm}`;
          };
          
          newReminders.push({
            id: `day-before-${shift.id}-${Date.now()}`,
            type: 'shift',
            title: 'Tomorrow\'s Shift',
            description: `Tomorrow's shift: ${shift.eventName || 'Shift'} (${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}) at ${shift.location}`,
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      }
    });
    
    if (newReminders.length > 0) {
      setNotifications(prev => [...newReminders, ...prev]);
    }
  }, [shiftsQuery.data, currentUser, notifications]);

  // Mutations
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<TeamMember>) => {
      console.log('updateProfileMutation called with:', updates);
      
      // Update profile overrides
      setProfileOverrides(prev => ({ ...prev, ...updates }));
      
      // Update current user with overrides
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      
      // Mock storage for demo
      // await AsyncStorage.setItem('profileOverrides', JSON.stringify({ ...profileOverrides, ...updates }));
      
      return updatedUser;
    },
    onSuccess: (data) => {
      console.log('updateProfileMutation success, data:', data);
    },
    onError: (error) => {
      console.error('updateProfileMutation error:', error);
    },
  });

  const updateShiftMutation = useMutation({
    mutationFn: async (shift: Shift) => {
      console.log('updateShiftMutation called with:', shift);
      const shifts = shiftsQuery.data || [];
      console.log('Current shifts:', shifts.length);
      const updated = shifts.map((s: Shift) => {
        if (s.id === shift.id) {
          console.log('Updating shift:', s.id, 'from', s.assignedTo, 'to', shift.assignedTo);
          return { ...s, ...shift };
        }
        return s;
      });
      console.log('Updated shifts array length:', updated.length);
      
      // Update the query data immediately for optimistic updates
      queryClient.setQueryData(['shifts'], updated);
      
      // Mock storage for demo
      // await AsyncStorage.setItem('shifts', JSON.stringify(updated));
      
      return shift;
    },
    onSuccess: (data) => {
      console.log('updateShiftMutation success, data:', data);
      // Don't invalidate queries since we're using optimistic updates
    },
    onError: (error) => {
      console.error('updateShiftMutation error:', error);
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });

  const addAvailabilityMutation = useMutation({
    mutationFn: async ({ shiftId, userId }: { shiftId: string; userId: string }) => {
      const shifts = shiftsQuery.data || [];
      const updated = shifts.map((s: Shift) => {
        if (s.id === shiftId) {
          return {
            ...s,
            availableFor: [...s.availableFor, userId],
          };
        }
        return s;
      });
      // Mock storage for demo
      // await AsyncStorage.setItem('shifts', JSON.stringify(updated));
      
      // Update the query data immediately for optimistic updates
      queryClient.setQueryData(['shifts'], updated);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });

  const requestSwapMutation = useMutation({
    mutationFn: async (swapRequest: SwapRequest) => {
      // Add swap request logic
      const notification: Notification = {
        id: `n${Date.now()}`,
        type: 'swap',
        title: 'Swap Request',
        description: `${currentUser.name} requested a shift swap`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [notification, ...prev]);
      return swapRequest;
    },
  });

  const markNotificationAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    },
  });

  const markAllNotificationsAsReadMutation = useMutation({
    mutationFn: async () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    },
  });

  // Generate shift reminders when shifts or user changes
  useEffect(() => {
    if (shiftsQuery.data && currentUser) {
      generateShiftReminders();
    }
  }, [shiftsQuery.data, currentUser, generateShiftReminders]);

  // Set up interval to check for new reminders every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      generateShiftReminders();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [generateShiftReminders]);

  // Computed values
  const currentTeam = useMemo(() => {
    return teamsQuery.data?.find((t: Team) => t.id === selectedTeamId);
  }, [teamsQuery.data, selectedTeamId]);

  const teamMembers = useMemo(() => {
    if (!currentTeam || !staffQuery.data) return [];
    return staffQuery.data.filter((member: TeamMember) => 
      member.teams.includes(currentTeam.id)
    );
  }, [currentTeam, staffQuery.data]);

  const userShifts = useMemo(() => {
    if (!shiftsQuery.data) return [];
    return shiftsQuery.data.filter((shift: Shift) => 
      shift.assignedTo.includes(currentUser.id)
    );
  }, [shiftsQuery.data, currentUser.id]);

  const availableShifts = useMemo(() => {
    if (!shiftsQuery.data) return [];
    return shiftsQuery.data.filter((shift: Shift) => 
      shift.status === 'available' || shift.availableFor.length > 0
    );
  }, [shiftsQuery.data]);

  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const switchTeam = useCallback((teamId: string) => {
    console.log('Switching to team:', teamId);
    setSelectedTeamId(teamId);
  }, []);

  const createIndividualChat = useCallback((memberId: string) => {
    console.log('Creating individual chat with member:', memberId);
    const member = staffQuery.data?.find((s: TeamMember) => s.id === memberId);
    if (!member) {
      console.log('Member not found:', memberId);
      return null;
    }
    
    const existingChat = chats.find(c => 
      c.type === 'individual' && c.participants.includes(memberId) && c.participants.includes(currentUser.id)
    );
    
    if (existingChat) {
      console.log('Existing chat found:', existingChat.id);
      return existingChat.id;
    }
    
    const newChat: Chat = {
      id: `individual-${memberId}`,
      type: 'individual',
      name: member.name,
      teamId: member.teams[0] || selectedTeamId,
      participants: [currentUser.id, memberId],
      lastMessage: undefined,
      unreadCount: 0,
    };
    
    console.log('Creating new chat:', newChat);
    setChats(prev => [newChat, ...prev]);
    return newChat.id;
  }, [chats, currentUser.id, staffQuery.data, selectedTeamId]);

  return useMemo(() => ({
    // User
    currentUser,
    setCurrentUser,
    profileOverrides,
    updateProfile: updateProfileMutation.mutate,
    
    // Teams
    teams: teamsQuery.data || [],
    currentTeam,
    selectedTeamId,
    setSelectedTeamId,
    teamMembers,
    switchTeam,
    
    // Staff
    staff: staffQuery.data || [],
    
    // Shifts
    shifts: shiftsQuery.data || [],
    userShifts,
    availableShifts,
    updateShift: updateShiftMutation.mutate,
    addAvailability: addAvailabilityMutation.mutate,
    requestSwap: requestSwapMutation.mutate,
    
    // Chats
    chats,
    setChats,
    
    // Chat helpers
    createIndividualChat,
    
    // Notifications
    notifications,
    unreadNotifications,
    markNotificationAsRead: markNotificationAsReadMutation.mutate,
    markAllNotificationsAsRead: markAllNotificationsAsReadMutation.mutate,
    generateShiftReminders,
    
    // Loading states
    isLoading: userQuery.isLoading || teamsQuery.isLoading || shiftsQuery.isLoading || staffQuery.isLoading,
  }), [
    currentUser,
    teamsQuery.data,
    selectedTeamId,
    teamMembers,
    currentTeam,
    staffQuery.data,
    shiftsQuery.data,
    userShifts,
    availableShifts,
    updateShiftMutation.mutate,
    addAvailabilityMutation.mutate,
    requestSwapMutation.mutate,
    chats,
    notifications,
    unreadNotifications,
    markNotificationAsReadMutation.mutate,
    markAllNotificationsAsReadMutation.mutate,
    generateShiftReminders,
    userQuery.isLoading,
    teamsQuery.isLoading,
    shiftsQuery.isLoading,
    staffQuery.isLoading,
    switchTeam,
    createIndividualChat,
  ]);
});

// Helper hooks
export function useFilteredShifts(filters: { 
  teamId?: string; 
  eventType?: string; 
  date?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'night' | 'all';
}) {
  const { shifts, selectedTeamId } = useAppStore();
  
  return useMemo(() => {
    return shifts.filter((shift: Shift) => {
      // Filter by selected team if no specific teamId filter is provided
      const teamFilter = filters.teamId || selectedTeamId;
      if (teamFilter && shift.teamId !== teamFilter) return false;
      
      if (filters.eventType && shift.eventType !== filters.eventType) return false;
      if (filters.date && !shift.date.startsWith(filters.date)) return false;
      
      if (filters.timeOfDay && filters.timeOfDay !== 'all') {
        const hour = parseInt(shift.startTime.split(':')[0]);
        if (filters.timeOfDay === 'morning' && hour >= 12) return false;
        if (filters.timeOfDay === 'afternoon' && (hour < 12 || hour >= 18)) return false;
        if (filters.timeOfDay === 'night' && hour < 18) return false;
      }
      
      return true;
    });
  }, [shifts, filters, selectedTeamId]);
}

export function useTeamChats(teamId?: string) {
  const { chats } = useAppStore();
  
  return useMemo(() => {
    if (!teamId) return chats;
    return chats.filter(chat => chat.teamId === teamId);
  }, [chats, teamId]);
}