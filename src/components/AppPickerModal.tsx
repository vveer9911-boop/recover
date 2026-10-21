import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, Feather } from '@expo/vector-icons';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { fonts } from '../theme';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../../App';

export interface AppItem {
  id: string;
  name: string;
  category: string;
  iconBg: string;
  renderIcon: () => React.ReactNode;
}

export function AppIcon({ id, size = 28 }: { id: string; size?: number }) {
  switch (id) {
    case 'Instagram':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Defs>
            <LinearGradient id={`igGrad_${size}`} x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0" stopColor="#FFDC80" />
              <Stop offset="0.3" stopColor="#F77737" />
              <Stop offset="0.6" stopColor="#F56040" />
              <Stop offset="0.8" stopColor="#E1306C" />
              <Stop offset="1" stopColor="#833AB4" />
            </LinearGradient>
          </Defs>
          <Rect width={28} height={28} rx={6} fill={`url(#igGrad_${size})`} />
          <Rect x={6} y={6} width={16} height={16} rx={4.5} fill="none" stroke="#FFFFFF" strokeWidth={1.7} />
          <Circle cx={14} cy={14} r={3.8} fill="none" stroke="#FFFFFF" strokeWidth={1.7} />
          <Circle cx={18.5} cy={9.5} r={1.1} fill="#FFFFFF" />
        </Svg>
      );
    case 'TikTok':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Rect width={28} height={28} rx={6} fill="#000000" />
          <Path
            d="M16.5 8 C17.3 9.4 18.7 10.4 20.4 10.6 V13.2 C18.8 13.1 17.5 12.4 16.5 11.5 V16.8 C16.5 19.4 14.4 21.5 11.8 21.5 C9.2 21.5 7.1 19.4 7.1 16.8 C7.1 14.2 9.2 12.1 11.8 12.1 C12.3 12.1 12.8 12.2 13.2 12.4 V15.1 C12.8 14.8 12.3 14.7 11.8 14.7 C10.6 14.7 9.7 15.6 9.7 16.8 C9.7 18 10.6 18.9 11.8 18.9 C13 18.9 14 17.9 14 16.7 V7 H16.5 Z"
            fill="#00F2FE"
            transform="translate(-0.8, -0.4)"
          />
          <Path
            d="M16.5 8 C17.3 9.4 18.7 10.4 20.4 10.6 V13.2 C18.8 13.1 17.5 12.4 16.5 11.5 V16.8 C16.5 19.4 14.4 21.5 11.8 21.5 C9.2 21.5 7.1 19.4 7.1 16.8 C7.1 14.2 9.2 12.1 11.8 12.1 C12.3 12.1 12.8 12.2 13.2 12.4 V15.1 C12.8 14.8 12.3 14.7 11.8 14.7 C10.6 14.7 9.7 15.6 9.7 16.8 C9.7 18 10.6 18.9 11.8 18.9 C13 18.9 14 17.9 14 16.7 V7 H16.5 Z"
            fill="#FE2C55"
            transform="translate(0.8, 0.4)"
          />
          <Path
            d="M16.5 8 C17.3 9.4 18.7 10.4 20.4 10.6 V13.2 C18.8 13.1 17.5 12.4 16.5 11.5 V16.8 C16.5 19.4 14.4 21.5 11.8 21.5 C9.2 21.5 7.1 19.4 7.1 16.8 C7.1 14.2 9.2 12.1 11.8 12.1 C12.3 12.1 12.8 12.2 13.2 12.4 V15.1 C12.8 14.8 12.3 14.7 11.8 14.7 C10.6 14.7 9.7 15.6 9.7 16.8 C9.7 18 10.6 18.9 11.8 18.9 C13 18.9 14 17.9 14 16.7 V7 H16.5 Z"
            fill="#FFFFFF"
          />
        </Svg>
      );
    case 'FaceTime':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Rect width={28} height={28} rx={6} fill="#34C759" />
          <Path d="M7 10 C7 8.9 7.9 8 9 8 H15 C16.1 8 17 8.9 17 10 V18 C17 19.1 16.1 20 15 20 H9 C7.9 20 7 19.1 7 18 Z" fill="#FFFFFF" />
          <Path d="M17.5 12.2 L21.2 9.5 C21.6 9.2 22.2 9.5 22.2 10 V18 C22.2 18.5 21.6 18.8 21.2 18.5 L17.5 15.8 Z" fill="#FFFFFF" />
        </Svg>
      );
    case 'Threads':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Rect width={28} height={28} rx={6} fill="#18181A" />
          <Path
            d="M14 6.5 C9.8 6.5 6.5 9.8 6.5 14 C6.5 18.2 9.8 21.5 14 21.5 C17.3 21.5 20.2 19.4 21.1 16.3 C21.3 15.7 20.9 15.2 20.3 15.2 C19.8 15.2 19.4 15.6 19.2 16.1 C18.5 18.4 16.4 20 14 20 C10.7 20 8 17.3 8 14 C8 10.7 10.7 8 14 8 C17.1 8 19.7 10.4 20 13.5 H14 C12.6 13.5 11.5 14.6 11.5 16 C11.5 17.4 12.6 18.5 14 18.5 C15.4 18.5 16.5 17.5 16.7 16.2 H18.2 C18 18.3 16.2 19.8 14 19.8 C11.9 19.8 10.2 18.1 10.2 16 C10.2 13.9 11.9 12.2 14 12.2 H20 C19.6 8.9 17.1 6.5 14 6.5 Z"
            fill="#FFFFFF"
          />
        </Svg>
      );
    case 'X':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Rect width={28} height={28} rx={6} fill="#000000" />
          <Path
            d="M18.8 6 H21.3 L15.8 12.3 L22.3 22 H17.2 L13.2 16.8 L8.6 22 H6.1 L11.9 15.3 L5.7 6 H10.9 L14.5 10.7 Z M17.9 20.5 H19.3 L10.2 7.4 H8.7 Z"
            fill="#FFFFFF"
          />
        </Svg>
      );
    case 'Facebook':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Rect width={28} height={28} rx={6} fill="#1877F2" />
          <Path
            d="M17.5 14.5 L18 11.2 H14.8 V9.1 C14.8 8.2 15.2 7.3 16.6 7.3 H18 V4.5 C17.7 4.5 16.6 4.4 15.5 4.4 C13.1 4.4 11.5 5.9 11.5 8.7 V11.2 H8.6 V14.5 H11.5 V22.5 H14.8 V14.5 Z"
            fill="#FFFFFF"
          />
        </Svg>
      );
    case 'Snapchat':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Rect width={28} height={28} rx={6} fill="#FFFC00" />
          <Path
            d="M14 6.5 C11.5 6.5 9.8 8.3 9.8 11 C9.8 12 10.2 12.8 10.2 13.5 C10.2 13.8 9.7 14.2 9.2 14.3 C8.6 14.4 8.5 14.8 8.5 15.1 C8.6 15.7 9.4 15.7 10 15.7 C10.4 16.3 9.4 17.5 8.6 18.2 C8.3 18.4 8.5 18.9 9 19 C10.2 19.2 11.4 18.4 12.5 18.4 C13 18.4 13.5 18.7 14 18.7 C14.5 18.7 15 18.4 15.5 18.4 C16.6 18.4 17.8 19.2 19 19 C19.5 18.9 19.7 18.4 19.4 18.2 C18.6 17.5 17.6 16.3 18 15.7 C18.6 15.7 19.4 15.7 19.5 15.1 C19.5 14.8 19.4 14.4 18.8 14.3 C18.3 14.2 17.8 13.8 17.8 13.5 C17.8 12.8 18.2 12 18.2 11 C18.2 8.3 16.5 6.5 14 6.5 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth={0.8}
          />
        </Svg>
      );
    case 'WhatsApp':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Rect width={28} height={28} rx={6} fill="#25D366" />
          <Path
            d="M14 6 C9.6 6 6 9.6 6 14 C6 15.5 6.4 16.9 7.2 18.1 L6 22 L10.1 20.9 C11.3 21.6 12.6 22 14 22 C18.4 22 22 18.4 22 14 C22 9.6 18.4 6 14 6 Z"
            fill="#FFFFFF"
          />
          <Path
            d="M17.3 16.1 C17.1 16.6 16.3 17 15.8 17.1 C15.4 17.1 14.9 17.1 13.4 16.5 C11.5 15.7 10.3 13.8 10.2 13.6 C10.1 13.5 9.4 12.6 9.4 11.6 C9.4 10.7 9.8 10.2 10 10 C10.2 9.8 10.4 9.8 10.6 9.8 H11.2 C11.4 9.8 11.6 9.9 11.6 10.3 L12.2 11.7 C12.3 11.9 12.2 12.1 12.1 12.2 L11.7 12.7 C11.6 12.8 11.5 12.9 11.6 13.1 C11.7 13.3 12.1 14 12.7 14.5 C13.5 15.2 14.1 15.4 14.3 15.5 C14.5 15.6 14.6 15.6 14.7 15.4 L15.2 14.8 C15.3 14.6 15.5 14.6 15.7 14.7 L17.1 15.4 C17.3 15.5 17.4 15.6 17.4 15.7 C17.4 15.8 17.4 15.9 17.3 16.1 Z"
            fill="#25D366"
          />
        </Svg>
      );
    case 'YouTube':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Rect width={28} height={28} rx={6} fill="#FF0000" />
          <Path
            d="M21.5 10.2 C21.3 9.4 20.6 8.7 19.8 8.5 C18.3 8.1 14 8.1 14 8.1 C14 8.1 9.7 8.1 8.2 8.5 C7.4 8.7 6.7 9.4 6.5 10.2 C6.1 11.7 6.1 14 6.1 14 C6.1 14 6.1 16.3 6.5 17.8 C6.7 18.6 7.4 19.3 8.2 19.5 C9.7 19.9 14 19.9 14 19.9 C14 19.9 18.3 19.9 19.8 19.5 C20.6 19.3 21.3 18.6 21.5 17.8 C21.9 16.3 21.9 14 21.9 14 C21.9 14 21.9 11.7 21.5 10.2 Z"
            fill="#FFFFFF"
          />
          <Path d="M12.4 16.3 L16.8 14 L12.4 11.7 Z" fill="#FF0000" />
        </Svg>
      );
    case 'Reddit':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Rect width={28} height={28} rx={6} fill="#FF4500" />
          <Circle cx={14} cy={14.5} r={6.5} fill="#FFFFFF" />
          <Circle cx={11.5} cy={13.8} r={1.2} fill="#FF4500" />
          <Circle cx={16.5} cy={13.8} r={1.2} fill="#FF4500" />
          <Path d="M11.8 16.5 C12.6 17.4 15.4 17.4 16.2 16.5" stroke="#FF4500" strokeWidth={1} fill="none" strokeLinecap="round" />
          <Circle cx={18.8} cy={9.5} r={1.2} fill="#FFFFFF" />
          <Path d="M14 10 L15.5 8 L18 9" stroke="#FFFFFF" strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'LinkedIn':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Rect width={28} height={28} rx={6} fill="#0A66C2" />
          <Rect x={7} y={10.5} width={2.8} height={8.5} fill="#FFFFFF" />
          <Circle cx={8.4} cy={8.4} r={1.6} fill="#FFFFFF" />
          <Path
            d="M12.2 10.5 H14.8 V11.7 C15.2 11 16.1 10.3 17.4 10.3 C20 10.3 20.6 11.9 20.6 14.3 V19 H17.8 V14.8 C17.8 13.7 17.5 12.8 16.4 12.8 C15.2 12.8 14.9 13.7 14.9 14.8 V19 H12.2 Z"
            fill="#FFFFFF"
          />
        </Svg>
      );
    case 'Messenger':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Defs>
            <LinearGradient id={`msgGrad_${size}`} x1="0" y1="1" x2="0.8" y2="0">
              <Stop offset="0" stopColor="#006AFF" />
              <Stop offset="0.5" stopColor="#00B2FF" />
              <Stop offset="1" stopColor="#A033FF" />
            </LinearGradient>
          </Defs>
          <Rect width={28} height={28} rx={6} fill={`url(#msgGrad_${size})`} />
          <Path
            d="M14 6 C9.6 6 6 9.3 6 13.5 C6 15.8 7.1 17.8 8.8 19.2 V21.8 L11.3 20.4 C12.2 20.7 13.1 20.8 14 20.8 C18.4 20.8 22 17.5 22 13.3 C22 9.1 18.4 6 14 6 Z"
            fill="#FFFFFF"
          />
          <Path d="M10 14.6 L12.8 11.7 L15.2 13.3 L18 11.7 L15.2 14.6 L12.8 13 Z" fill="#006AFF" />
        </Svg>
      );
    case 'Netflix':
      return (
        <Svg width={size} height={size} viewBox="0 0 28 28">
          <Rect width={28} height={28} rx={6} fill="#000000" />
          <Path d="M8.5 7.5 H11.2 V20.5 H8.5 Z" fill="#E50914" />
          <Path d="M16.8 7.5 H19.5 V20.5 H16.8 Z" fill="#E50914" />
          <Path d="M8.5 7.5 L17.5 20.5 H19.5 L10.5 7.5 Z" fill="#B81D24" />
        </Svg>
      );
    default:
      return null;
  }
}

export const DEVICE_APPS: AppItem[] = [
  { id: 'Instagram', name: 'Instagram', category: 'Social', iconBg: '#C13584', renderIcon: () => <AppIcon id="Instagram" size={28} /> },
  { id: 'TikTok', name: 'TikTok', category: 'Social', iconBg: '#000000', renderIcon: () => <AppIcon id="TikTok" size={28} /> },
  { id: 'FaceTime', name: 'FaceTime', category: 'Social', iconBg: '#34C759', renderIcon: () => <AppIcon id="FaceTime" size={28} /> },
  { id: 'Threads', name: 'Threads', category: 'Social', iconBg: '#000000', renderIcon: () => <AppIcon id="Threads" size={28} /> },
  { id: 'X', name: 'X', category: 'Social', iconBg: '#000000', renderIcon: () => <AppIcon id="X" size={28} /> },
  { id: 'Facebook', name: 'Facebook', category: 'Social', iconBg: '#1877F2', renderIcon: () => <AppIcon id="Facebook" size={28} /> },
  { id: 'Snapchat', name: 'Snapchat', category: 'Social', iconBg: '#FFFC00', renderIcon: () => <AppIcon id="Snapchat" size={28} /> },
  { id: 'WhatsApp', name: 'WhatsApp', category: 'Social', iconBg: '#25D366', renderIcon: () => <AppIcon id="WhatsApp" size={28} /> },
  { id: 'YouTube', name: 'YouTube', category: 'Social', iconBg: '#FF0000', renderIcon: () => <AppIcon id="YouTube" size={28} /> },
  { id: 'Reddit', name: 'Reddit', category: 'Social', iconBg: '#FF4500', renderIcon: () => <AppIcon id="Reddit" size={28} /> },
  { id: 'LinkedIn', name: 'LinkedIn', category: 'Social', iconBg: '#0A66C2', renderIcon: () => <AppIcon id="LinkedIn" size={28} /> },
  { id: 'Messenger', name: 'Messenger', category: 'Social', iconBg: '#00B2FF', renderIcon: () => <AppIcon id="Messenger" size={28} /> },
  { id: 'Netflix', name: 'Netflix', category: 'Entertainment', iconBg: '#000000', renderIcon: () => <AppIcon id="Netflix" size={28} /> },
];

interface AppPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (selected: string[]) => void;
}

export default function AppPickerModal({ visible, onClose, onSave }: AppPickerModalProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { distractingApps, setDistractingApps, isPlus } = useApp();

  const [selected, setSelected] = useState<string[]>(() => {
    const initial = distractingApps && distractingApps.length > 0 ? distractingApps : ['YouTube', 'Instagram', 'TikTok'];
    return !isPlus && initial.length > 3 ? initial.slice(0, 3) : initial;
  });
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [prevVisible, setPrevVisible] = useState(visible);

  if (prevVisible !== visible) {
    setPrevVisible(visible);
    if (visible) {
      const initial = distractingApps && distractingApps.length > 0 ? distractingApps : ['YouTube', 'Instagram', 'TikTok'];
      const clamped = !isPlus && initial.length > 3 ? initial.slice(0, 3) : initial;
      setSelected(clamped);
      setShowLimitPopup(false);
    }
  }

  const isAllSelected = selected.length === DEVICE_APPS.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelected([]);
    } else {
      if (!isPlus) {
        setShowLimitPopup(true);
        return;
      }
      setSelected(DEVICE_APPS.map((a) => a.id));
    }
  };

  const toggleApp = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (!isPlus && prev.length >= 3) {
          setShowLimitPopup(true);
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleUpgradeFromPopup = () => {
    setShowLimitPopup(false);
    onClose();
    navigation.navigate('Pricing');
  };

  const handleContinue = () => {
    setDistractingApps(selected);
    if (onSave) onSave(selected);
    onClose();
  };

  const socialCount = selected.filter((s) => {
    const app = DEVICE_APPS.find((a) => a.id === s);
    return app?.category === 'Social';
  }).length;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top + 6 }]}>
        {/* Top Header Bar matching reference image */}
        <View style={styles.header}>
          <View style={styles.headerLeftIconRow}>
            <Ionicons name="apps-outline" size={19} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.headerTitle}>Distracting Apps</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
            onPress={onClose}
            hitSlop={14}
          >
            <Ionicons name="close" size={19} color="#FFFFFF" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 85 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Card Container */}
          <View style={styles.cardBox}>
            {/* 1. All Apps & Categories Row */}
            <Pressable
              style={({ pressed }) => [styles.rowItem, pressed && { opacity: 0.8 }]}
              onPress={toggleAll}
            >
              <View
                style={[
                  styles.checkCircle,
                  isAllSelected && styles.checkCircleSelected,
                ]}
              >
                {isAllSelected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
              </View>

              {/* Colorful Layers Icon */}
              <View style={styles.appIconWrap}>
                <Svg width={28} height={28} viewBox="0 0 28 28">
                  <Rect width={28} height={28} rx={6} fill="#27272A" />
                  <Path d="M7 11 L14 7 L21 11 L14 15 Z" fill="#38BDF8" />
                  <Path d="M7 14 L14 18 L21 14" stroke="#F43F5E" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M7 17.5 L14 21.5 L21 17.5" stroke="#FBBF24" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>

              <Text style={styles.rowTitleBold}>All Apps & Categories</Text>
            </Pressable>

            <View style={styles.divider} />

            {/* 2. Social Category Group */}
            <View style={styles.categoryRowItem}>
              <View
                style={[
                  styles.checkCircle,
                  socialCount > 0 && styles.checkCircleSelected,
                ]}
              >
                {socialCount > 0 && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
              </View>

              {/* Heart speech bubble icon */}
              <View style={styles.appIconWrap}>
                <Svg width={28} height={28} viewBox="0 0 28 28">
                  <Rect width={28} height={28} rx={6} fill="#27272A" />
                  <Path
                    d="M14 8 C10.7 8 8 10.4 8 13.4 C8 15.2 8.9 16.8 10.3 17.7 L9.8 20.3 L12.5 19.3 C13 19.4 13.5 19.5 14 19.5 C17.3 19.5 20 17.1 20 13.4 C20 10.4 17.3 8 14 8 Z"
                    fill="#EC4899"
                  />
                  <Path
                    d="M14 11.5 C13 10.3 11.4 10.8 11.4 12 C11.4 13.2 14 15 14 15 C14 15 16.6 13.2 16.6 12 C16.6 10.8 15 10.3 14 11.5 Z"
                    fill="#FFFFFF"
                  />
                </Svg>
              </View>

              <Text style={styles.rowTitleBold}>Social</Text>

              <View style={{ flex: 1 }} />
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{socialCount}</Text>
                <Feather name="chevron-down" size={13} color="#A1A1AA" style={{ marginLeft: 3 }} />
              </View>
            </View>

            <View style={styles.divider} />

            {/* 3. Individual Apps */}
            {DEVICE_APPS.map((app, index) => {
              const isSelected = selected.includes(app.id);

              return (
                <View key={app.id}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.rowItem,
                      isSelected && styles.rowItemSelectedGlass,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => toggleApp(app.id)}
                  >
                    <View
                      style={[
                        styles.checkCircle,
                        isSelected && styles.checkCircleSelected,
                      ]}
                    >
                      {isSelected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                    </View>

                    <View style={styles.appIconWrap}>
                      {app.renderIcon()}
                    </View>

                    <Text style={[styles.rowTitle, isSelected && styles.rowTitleSelected]}>
                      {app.name}
                    </Text>
                  </Pressable>
                  {index < DEVICE_APPS.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Fixed Bottom Continue Button */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 16) + 10 },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.continueBtn,
              pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
            ]}
            onPress={handleContinue}
          >
            <Text style={styles.continueBtnText}>
              Continue {selected.length > 0 ? `(${selected.length} selected)` : ''}
            </Text>
          </Pressable>
        </View>

        {/* 3 App Block Limit Alert Modal (Apple permission-style dialog) */}
        <Modal
          visible={showLimitPopup}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLimitPopup(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.alertCard}>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>3 App Block for Free Users</Text>
                <Text style={styles.alertReason}>
                  Free users can block up to 3 apps. Upgrade to Pro for more app blocks and unlimited protection.
                </Text>
              </View>

              {/* Bottom Button Row */}
              <View style={styles.alertBtnRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.alertBtn,
                    pressed && { backgroundColor: '#E5E5EA' },
                  ]}
                  onPress={() => setShowLimitPopup(false)}
                >
                  <Text style={styles.alertCancelText}>Cancel</Text>
                </Pressable>

                <View style={styles.alertDividerV} />

                <Pressable
                  style={({ pressed }) => [
                    styles.alertBtn,
                    pressed && { backgroundColor: '#E5E5EA' },
                  ]}
                  onPress={handleUpgradeFromPopup}
                >
                  <Text style={styles.alertUpgradeText}>Upgrade to Pro</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  alertCard: {
    width: '100%',
    maxWidth: 290,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },
  alertContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 18,
    alignItems: 'center',
  },
  alertTitle: {
    fontFamily: fonts.bold,
    fontSize: 16.5,
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  alertReason: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#3C3C43',
    textAlign: 'center',
    lineHeight: 18,
  },
  alertBtnRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C6C6C8',
    height: 44,
  },
  alertBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertDividerV: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
  },
  alertCancelText: {
    fontFamily: fonts.regular,
    fontSize: 16.5,
    color: '#007AFF',
  },
  alertUpgradeText: {
    fontFamily: fonts.bold,
    fontSize: 16.5,
    color: '#007AFF',
  },
  root: {
    flex: 1,
    backgroundColor: '#0A0A0E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerLeftIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cardBox: {
    backgroundColor: '#16161A',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowItemSelectedGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  categoryRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#52525B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkCircleSelected: {
    backgroundColor: '#0062FF',
    borderColor: '#0062FF',
  },
  appIconWrap: {
    marginRight: 14,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  rowTitle: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: '#E4E4E7',
  },
  rowTitleBold: {
    fontFamily: fonts.semibold,
    fontSize: 15.5,
    color: '#FFFFFF',
  },
  rowTitleSelected: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countBadgeText: {
    color: '#A1A1AA',
    fontFamily: fonts.medium,
    fontSize: 12.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 52,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: 'rgba(10, 10, 14, 0.94)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  continueBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: '#000000',
    letterSpacing: -0.2,
  },
});
