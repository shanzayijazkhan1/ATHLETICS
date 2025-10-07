import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';

import { Search, UserPlus, Hash, Users, ChevronDown, Plus, X, MessageCircle, UserCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useAppStore, useTeamChats } from '@/hooks/use-app-store';
import { Chat } from '@/types';

export default function ChatsScreen() {
  const router = useRouter();

  const { currentUser, teams, selectedTeamId, setSelectedTeamId, staff, isLoading, createIndividualChat, chats: allChats, setChats } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'individual' | 'groups'>('all');
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatType, setNewChatType] = useState<'individual' | 'group'>('individual');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupChatName, setGroupChatName] = useState('');
  
  const teamChats = useTeamChats(selectedTeamId === 'all' ? undefined : selectedTeamId);

  const filteredChats = teamChats.filter((chat: Chat) => {
    if (activeTab !== 'all') {
      if (activeTab === 'individual' && chat.type !== 'individual') return false;
      if (activeTab === 'groups' && chat.type === 'individual') return false;
    }
    
    if (searchQuery) {
      return chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  });

  const filteredStaff = staff.filter((member: any) => {
    if (!searchQuery) return staff; // Show all staff when no search query
    const query = searchQuery.toLowerCase();
    return member.name.toLowerCase().includes(query) ||
           member.title.toLowerCase().includes(query) ||
           member.email.toLowerCase().includes(query);
  });

  const getChatIcon = (chat: Chat) => {
    if (chat.type === 'channel') {
      return <Hash size={20} color={Colors.textSecondary} />;
    } else if (chat.type === 'group') {
      return <Users size={20} color={Colors.textSecondary} />;
    }
    return null;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
      {/* Team Selector */}
      <TouchableOpacity 
        style={styles.teamSelector}
        onPress={() => setShowTeamDropdown(!showTeamDropdown)}
      >
        <Text style={styles.teamSelectorText}>
          {selectedTeamId === 'all' ? 'All Teams' : teams.find((t: any) => t.id === selectedTeamId)?.name || 'Select Team'}
        </Text>
        <ChevronDown size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations"
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setShowDirectory(true)}
          onBlur={() => setTimeout(() => setShowDirectory(false), 200)}
        />
        <TouchableOpacity 
          style={styles.directoryButton}
          onPress={() => setShowDirectory(!showDirectory)}
        >
          <UserPlus size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Directory Search Results */}
      {showDirectory && (
        <View style={styles.directoryResults}>
          <View style={styles.directoryHeader}>
            <Text style={styles.directoryTitle}>Staff Directory</Text>
            <TouchableOpacity 
              style={styles.newChatButton}
              onPress={() => {
                setShowNewChatModal(true);
                setShowDirectory(false);
              }}
            >
              <Plus size={16} color={Colors.primary} />
              <Text style={styles.newChatText}>New Chat</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.directoryScroll} showsVerticalScrollIndicator={false}>
            {filteredStaff.map((member: any) => (
              <TouchableOpacity
                key={member.id}
                style={styles.directoryItem}
                onPress={() => {
                  console.log('Creating chat with member:', member.id, member.name);
                  const chatId = createIndividualChat(member.id);
                  console.log('Chat ID returned:', chatId);
                  if (chatId) {
                    router.push(`/chat/${chatId}`);
                  } else {
                    console.error('Failed to create chat');
                  }
                  setShowDirectory(false);
                  setSearchQuery('');
                }}
              >
                <View style={styles.directoryAvatar}>
                  <Text style={styles.directoryInitials}>
                    {member.name.split(' ').map((n: string) => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.directoryInfo}>
                  <Text style={styles.directoryName}>{member.name}</Text>
                  <Text style={styles.directoryTitleText}>{member.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['all', 'individual', 'groups'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chats List */}
      <ScrollView style={styles.chatsList} showsVerticalScrollIndicator={false}>
        {filteredChats.map((chat: Chat) => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatItem}
            onPress={() => router.push(`/chat/${chat.id}`)}
          >
            <View style={styles.chatAvatar}>
              {getChatIcon(chat) || (
                <Text style={styles.chatInitials}>
                  {chat.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </Text>
              )}
            </View>
            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatName}>{chat.name}</Text>
                {chat.lastMessage && (
                  <Text style={styles.chatTime}>
                    {formatTimestamp(chat.lastMessage.timestamp)}
                  </Text>
                )}
              </View>
              {chat.lastMessage && (
                <Text style={styles.chatMessage} numberOfLines={1}>
                  {chat.lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                  {chat.lastMessage.text}
                </Text>
              )}
            </View>
            {chat.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{chat.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* New Chat Modal */}
      <Modal
        visible={showNewChatModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewChatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.newChatModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Start New Chat</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowNewChatModal(false);
                  setSelectedMembers([]);
                  setGroupChatName('');
                  setNewChatType('individual');
                }}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            {/* Chat Type Selector */}
            <View style={styles.chatTypeSelector}>
              <TouchableOpacity 
                style={[styles.chatTypeOption, newChatType === 'individual' && styles.chatTypeOptionActive]}
                onPress={() => {
                  setNewChatType('individual');
                  setSelectedMembers([]);
                }}
              >
                <MessageCircle size={20} color={newChatType === 'individual' ? Colors.primary : Colors.textSecondary} />
                <Text style={[styles.chatTypeText, newChatType === 'individual' && styles.chatTypeTextActive]}>Individual</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.chatTypeOption, newChatType === 'group' && styles.chatTypeOptionActive]}
                onPress={() => {
                  setNewChatType('group');
                  setSelectedMembers([]);
                }}
              >
                <Users size={20} color={newChatType === 'group' ? Colors.primary : Colors.textSecondary} />
                <Text style={[styles.chatTypeText, newChatType === 'group' && styles.chatTypeTextActive]}>Group Chat</Text>
              </TouchableOpacity>
            </View>

            {/* Group Chat Name Input */}
            {newChatType === 'group' && (
              <View style={styles.groupNameSection}>
                <Text style={styles.sectionLabel}>Group Name</Text>
                <TextInput
                  style={styles.groupNameInput}
                  placeholder="Enter group name"
                  placeholderTextColor={Colors.textSecondary}
                  value={groupChatName}
                  onChangeText={setGroupChatName}
                />
              </View>
            )}

            {/* Member Selection */}
            <View style={styles.memberSelectionSection}>
              <Text style={styles.sectionLabel}>
                {newChatType === 'individual' ? 'Select Person' : `Select Members (${selectedMembers.length})`}
              </Text>
              
              <ScrollView style={styles.membersList} showsVerticalScrollIndicator={false}>
                {staff.filter((member: any) => member.id !== currentUser.id).map((member: any) => {
                  const isSelected = selectedMembers.includes(member.id);
                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={[styles.memberItem, isSelected && styles.memberItemSelected]}
                      onPress={() => {
                        if (newChatType === 'individual') {
                          setSelectedMembers([member.id]);
                        } else {
                          if (isSelected) {
                            setSelectedMembers(prev => prev.filter(id => id !== member.id));
                          } else {
                            setSelectedMembers(prev => [...prev, member.id]);
                          }
                        }
                      }}
                    >
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberInitials}>
                          {member.name.split(' ').map((n: string) => n[0]).join('')}
                        </Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={[styles.memberName, isSelected && styles.memberNameSelected]}>{member.name}</Text>
                        <Text style={[styles.memberTitle, isSelected && styles.memberTitleSelected]}>{member.title}</Text>
                      </View>
                      {isSelected && (
                        <View style={styles.selectedIcon}>
                          <UserCheck size={20} color={Colors.primary} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowNewChatModal(false);
                  setSelectedMembers([]);
                  setGroupChatName('');
                  setNewChatType('individual');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.createButton,
                  (selectedMembers.length === 0 || (newChatType === 'group' && (!groupChatName.trim() || selectedMembers.length < 2))) && styles.createButtonDisabled
                ]}
                onPress={() => {
                  if (newChatType === 'individual' && selectedMembers.length === 1) {
                    const chatId = createIndividualChat(selectedMembers[0]);
                    if (chatId) {
                      router.push(`/chat/${chatId}`);
                    }
                  } else if (newChatType === 'group' && selectedMembers.length >= 2 && groupChatName.trim()) {
                    // Create group chat
                    const newGroupChat = {
                      id: `group-${Date.now()}`,
                      type: 'group' as const,
                      name: groupChatName.trim(),
                      teamId: selectedTeamId === 'all' ? undefined : selectedTeamId,
                      participants: [currentUser.id, ...selectedMembers],
                      lastMessage: undefined,
                      unreadCount: 0,
                    };
                    
                    setChats(prev => [newGroupChat, ...prev]);
                    router.push(`/chat/${newGroupChat.id}`);
                    Alert.alert('Success', `Group chat "${groupChatName}" created successfully!`);
                  }
                  
                  setShowNewChatModal(false);
                  setSelectedMembers([]);
                  setGroupChatName('');
                  setNewChatType('individual');
                }}
                disabled={selectedMembers.length === 0 || (newChatType === 'group' && (!groupChatName.trim() || selectedMembers.length < 2))}
              >
                <Text style={[
                  styles.createButtonText,
                  (selectedMembers.length === 0 || (newChatType === 'group' && (!groupChatName.trim() || selectedMembers.length < 2))) && styles.createButtonTextDisabled
                ]}>
                  {newChatType === 'individual' ? 'Start Chat' : 'Create Group'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  teamSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  teamSelectorText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  directoryButton: {
    padding: 8,
  },
  directoryResults: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  directoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 8,
  },
  directoryTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  newChatText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  directoryScroll: {
    maxHeight: 300,
  },
  directoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 12,
  },
  directoryAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directoryInitials: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  directoryInfo: {
    flex: 1,
  },
  directoryName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  directoryTitleText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  chatsList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatInitials: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  chatTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chatMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  newChatModal: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  chatTypeSelector: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  chatTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  chatTypeOptionActive: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  chatTypeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  chatTypeTextActive: {
    color: Colors.primary,
  },
  groupNameSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  groupNameInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  memberSelectionSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  membersList: {
    flex: 1,
    maxHeight: 300,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  memberItemSelected: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInitials: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  memberNameSelected: {
    color: Colors.primary,
  },
  memberTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  memberTitleSelected: {
    color: Colors.primary + 'CC',
  },
  selectedIcon: {
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  createButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  createButtonTextDisabled: {
    color: Colors.background,
  },
});