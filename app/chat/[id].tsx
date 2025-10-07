import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Send, Paperclip } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAppStore } from '@/hooks/use-app-store';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { currentUser, staff, chats } = useAppStore();
  const [message, setMessage] = useState('');
  
  // Get different messages based on chat ID
  const getChatMessages = (chatId: string) => {
    const chatMessages: { [key: string]: any[] } = {
      'c1': [ // Marketing Team group chat
        {
          id: '1',
          senderId: '5',
          text: "I'll handle the social media for tomorrow's game",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          senderId: '1',
          text: 'Great! Make sure to capture the pre-game activities too',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: '3',
          senderId: '4',
          text: 'I can help with the fan engagement booth setup',
          timestamp: new Date(Date.now() - 900000).toISOString(),
        },
      ],
      'individual-4': [ // Charlotte Waters
        {
          id: '1',
          senderId: '4',
          text: 'Thanks for updating the schedule! See you at the volleyball game tomorrow.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          senderId: '1',
          text: 'No problem! Looking forward to working with you on the event.',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: '3',
          senderId: '4',
          text: 'Should I bring the camera equipment for photos?',
          timestamp: new Date(Date.now() - 900000).toISOString(),
        },
      ],
      'individual-5': [ // Shanzay Khan
        {
          id: '1',
          senderId: '1',
          text: 'Great job on the social media posts for the last event!',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: '2',
          senderId: '5',
          text: 'Thank you! The engagement was really good this time.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          senderId: '1',
          text: 'Definitely! Keep up the excellent work.',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
      'individual-3': [ // Sam Gilla
        {
          id: '1',
          senderId: '3',
          text: 'I can cover the extra shift on Friday if needed.',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
        },
        {
          id: '2',
          senderId: '1',
          text: 'That would be great! We really need the extra help.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: '3',
          senderId: '3',
          text: 'Perfect, I\'ll mark myself as available for that shift.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      'individual-9': [ // Martin Manriquez
        {
          id: '1',
          senderId: '9',
          text: 'The equipment is all set up for tomorrow\'s game. Ready to go!',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
        },
        {
          id: '2',
          senderId: '1',
          text: 'Awesome! Thanks for getting everything prepared early.',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
        },
        {
          id: '3',
          senderId: '9',
          text: 'No problem! I also checked all the audio equipment.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
      'individual-7': [ // Edie Wortzman
        {
          id: '1',
          senderId: '1',
          text: 'Can you help with the fan engagement activities this weekend?',
          timestamp: new Date(Date.now() - 18000000).toISOString(),
        },
        {
          id: '2',
          senderId: '7',
          text: 'Absolutely! What activities are we planning?',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
        },
        {
          id: '3',
          senderId: '1',
          text: 'We\'re doing face painting, photo booth, and some games.',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
        },
      ],
    };
    
    return chatMessages[chatId] || [
      {
        id: '1',
        senderId: currentUser.id === '1' ? '4' : '1',
        text: 'Hey! How are you doing?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '2',
        senderId: currentUser.id,
        text: 'Good! Just checking in about the upcoming shifts.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
    ];
  };
  
  const [messages, setMessages] = useState(() => getChatMessages(id as string));

  const getSenderName = (senderId: string) => {
    if (senderId === currentUser.id) return 'You';
    const sender = staff.find((s: any) => s.id === senderId);
    return sender?.name || 'Unknown';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        text: message.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map(msg => {
          const isOwn = msg.senderId === currentUser.id;
          return (
            <View 
              key={msg.id} 
              style={[styles.messageRow, isOwn && styles.messageRowOwn]}
            >
              {!isOwn && (
                <View style={styles.senderAvatar}>
                  <Text style={styles.senderInitials}>
                    {getSenderName(msg.senderId).split(' ').map((n: string) => n[0]).join('')}
                  </Text>
                </View>
              )}
              <View style={[styles.messageBubble, isOwn && styles.messageBubbleOwn]}>
                {!isOwn && (
                  <Text style={styles.senderName}>{getSenderName(msg.senderId)}</Text>
                )}
                <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
                  {msg.text}
                </Text>
                <Text style={[styles.messageTime, isOwn && styles.messageTimeOwn]}>
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Paperclip size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <Send size={20} color={message.trim() ? '#fff' : Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  senderInitials: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
  },
  messageBubbleOwn: {
    backgroundColor: Colors.primary,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: Colors.text,
  },
  messageTextOwn: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  messageTimeOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    maxHeight: 100,
    fontSize: 15,
    color: Colors.text,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surface,
  },
});