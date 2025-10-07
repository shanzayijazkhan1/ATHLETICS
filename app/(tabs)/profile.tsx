import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Image,

} from 'react-native';

import { User, Mail, Phone, Building, Calendar, Shield, ChevronRight, LogOut, Users, X, Edit3, Save, Camera, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import { useAppStore } from '@/hooks/use-app-store';

export default function ProfileScreen() {

  const { currentUser, teams, selectedTeamId, switchTeam, updateProfile, isLoading } = useAppStore();
  const [showTeamModal, setShowTeamModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<{ email: string; phone: string; profileImage?: string }>({ 
    email: currentUser.email, 
    phone: currentUser.phone || '',
    profileImage: currentUser.profileImage
  });
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'manager':
        return { text: 'Full Access', color: Colors.success };
      case 'sub-manager':
        return { text: 'Team Lead', color: Colors.warning };
      case 'employee':
        return { text: 'Team Member', color: Colors.primary };
      default:
        return { text: 'Unknown', color: Colors.textSecondary };
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleSaveProfile = () => {
    if (!editForm.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    
    if (!editForm.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    updateProfile({
      email: editForm.email.trim(),
      phone: editForm.phone.trim() || undefined,
      profileImage: editForm.profileImage,
    });
    
    setShowEditModal(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const openEditModal = () => {
    setEditForm({ 
      email: currentUser.email, 
      phone: currentUser.phone || '',
      profileImage: currentUser.profileImage
    });
    setShowEditModal(true);
  };

  const handleImagePicker = async (source: 'camera' | 'library') => {
    try {
      let result;
      
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Photo library permission is required to select photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setEditForm(prev => ({ ...prev, profileImage: result.assets[0].uri }));
        setShowImagePicker(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const removeProfileImage = () => {
    setEditForm(prev => ({ ...prev, profileImage: undefined }));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const roleBadge = getRoleBadge(currentUser.role);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileButton} onPress={openEditModal}>
          <View style={styles.profileAvatar}>
            {currentUser.profileImage ? (
              <Image 
                source={{ uri: currentUser.profileImage }} 
                style={styles.profileAvatarImage}
                onError={(error) => {
                  console.log('Profile image load error:', error.nativeEvent.error);
                }}
              />
            ) : (
              <User size={24} color="#fff" />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.avatarLarge} onPress={openEditModal}>
          {currentUser.profileImage ? (
            <Image source={{ uri: currentUser.profileImage }} style={styles.avatarLargeImage} />
          ) : (
            <User size={40} color="#fff" />
          )}
          <View style={styles.avatarEditOverlay}>
            <Camera size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{currentUser.name}</Text>
        <Text style={styles.email}>{currentUser.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleBadge.color + '20' }]}>
          <Shield size={16} color={roleBadge.color} />
          <Text style={[styles.roleBadgeText, { color: roleBadge.color }]}>
            {roleBadge.text}
          </Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
          <Edit3 size={16} color={Colors.primary} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <TouchableOpacity style={styles.infoRow} onPress={openEditModal}>
          <View style={styles.infoIcon}>
            <Mail size={18} color={Colors.textSecondary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{currentUser.email}</Text>
          </View>
          <ChevronRight size={16} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoRow} onPress={openEditModal}>
          <View style={styles.infoIcon}>
            <Phone size={18} color={Colors.textSecondary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{currentUser.phone || 'Not provided'}</Text>
          </View>
          <ChevronRight size={16} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Building size={18} color={Colors.textSecondary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Department</Text>
            <Text style={styles.infoValue}>{currentUser.department}</Text>
          </View>
        </View>

        {currentUser.startDate && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Calendar size={18} color={Colors.textSecondary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Start Date</Text>
              <Text style={styles.infoValue}>{formatDate(currentUser.startDate)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Current Team */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Team</Text>
        <TouchableOpacity 
          style={styles.teamCard}
          onPress={() => setShowTeamModal(true)}
        >
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>
              {teams.find((t: any) => t.id === selectedTeamId)?.name || 'No Team Selected'}
            </Text>
            <Text style={styles.teamDescription}>
              {teams.find((t: any) => t.id === selectedTeamId)?.description || 'Select a team'}
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Team Selection Modal */}
      <Modal
        visible={showTeamModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTeamModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Team</Text>
              <TouchableOpacity 
                onPress={() => setShowTeamModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.teamsList}>
              {teams.map((team: any) => {
                const isSelected = team.id === selectedTeamId;
                return (
                  <TouchableOpacity
                    key={team.id}
                    style={[
                      styles.teamOption,
                      isSelected && styles.teamOptionSelected
                    ]}
                    onPress={() => {
                      switchTeam(team.id);
                      setShowTeamModal(false);
                    }}
                  >
                    <View style={[
                      styles.teamIcon,
                      { backgroundColor: team.color || Colors.primary }
                    ]}>
                      <Users size={20} color="#fff" />
                    </View>
                    <View style={styles.teamOptionInfo}>
                      <Text style={[
                        styles.teamOptionName,
                        isSelected && styles.teamOptionNameSelected
                      ]}>
                        {team.name}
                      </Text>
                      <Text style={[
                        styles.teamOptionDescription,
                        isSelected && styles.teamOptionDescriptionSelected
                      ]}>
                        {team.description}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <View style={styles.selectedDot} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity 
                onPress={() => setShowEditModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.editForm}>
              {/* Profile Picture Section */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Profile Picture</Text>
                <View style={styles.profileImageSection}>
                  <TouchableOpacity 
                    style={styles.profileImageContainer}
                    onPress={() => setShowImagePicker(true)}
                  >
                    {editForm.profileImage ? (
                      <Image source={{ uri: editForm.profileImage }} style={styles.profileImagePreview} />
                    ) : (
                      <View style={styles.profileImagePlaceholder}>
                        <User size={32} color={Colors.textSecondary} />
                      </View>
                    )}
                    <View style={styles.profileImageOverlay}>
                      <Camera size={16} color="#fff" />
                    </View>
                  </TouchableOpacity>
                  <View style={styles.profileImageActions}>
                    <TouchableOpacity 
                      style={styles.imageActionButton}
                      onPress={() => setShowImagePicker(true)}
                    >
                      <Upload size={16} color={Colors.primary} />
                      <Text style={styles.imageActionText}>Change Photo</Text>
                    </TouchableOpacity>
                    {editForm.profileImage && (
                      <TouchableOpacity 
                        style={[styles.imageActionButton, styles.removeButton]}
                        onPress={removeProfileImage}
                      >
                        <X size={16} color={Colors.error} />
                        <Text style={[styles.imageActionText, { color: Colors.error }]}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email Address *</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.formNote}>
                <Text style={styles.formNoteText}>
                  * Required field
                </Text>
                <Text style={styles.formNoteText}>
                  Note: Only email and phone number can be updated. Other information is managed by your administrator.
                </Text>
              </View>
            </ScrollView>
            
            <View style={styles.editModalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Save size={16} color="#fff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.imagePickerModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Photo</Text>
              <TouchableOpacity 
                onPress={() => setShowImagePicker(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.imagePickerOptions}>
              <TouchableOpacity 
                style={styles.imagePickerOption}
                onPress={() => handleImagePicker('camera')}
              >
                <View style={styles.imagePickerIcon}>
                  <Camera size={24} color={Colors.primary} />
                </View>
                <Text style={styles.imagePickerText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.imagePickerOption}
                onPress={() => handleImagePicker('library')}
              >
                <View style={styles.imagePickerIcon}>
                  <Upload size={24} color={Colors.primary} />
                </View>
                <Text style={styles.imagePickerText}>Choose from Library</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarLargeImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  name: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '10',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.error + '30',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  teamsList: {
    padding: 16,
  },
  teamOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  teamOptionSelected: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  teamIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  teamOptionInfo: {
    flex: 1,
  },
  teamOptionName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  teamOptionNameSelected: {
    color: Colors.primary,
  },
  teamOptionDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  teamOptionDescriptionSelected: {
    color: Colors.primary + 'CC',
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  editModalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  editForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formNote: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  formNoteText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  editModalActions: {
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
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImagePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  profileImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  profileImageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  removeButton: {
    backgroundColor: Colors.error + '10',
    borderColor: Colors.error + '30',
  },
  imageActionText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  imagePickerModal: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  imagePickerOptions: {
    padding: 20,
    gap: 16,
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  imagePickerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});