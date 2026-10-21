import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../theme';
import { useApp } from '../context/AppContext';

export const AVATAR_PRESETS = [
  { id: 0, bg: '#38BDF8', emoji: '🧔‍♂️', name: 'Original' },
  { id: 1, bg: '#F97316', emoji: '⚡', name: 'Flame' },
  { id: 2, bg: '#8B5CF6', emoji: '👑', name: 'Crown' },
  { id: 3, bg: '#71717A', emoji: '🛡️', name: 'Shield' },
  { id: 4, bg: '#EC4899', emoji: '✨', name: 'Spark' },
  { id: 5, bg: '#EAB308', emoji: '🏆', name: 'Trophy' },
];

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const insets = useSafeAreaInsets();
  const {
    userName,
    setUserName,
    userBio,
    setUserBio,
    userHandle,
    setUserHandle,
    userAvatarIndex,
    setUserAvatarIndex,
  } = useApp();

  const [name, setName] = useState(userName || '');
  const [handle, setHandle] = useState(userHandle || '');
  const [bio, setBio] = useState(userBio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(userAvatarIndex || 0);
  const [prevVisible, setPrevVisible] = useState(visible);

  if (prevVisible !== visible) {
    setPrevVisible(visible);
    if (visible) {
      setName(userName || '');
      setHandle(userHandle || '');
      setBio(userBio || '');
      setSelectedAvatar(userAvatarIndex || 0);
    }
  }

  const handleSave = () => {
    if (name.trim()) setUserName(name.trim());
    if (handle.trim()) setUserHandle(handle.trim().replace(/^@/, ''));
    setUserBio(bio.trim());
    setUserAvatarIndex(selectedAvatar);
    onClose();
  };

  const currentPreset = AVATAR_PRESETS[selectedAvatar] || AVATAR_PRESETS[0];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
              onPress={onClose}
              hitSlop={12}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Text style={styles.headerTitle}>Edit Profile</Text>

            <Pressable
              style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.7 }]}
              onPress={handleSave}
              hitSlop={12}
            >
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={[styles.avatarCircle, { backgroundColor: currentPreset.bg }]}>
                <Text style={styles.avatarEmoji}>{currentPreset.emoji}</Text>
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.avatarHint}>Choose profile avatar</Text>

              {/* Avatar Preset Selector */}
              <View style={styles.presetsRow}>
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = selectedAvatar === preset.id;
                  return (
                    <Pressable
                      key={preset.id}
                      style={[
                        styles.presetCircle,
                        { backgroundColor: preset.bg },
                        isSelected && styles.presetCircleSelected,
                      ]}
                      onPress={() => setSelectedAvatar(preset.id)}
                    >
                      <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                      {isSelected && (
                        <View style={styles.selectedCheck}>
                          <Ionicons name="checkmark" size={10} color="#000000" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Input Fields */}
            <View style={styles.formCard}>
              {/* Display Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#71717A"
                  maxLength={30}
                />
              </View>

              <View style={styles.divider} />

              {/* Bio / Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio / Description</Text>
                <TextInput
                  style={[styles.textInput, styles.bioInput]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell others what you are focusing on..."
                  placeholderTextColor="#71717A"
                  multiline
                  numberOfLines={3}
                  maxLength={120}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  root: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#242428',
  },
  cancelBtn: {
    padding: 4,
  },
  cancelText: {
    color: '#A1A1AA',
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  saveText: {
    color: '#000000',
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#3F3F46',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#18181B',
    borderWidth: 1.5,
    borderColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 12.5,
    marginBottom: 12,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  presetCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  presetCircleSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },
  presetEmoji: {
    fontSize: 17,
  },
  selectedCheck: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: '#161618',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#242428',
  },
  inputGroup: {
    paddingVertical: 10,
  },
  inputLabel: {
    color: '#71717A',
    fontFamily: fonts.medium,
    fontSize: 12,
    marginBottom: 6,
  },
  textInput: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 15,
    padding: 0,
  },
  handleInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  atSymbol: {
    color: '#71717A',
    fontFamily: fonts.semibold,
    fontSize: 15,
    marginRight: 2,
  },
  bioInput: {
    fontFamily: fonts.regular,
    lineHeight: 20,
    height: 60,
    textAlignVertical: 'top',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#242428',
  },
});
