import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  PanResponder,
  Dimensions,
  Platform,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle, Path } from 'react-native-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { Accelerometer } from 'expo-sensors';
import { RootStackParamList } from '../../App';
import { useApp } from '../context/AppContext';
import { RecoverBlocker } from '../services/recoverBlocker';
import FocusCard from '../components/FocusCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DIAL_SIZE = Math.min(SCREEN_WIDTH - 80, 280);
const DIAL_RADIUS = (DIAL_SIZE - 32) / 2;
const CENTER_X = DIAL_SIZE / 2;
const CENTER_Y = DIAL_SIZE / 2;
const STROKE_WIDTH = 14;
const KNOB_RADIUS = 11;

const MIN_MINUTES = 5;
const MAX_MINUTES = 120;
const STEP_MINUTES = 5;

// Convert polar angle to cartesian coordinates
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

// Generate SVG arc path from startAngle to endAngle
const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const clampedEnd = endAngle >= 359.9 ? 359.9 : Math.max(startAngle + 0.1, endAngle);
  const start = polarToCartesian(x, y, radius, clampedEnd);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = clampedEnd - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
};

type ScreenStage =
  | 'setup'          // Step 1: Dial timer
  | 'ar_placement'   // Stage 2: Camera open with draggable 3D box
  | 'locking_in'     // Stage 3: Blue circular loading "Locked in"
  | 'active_session' // Stage 4: Live focus session with timer & card
  | 'motion_warning' // Stage 5: Phone lifted alarm & 30s countdown
  | 'strike_screen'  // Stage 5b: Red Strike screen (1/3, 2/3, 3/3)
  | 'session_summary'; // Stage 6: Prorated finish summary

export default function FocusSessionSetupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    credits,
    setCredits,
    distractingApps,
    saveFocusSession,
  } = useApp();

  const [stage, setStage] = useState<ScreenStage>('setup');
  const [minutes, setMinutes] = useState<number>(20);
  const [showApplePrompt, setShowApplePrompt] = useState<boolean>(false);

  // AR Box placement coordinates & scale
  const [boxPos, setBoxPos] = useState({ x: SCREEN_WIDTH / 2 - 80, y: SCREEN_HEIGHT / 2 - 160 });
  const [boxScale, setBoxScale] = useState<number>(1.0);

  // Loading animation (Locked In)
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Active Session state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showPauseMenu, setShowPauseMenu] = useState<boolean>(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState<boolean>(false);

  // Motion Detection & Strikes
  const [strikes, setStrikes] = useState<number>(0);
  const [warningSeconds, setWarningSeconds] = useState<number>(30);
  const soundRef = useRef<Audio.Sound | null>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // Load and unload alarm sound
  useEffect(() => {
    let soundObj: Audio.Sound | null = null;
    Audio.Sound.createAsync(
      require('../../assets/alarm.mp3'),
      { shouldPlay: false, isLooping: true, volume: 1.0 }
    )
      .then(({ sound }) => {
        soundObj = sound;
        soundRef.current = sound;
      })
      .catch((err) => {
        console.warn('Could not load alarm sound:', err);
      });

    return () => {
      if (soundObj) {
        soundObj.stopAsync().catch(() => {});
        soundObj.unloadAsync().catch(() => {});
      }
    };
  }, []);

  // Alarm sound controller
  const startAlarm = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }
    } catch (e) {
      console.warn('Failed to play alarm:', e);
    }
  };

  const stopAlarm = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
      }
    } catch (e) {
      console.warn('Failed to stop alarm:', e);
    }
  };

  // Timer Dial setup pan responder
  const sweepAngle = (minutes / MAX_MINUTES) * 360;
  const knobPos = polarToCartesian(CENTER_X, CENTER_Y, DIAL_RADIUS, sweepAngle);

  const updateMinutesFromPoint = (x: number, y: number) => {
    const dx = x - CENTER_X;
    const dy = y - CENTER_Y;
    let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angleDeg < 0) angleDeg += 360;

    const rawMinutes = (angleDeg / 360) * MAX_MINUTES;
    const stepped = Math.round(rawMinutes / STEP_MINUTES) * STEP_MINUTES;
    const clamped = Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, stepped === 0 ? MIN_MINUTES : stepped));
    setMinutes(clamped);
  };

  const dialPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          updateMinutesFromPoint(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        },
        onPanResponderMove: (evt) => {
          updateMinutesFromPoint(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        },
      }),
    []
  );

  // AR Box Pan Responder (Drag 3D box anywhere)
  const arPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
          setBoxPos((prev) => ({
            x: Math.max(20, Math.min(SCREEN_WIDTH - 180, prev.x + gestureState.dx * 0.2)),
            y: Math.max(80, Math.min(SCREEN_HEIGHT - 320, prev.y + gestureState.dy * 0.2)),
          }));
          // As box moves towards the lower area of screen, smoothly scale up to simulate descending closer
          const relativeY = Math.max(0, (gestureState.moveY - 100) / (SCREEN_HEIGHT - 200));
          setBoxScale(1.0 + relativeY * 0.55);
        },
      }),
    []
  );

  // Handle Next Step -> Apple Permission prompt
  const handleNextStepPress = () => {
    if (cameraPermission?.granted) {
      setStage('ar_placement');
    } else {
      setShowApplePrompt(true);
    }
  };

  const handleAllowCamera = async () => {
    setShowApplePrompt(false);
    try {
      if (Platform.OS === 'web') {
        setStage('ar_placement');
        return;
      }
      const res = await requestCameraPermission();
      if (res.granted) {
        setStage('ar_placement');
      } else {
        setStage('ar_placement');
      }
    } catch {
      setStage('ar_placement');
    }
  };

  // Trigger "Locked In" loading animation
  const handlePlacePhoneDown = () => {
    setStage('locking_in');
    setLoadingProgress(0);
  };

  // Animate loading ring during "locking_in"
  useEffect(() => {
    if (stage !== 'locking_in') return;
    let current = 0;
    const interval = setInterval(() => {
      current += 0.05;
      if (current >= 1) {
        clearInterval(interval);
        setLoadingProgress(1);
        setTimeout(() => {
          setSecondsRemaining(minutes * 60);
          setElapsedSeconds(0);
          setStage('active_session');
        }, 400);
      } else {
        setLoadingProgress(current);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [stage, minutes]);

  // Complete / Finish Session
  const handleFinishSession = useCallback(
    async (earnedMinutes: number) => {
      await RecoverBlocker.stopFocusSession();
      const earnedCredits = Math.max(1, Math.round(earnedMinutes));
      const now = Date.now();
      await saveFocusSession({
        id: `session-${now}`,
        startTime: now - earnedMinutes * 60 * 1000,
        endTime: now,
        targetDurationMinutes: minutes,
        focusedDurationMinutes: earnedMinutes,
        status: earnedMinutes >= minutes ? 'completed' : 'abandoned',
        creditsEarned: earnedCredits,
      });
      setCredits((prev) => prev + earnedCredits);
      setStage('session_summary');
    },
    [minutes, saveFocusSession, setCredits]
  );

  // Active Focus Session Countdown & Native App Blocker
  useEffect(() => {
    if (stage !== 'active_session' || isPaused) {
      if (stage !== 'active_session' && stage !== 'motion_warning') {
        RecoverBlocker.stopFocusSession();
      }
      return;
    }

    // Start native blocking engine on active session
    RecoverBlocker.startFocusSession(minutes, distractingApps);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishSession(minutes);
          return 0;
        }
        return prev - 1;
      });
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [stage, isPaused, minutes, distractingApps, handleFinishSession]);

  // Trigger motion alarm
  const triggerMotionWarning = useCallback(() => {
    setWarningSeconds(30);
    setStage('motion_warning');
  }, []);

  // Accelerometer motion detector when active
  useEffect(() => {
    if (stage !== 'active_session' || isPaused) return;

    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let initialized = false;

    Accelerometer.setUpdateInterval(400);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      if (!initialized) {
        lastX = x;
        lastY = y;
        lastZ = z;
        initialized = true;
        return;
      }
      const delta = Math.sqrt(
        Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2) + Math.pow(z - lastZ, 2)
      );
      lastX = x;
      lastY = y;
      lastZ = z;

      // Sensitive delta threshold for lifting or moving the phone
      if (delta > 0.45) {
        triggerMotionWarning();
      }
    });

    return () => {
      subscription && subscription.remove();
    };
  }, [stage, isPaused, triggerMotionWarning]);

  // Motion Warning 30s Countdown & Siren Alarm
  useEffect(() => {
    if (stage !== 'motion_warning') {
      stopAlarm();
      return;
    }

    startAlarm();

    const warnInterval = setInterval(() => {
      setWarningSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(warnInterval);
          stopAlarm();
          setStrikes((currStrikes) => currStrikes + 1);
          setStage('strike_screen');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(warnInterval);
      stopAlarm();
    };
  }, [stage]);

  // Put phone back down -> resume
  const handlePutPhoneDown = () => {
    stopAlarm();
    setStage('active_session');
  };

  // Restart session after 3 strikes
  const handleRestartSession = () => {
    RecoverBlocker.stopFocusSession();
    setStrikes(0);
    setStage('setup');
  };

  // Unmount cleanup for native blocker
  useEffect(() => {
    return () => {
      RecoverBlocker.stopFocusSession();
    };
  }, []);

  // Format seconds to H:MM:SS or MM:SS
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // ==========================================
  // RENDER: STAGE 1 (SETUP TIMER DIAL)
  // ==========================================
  if (stage === 'setup') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed]}
            onPress={() => navigation.goBack()}
            hitSlop={12}
          >
            <Ionicons name="close" size={20} color="#111827" />
          </Pressable>

          <Text style={styles.stepHeader}>Step 1</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>Select session time</Text>

          {/* Interactive Dial Container */}
          <View style={styles.dialWrapper}>
            <View
              style={[styles.dialContainer, { width: DIAL_SIZE, height: DIAL_SIZE }]}
              {...dialPanResponder.panHandlers}
            >
              <Svg width={DIAL_SIZE} height={DIAL_SIZE}>
                <Circle
                  cx={CENTER_X}
                  cy={CENTER_Y}
                  r={DIAL_RADIUS}
                  stroke="#F1F3F5"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                />
                <Path
                  d={describeArc(CENTER_X, CENTER_Y, DIAL_RADIUS, 0, sweepAngle)}
                  stroke="#000000"
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                  fill="none"
                />
                <Circle
                  cx={knobPos.x}
                  cy={knobPos.y}
                  r={KNOB_RADIUS}
                  fill="#000000"
                />
              </Svg>

              <View style={styles.centerTextContainer} pointerEvents="none">
                <Text style={styles.timeValue}>{minutes}:00</Text>
                <Text style={styles.timeUnit}>Minutes</Text>
              </View>
            </View>

            {/* Quick Adjust Buttons */}
            <View style={styles.adjustRow}>
              <Pressable
                style={({ pressed }) => [styles.adjustBtn, pressed && styles.btnPressed]}
                onPress={() => setMinutes((prev) => Math.max(MIN_MINUTES, prev - STEP_MINUTES))}
              >
                <Ionicons name="remove" size={18} color="#111827" />
                <Text style={styles.adjustBtnText}>-5m</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.adjustBtn, pressed && styles.btnPressed]}
                onPress={() => setMinutes((prev) => Math.min(MAX_MINUTES, prev + STEP_MINUTES))}
              >
                <Ionicons name="add" size={18} color="#111827" />
                <Text style={styles.adjustBtnText}>+5m</Text>
              </Pressable>
            </View>
          </View>

          {/* Bottom Next Step Button */}
          <View style={styles.bottomBar}>
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
              onPress={handleNextStepPress}
            >
              <Text style={styles.primaryBtnText}>Next step</Text>
            </Pressable>
          </View>
        </View>

        {/* APPLE-STYLE CAMERA PERMISSION POP-UP */}
        <Modal
          visible={showApplePrompt}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowApplePrompt(false)}
        >
          <View style={styles.modalBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowApplePrompt(false)} />
            <View style={styles.appleAlertBox}>
              <View style={styles.appleAlertContent}>
                <Text style={styles.appleAlertTitle}>
                  “Recover” Would Like to Access the Camera
                </Text>
                <Text style={styles.appleAlertMessage}>
                  Recover uses your camera to ensure your phone remains face-down and undisturbed during your focus session.
                </Text>
              </View>

              <View style={styles.appleAlertDividerH} />

              <View style={styles.appleAlertActions}>
                <Pressable
                  style={({ pressed }) => [styles.appleAlertBtn, pressed && styles.appleAlertBtnPressed]}
                  onPress={() => setShowApplePrompt(false)}
                >
                  <Text style={styles.appleAlertBtnTextRegular}>Don’t Allow</Text>
                </Pressable>

                <View style={styles.appleAlertDividerV} />

                <Pressable
                  style={({ pressed }) => [styles.appleAlertBtn, pressed && styles.appleAlertBtnPressed]}
                  onPress={handleAllowCamera}
                >
                  <Text style={styles.appleAlertBtnTextBold}>OK</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ==========================================
  // RENDER: STAGE 2 (AR 3D BOX PLACEMENT - Image 1 & 2)
  // ==========================================
  if (stage === 'ar_placement') {
    return (
      <View style={styles.cameraRoot}>
        {/* Fullscreen Live Camera View */}
        <CameraView style={StyleSheet.absoluteFill} facing="back" />

        {/* Interactive Draggable 3D Box in AR */}
        <View
          style={[
            styles.draggableBoxContainer,
            {
              left: boxPos.x,
              top: boxPos.y,
              transform: [{ scale: boxScale }],
            },
          ]}
          {...arPanResponder.panHandlers}
        >
          <Image
            source={require('../../assets/box-3d.png')}
            style={styles.arBoxImage}
            resizeMode="contain"
          />
        </View>

        {/* Top Controls Overlay */}
        <SafeAreaView style={styles.arOverlay} edges={['top', 'bottom']}>
          <View style={styles.arTopBar}>
            <Pressable
              style={({ pressed }) => [styles.circleGlassBtn, pressed && styles.btnPressed]}
              onPress={() => setStage('setup')}
              hitSlop={12}
            >
              <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
            </Pressable>

            {/* Quick Simulate Button for Testing / Simulators */}
            <Pressable
              style={({ pressed }) => [styles.simulateBtn, pressed && styles.btnPressed]}
              onPress={handlePlacePhoneDown}
            >
              <Ionicons name="scan-outline" size={14} color="#38BDF8" style={{ marginRight: 5 }} />
              <Text style={styles.simulateBtnText}>Simulate Placement</Text>
            </Pressable>
          </View>

          {/* Bottom HUD: Focus Zone Placed (Matching Image 1) */}
          <View style={styles.arBottomHUD}>
            <Pressable
              style={({ pressed }) => [styles.arHUDCard, pressed && { opacity: 0.95 }]}
              onPress={handlePlacePhoneDown}
            >
              <Text style={styles.arHUDTitle}>Focus zone placed</Text>
              <Text style={styles.arHUDDesc}>Drag to reposition. Pinch to resize. Rotate to align.</Text>
              <Text style={styles.arHUDSub}>Place your phone face-down inside to begin.</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ==========================================
  // RENDER: STAGE 3 ("LOCKED IN" LOADING - Image 3)
  // ==========================================
  if (stage === 'locking_in') {
    const arcAngle = loadingProgress * 360;
    const ringRadius = 75;
    const ringCenter = 90;

    return (
      <View style={styles.lockingInRoot}>
        <View style={styles.lockingCenterContainer}>
          {/* Circular Loading Ring with Lock Icon */}
          <View style={{ width: 180, height: 180, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={180} height={180}>
              <Circle
                cx={ringCenter}
                cy={ringCenter}
                r={ringRadius}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth={7}
                fill="none"
              />
              <Path
                d={describeArc(ringCenter, ringCenter, ringRadius, 0, arcAngle)}
                stroke="#FFFFFF"
                strokeWidth={7}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>

            {/* Centered White Padlock Icon */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="lock-closed" size={38} color="#FFFFFF" />
              </View>
            </View>
          </View>

          {/* Locked in Text */}
          <Text style={styles.lockedInText}>Locked in</Text>
        </View>
      </View>
    );
  }

  // ==========================================
  // RENDER: STAGE 5 (MOTION WARNING & ALARM - Image 1 latest)
  // ==========================================
  if (stage === 'motion_warning') {
    const warningAngle = ((30 - warningSeconds) / 30) * 360;
    const warnRadius = 60;
    const warnCenter = 75;

    return (
      <View style={styles.motionWarningRoot}>
        <SafeAreaView style={styles.motionWarningContent} edges={['top', 'bottom']}>
          <Text style={styles.motionWarningTitle}>No phone allowed</Text>

          {/* 30s Warning Countdown Ring */}
          <View style={styles.warningRingWrap}>
            <Svg width={150} height={150}>
              <Circle
                cx={warnCenter}
                cy={warnCenter}
                r={warnRadius}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth={6}
                fill="none"
              />
              <Path
                d={describeArc(warnCenter, warnCenter, warnRadius, 0, warningAngle)}
                stroke="#FFFFFF"
                strokeWidth={6}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>

            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="phone-portrait-outline" size={36} color="#FFFFFF" />
                <Text style={styles.warningSecondsNum}>{warningSeconds}s</Text>
              </View>
            </View>
          </View>

          <Text style={styles.motionWarningSub}>Put the phone back down</Text>

          {/* Place Back Down Action Button */}
          <Pressable
            style={({ pressed }) => [styles.putDownBtn, pressed && styles.btnPressed]}
            onPress={handlePutPhoneDown}
          >
            <Ionicons name="arrow-down-circle" size={20} color="#000000" style={{ marginRight: 8 }} />
            <Text style={styles.putDownBtnText}>Place Phone Down (Alarm Stops)</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  // ==========================================
  // RENDER: STAGE 5b (STRIKE SCREEN - Image 2 latest)
  // ==========================================
  if (stage === 'strike_screen') {
    const isGameOver = strikes >= 3;

    return (
      <View style={styles.strikeRoot}>
        <SafeAreaView style={styles.strikeContent} edges={['top', 'bottom']}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.strikeMainTitle}>Motion Detected!</Text>
            <Text style={styles.strikeSubtitle}>You can’t move your phone during this session</Text>
          </View>

          {/* Big Strike Counter */}
          <View style={styles.strikeCounterWrap}>
            <Text style={styles.strikeCounterText}>Strike {strikes} / 3</Text>
          </View>

          {/* Bottom Actions */}
          <View style={styles.strikeBottomActions}>
            {isGameOver ? (
              <>
                <Text style={styles.strikeGameOverText}>You have to restart your focus session</Text>
                <Pressable
                  style={({ pressed }) => [styles.strikeRestartBtn, pressed && styles.btnPressed]}
                  onPress={handleRestartSession}
                >
                  <Text style={styles.strikeRestartBtnText}>Restart Session</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.strikeResumeBtn, pressed && styles.btnPressed]}
                onPress={handlePutPhoneDown}
              >
                <Text style={styles.strikeResumeBtnText}>Put Phone Down & Resume</Text>
              </Pressable>
            )}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ==========================================
  // RENDER: STAGE 6 (SESSION SUMMARY)
  // ==========================================
  if (stage === 'session_summary') {
    const earnedCredits = Math.max(1, Math.round(elapsedSeconds / 60));

    return (
      <View style={styles.activeSessionRoot}>
        <SafeAreaView style={styles.sessionContainer} edges={['top', 'bottom']}>
          <View style={styles.summaryCardWrap}>
            <View style={styles.summaryCheckWrap}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            </View>
            <Text style={styles.summaryTitle}>Focus Session Saved</Text>
            <Text style={styles.summarySub}>
              You dedicated {Math.round(elapsedSeconds / 60)} minutes of uninterrupted focus.
            </Text>

            {/* Display Active Card */}
            <View style={styles.cardContainer}>
              <FocusCard width={280} credits={credits + earnedCredits} />
            </View>

            <View style={styles.earnedBadge}>
              <Ionicons name="flash" size={16} color="#38BDF8" style={{ marginRight: 6 }} />
              <Text style={styles.earnedBadgeText}>+{earnedCredits} Focus Credits Earned</Text>
            </View>
          </View>

          <View style={styles.bottomBar}>
            <Pressable
              style={({ pressed }) => [styles.finishBtn, pressed && styles.btnPressed]}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Text style={styles.finishBtnText}>Finish & Return to Dashboard</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ==========================================
  // RENDER: STAGE 4 (ACTIVE FOCUS SESSION - Image 4 & 5)
  // ==========================================
  return (
    <View style={styles.activeSessionRoot}>
      {/* Background Perspective Grid Lines */}
      <View style={styles.gridLinesContainer} pointerEvents="none">
        <View style={styles.gridLineV} />
        <View style={[styles.gridLineV, { left: '33%' }]} />
        <View style={[styles.gridLineV, { left: '66%' }]} />
        <View style={styles.gridLineH} />
        <View style={[styles.gridLineH, { top: '50%' }]} />
      </View>

      <SafeAreaView style={styles.sessionContainer} edges={['top', 'bottom']}>
        {/* Top Bar with Down Chevron & Simulate Motion button */}
        <View style={styles.sessionTopBar}>
          <Pressable
            style={({ pressed }) => [styles.circleGlassBtn, pressed && styles.btnPressed]}
            onPress={() => setShowPauseMenu(true)}
            hitSlop={12}
          >
            <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
          </Pressable>

          {/* Test Motion Trigger */}
          <Pressable
            style={({ pressed }) => [styles.testLiftBtn, pressed && styles.btnPressed]}
            onPress={triggerMotionWarning}
          >
            <Ionicons name="notifications" size={14} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={styles.testLiftBtnText}>Test Lift Alarm</Text>
          </Pressable>
        </View>

        {/* Center Timer & Status Header */}
        <View style={styles.sessionCenterInfo}>
          <Text style={styles.liveTimerText}>{formatTime(secondsRemaining)}</Text>
          <Text style={styles.liveTimerSub}>Earning screen time...</Text>

          {/* Floating Recover Card */}
          <View style={styles.cardContainer}>
            <FocusCard width={280} credits={credits} />
          </View>

          {/* Reward Tag & AR Box Commitment */}
          <View style={styles.rewardTagWrap}>
            <View style={styles.rewardPill}>
              <Text style={styles.rewardPillText}>+ {minutes} Credits</Text>
            </View>
            <Text style={styles.arCommitmentTitle}>AR lock box</Text>
            <Text style={styles.arCommitmentSub}>AR commitment • forfeit on 3rd strike</Text>
          </View>
        </View>

        {/* Bottom Pause Controls */}
        <View style={styles.sessionBottomBar}>
          {!showPauseMenu ? (
            <Pressable
              style={({ pressed }) => [styles.pauseCircleBtn, pressed && styles.btnPressed]}
              onPress={() => {
                setIsPaused(true);
                setShowPauseMenu(true);
              }}
            >
              <Ionicons name="pause" size={24} color="#000000" />
            </Pressable>
          ) : (
            <View style={styles.pauseMenuRow}>
              <Pressable
                style={({ pressed }) => [styles.resumeBtn, pressed && styles.btnPressed]}
                onPress={() => {
                  setIsPaused(false);
                  setShowPauseMenu(false);
                }}
              >
                <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.resumeBtnText}>Resume</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.quitBtn, pressed && styles.btnPressed]}
                onPress={() => setShowQuitConfirm(true)}
              >
                <Text style={styles.quitBtnText}>Quit</Text>
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* QUIT CONFIRMATION POPUP */}
      <Modal
        visible={showQuitConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuitConfirm(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.quitAlertBox}>
            <Text style={styles.quitAlertTitle}>Leave focus session?</Text>
            <Text style={styles.quitAlertMsg}>
              Your progress until now will be saved and you will earn credits for your focused time, but you haven&apos;t completed the full session.
            </Text>
            <View style={styles.quitAlertActions}>
              <Pressable
                style={styles.quitCancelBtn}
                onPress={() => setShowQuitConfirm(false)}
              >
                <Text style={styles.quitCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.quitConfirmBtn}
                onPress={() => {
                  setShowQuitConfirm(false);
                  setShowPauseMenu(false);
                  handleFinishSession(elapsedSeconds / 60);
                }}
              >
                <Text style={styles.quitConfirmText}>Continue</Text>
              </Pressable>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 38,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: -0.3,
  },
  dialWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -1,
  },
  timeUnit: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 2,
  },
  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  adjustBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    gap: 4,
  },
  adjustBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  bottomBar: {
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
  },
  primaryBtn: {
    height: 56,
    backgroundColor: '#38BDF8',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },

  // Apple-style permission prompt modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  appleAlertBox: {
    width: 270,
    backgroundColor: '#F2F2F2',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  appleAlertContent: {
    paddingTop: 20,
    paddingBottom: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  appleAlertTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 22,
  },
  appleAlertMessage: {
    fontSize: 13,
    lineHeight: 18,
    color: '#3C3C43',
    textAlign: 'center',
  },
  appleAlertDividerH: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#3C3C434A',
  },
  appleAlertActions: {
    flexDirection: 'row',
    height: 44,
  },
  appleAlertBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleAlertBtnPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  appleAlertBtnTextRegular: {
    fontSize: 17,
    fontWeight: '400',
    color: '#007AFF',
  },
  appleAlertBtnTextBold: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  appleAlertDividerV: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#3C3C434A',
  },

  // Stage 2: AR Camera & Placement
  cameraRoot: {
    flex: 1,
    backgroundColor: '#000000',
  },
  draggableBoxContainer: {
    position: 'absolute',
    width: 160,
    height: 275,
    zIndex: 10,
  },
  arBoxImage: {
    width: '100%',
    height: '100%',
  },
  arOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 20,
  },
  arTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  circleGlassBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  simulateBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#38BDF8',
  },
  arBottomHUD: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  arHUDCard: {
    backgroundColor: 'rgba(10, 15, 29, 0.82)',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
  },
  arHUDTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  arHUDDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 6,
  },
  arHUDSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#38BDF8',
    textAlign: 'center',
  },

  // Stage 3: Locking In (Image 3)
  lockingInRoot: {
    flex: 1,
    backgroundColor: '#0062FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockingCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedInText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 24,
    letterSpacing: 0.2,
  },

  // Stage 4: Active Session (Image 4 & 5)
  activeSessionRoot: {
    flex: 1,
    backgroundColor: '#024EC7',
  },
  gridLinesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#FFFFFF',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#FFFFFF',
  },
  sessionContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  sessionTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  testLiftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  testLiftBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F87171',
  },
  sessionCenterInfo: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  liveTimerText: {
    fontSize: 54,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  liveTimerSub: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 4,
    marginBottom: 24,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 290,
    aspectRatio: 1.58,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  cardSurface: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
    backgroundColor: '#1E293B',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBalance: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardHolderName: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  rewardTagWrap: {
    alignItems: 'center',
  },
  rewardPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  rewardPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284C7',
  },
  arCommitmentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  arCommitmentSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sessionBottomBar: {
    alignItems: 'center',
    paddingBottom: 28,
  },
  pauseCircleBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  pauseMenuRow: {
    flexDirection: 'row',
    gap: 16,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  resumeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quitBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  quitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Stage 5: Motion Warning
  motionWarningRoot: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  motionWarningContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  motionWarningTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
  },
  warningRingWrap: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningSecondsNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  motionWarningSub: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
  },
  putDownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 999,
    width: '100%',
    justifyContent: 'center',
  },
  putDownBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },

  // Stage 5b: Strike Screen
  strikeRoot: {
    flex: 1,
    backgroundColor: '#7F1D1D',
  },
  strikeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  strikeMainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  strikeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  strikeCounterWrap: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 36,
    paddingVertical: 20,
    borderRadius: 24,
  },
  strikeCounterText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  strikeBottomActions: {
    width: '100%',
    alignItems: 'center',
  },
  strikeGameOverText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    textAlign: 'center',
  },
  strikeRestartBtn: {
    backgroundColor: '#FFFFFF',
    height: 54,
    borderRadius: 999,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strikeRestartBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B91C1C',
  },
  strikeResumeBtn: {
    backgroundColor: '#FFFFFF',
    height: 54,
    borderRadius: 999,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strikeResumeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },

  // Stage 6: Summary
  summaryCardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  summaryCheckWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  summarySub: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    marginBottom: 24,
  },
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 12,
  },
  earnedBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  finishBtn: {
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  finishBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0284C7',
  },

  // Quit modal
  quitAlertBox: {
    width: 290,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quitAlertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  quitAlertMsg: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 20,
  },
  quitAlertActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  quitCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  quitCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  quitConfirmBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  quitConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
