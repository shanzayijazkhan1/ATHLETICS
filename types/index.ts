export type UserRole = 'manager' | 'employee' | 'sub-manager';

export type ShiftStatus = 'assigned' | 'available' | 'pending-swap';

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  title: string;
  department: string;
  role: UserRole;
  teams: string[];
  profileImage?: string;
  startDate?: string;
};

export type Team = {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  subManagerIds: string[];
  memberIds: string[];
  color: string;
};

export type Shift = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  teamId: string;
  eventType?: 'volleyball' | 'soccer' | 'softball' | 'basketball' | 'other';
  eventName?: string;
  location?: string;
  assignedTo: string[];
  availableFor: string[];
  requiredStaff: number;
  status: ShiftStatus;
  swapRequests?: SwapRequest[];
  description?: string;
};

export type SwapRequest = {
  id: string;
  fromUserId: string;
  toUserId: string;
  shiftId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  message?: string;
};

export type Chat = {
  id: string;
  type: 'individual' | 'group' | 'channel';
  name: string;
  teamId?: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
};

export type Notification = {
  id: string;
  type: 'shift' | 'message' | 'team' | 'schedule' | 'swap';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  icon?: string;
  actionUrl?: string;
};

export type CalendarView = 'daily' | 'weekly' | 'monthly';