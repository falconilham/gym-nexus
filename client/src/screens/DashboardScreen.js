import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';
import ClassCard from '../components/ClassCard';
import { API_URL, API_ENDPOINTS } from '../utils/api';
import axios from 'axios';

export default function DashboardScreen({ onNavigate, user, selectedMembership }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrTimestamp, setQrTimestamp] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(120); // 120 seconds

  /* New Timer State */
  const [sessionDuration, setSessionDuration] = useState(0);

  // Auto-refresh QR every 2 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        setQrTimestamp(Date.now());
        setTimeLeft(120); // Reset timer
      },
      2 * 60 * 1000
    ); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  // Countdown timer effect for QR
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Session Timer Effect
  useEffect(() => {
    if (dashboardData?.latestCheckIn) {
      const startTime = new Date(dashboardData.latestCheckIn.timestamp).getTime();

      // Update immediately
      const updateTimer = () => {
        const now = Date.now();
        const diff = Math.floor((now - startTime) / 1000);
        setSessionDuration(diff > 0 ? diff : 0);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [dashboardData?.latestCheckIn]);

  // Format seconds to H:MM:SS
  const formatDuration = seconds => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const fetchDashboard = useCallback(async () => {
    try {
      if (!user?.id || !selectedMembership?.id) {
        console.error('Missing user or membership data');
        return;
      }

      const response = await axios.get(API_ENDPOINTS.dashboard(user.id, selectedMembership.id));
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user, selectedMembership]);

  const handleCheckout = async () => {
    try {
      if (!user?.id || !selectedMembership?.id || !selectedMembership?.gymId) {
        Alert.alert('Error', 'Missing required information for checkout');
        return;
      }

      const response = await axios.post(API_ENDPOINTS.checkIn, {
        userId: user.id,
        gymId: selectedMembership.gymId,
        membershipId: selectedMembership.id,
      });

      const data = response.data;

      if (data.success && data.type === 'checkout') {
        Alert.alert('Success', data.message || 'Checked out successfully!');
        // Refresh dashboard to update UI
        fetchDashboard();
      } else if (data.success && data.type === 'checkin') {
        Alert.alert('Info', 'You have been checked in');
        fetchDashboard();
      } else {
        Alert.alert('Error', data.message || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Could not connect to server. Please try again.');
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, [fetchDashboard]);

  // Polling for dashboard updates (Check-in status)
  useEffect(() => {
    // Poll frequently if QR modal is open (active scanning), otherwise less frequently
    const intervalTime = showQRModal ? 3000 : 15000;

    const interval = setInterval(() => {
      fetchDashboard();
    }, intervalTime);

    return () => clearInterval(interval);
  }, [showQRModal, fetchDashboard]);

  // Initial Fetch
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Auto-close QR Modal on Check-in
  useEffect(() => {
    if (showQRModal && dashboardData?.latestCheckIn) {
      // Check if this check-in is very recent (within last minute)
      // This prevents closing if the latest check-in is old
      const checkInTime = new Date(dashboardData.latestCheckIn.timestamp).getTime();
      const now = Date.now();
      if (now - checkInTime < 60000) {
        // Checked in recently!
        setShowQRModal(false);
      }
    }
  }, [dashboardData, showQRModal]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const {
    user: userInfo,
    stats,
    upcomingClasses,
    latestCheckIn,
    recentCheckIns,
  } = dashboardData || {
    user: { name: 'Guest' },
    stats: { workouts: 0, kcal: 0 },
    upcomingClasses: [],
    latestCheckIn: null,
    recentCheckIns: [],
  };

  // Use passed user name if available, otherwise fetched name
  const displayName = user?.name || userInfo?.name || 'Member';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>{displayName.toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => onNavigate('profile')}>
            <Image
              source={
                user?.memberPhoto
                  ? { uri: user.memberPhoto }
                  : { uri: 'https://randomuser.me/api/portraits/men/32.jpg' }
              }
              style={styles.profileImg}
            />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Suspended Warning */}
        {userInfo?.suspended && (
          <View style={styles.suspendedContainer}>
            <LinearGradient colors={['#7f1d1d', '#991b1b']} style={styles.suspendedCard}>
              <View style={styles.suspendedHeader}>
                <Ionicons name="ban" size={32} color="#fca5a5" />
                <Text style={styles.suspendedTitle}>ACCOUNT SUSPENDED</Text>
              </View>
              <Text style={styles.suspendedText}>
                Your membership has been temporarily suspended. Please contact the gym
                administration for more information.
              </Text>
              <View style={styles.suspendedFooter}>
                <Ionicons name="call-outline" size={16} color="#fca5a5" />
                <Text style={styles.suspendedContact}>Contact: admin@gymnexus.com</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Membership Status Card */}
        {!userInfo?.suspended && (
          <View style={styles.membershipContainer}>
            <LinearGradient colors={[COLORS.surface, '#2C2C2C']} style={styles.membershipCard}>
              <View style={styles.memberInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="hourglass-outline" size={20} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                      Membership Status
                    </Text>
                    <Text
                      style={{
                        color:
                          userInfo?.daysRemaining < 7 ? COLORS.error || '#FF4C4C' : COLORS.primary,
                        fontSize: 12,
                        marginTop: 2,
                        fontWeight: '600',
                      }}
                    >
                      {userInfo?.daysRemaining !== undefined
                        ? `${userInfo.daysRemaining} Days Remaining`
                        : ''}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.renewBtn}>
                <Text style={styles.renewText}>Upgrade</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Active Session Timer OR QR Access Card */}
        {latestCheckIn && sessionDuration < 12 * 60 * 60 ? (
          <View style={{ marginBottom: 24 }}>
            <LinearGradient
              colors={['#1e3a8a', '#172554']}
              style={{
                padding: 20,
                borderRadius: SIZES.radius,
                borderWidth: 1,
                borderColor: '#60a5fa',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#4ade80',
                      marginRight: 8,
                    }}
                  />
                  <Text style={{ color: '#bfdbfe', fontSize: 12, fontWeight: '600' }}>
                    ACTIVE SESSION
                  </Text>
                </View>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 32,
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                  }}
                >
                  {formatDuration(sessionDuration)}
                </Text>
                <View>
                  <Text style={{ color: '#93c5fd', fontSize: 12, marginTop: 4 }}>
                    Checked in at{' '}
                    {new Date(latestCheckIn.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text
                    style={{
                      color: '#60a5fa',
                      fontSize: 12,
                      marginTop: 8,
                      fontWeight: 'bold',
                    }}
                  >
                    Tap to show QR Code
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="timer-outline" size={28} color="#60a5fa" />
              </View>
            </LinearGradient>

            {/* Checkout Button */}
            <TouchableOpacity
              onPress={handleCheckout}
              activeOpacity={0.8}
              style={{
                marginTop: 12,
                backgroundColor: '#dc2626',
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: SIZES.radius,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#dc2626',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Check Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setShowQRModal(true)} activeOpacity={0.8}>
            <LinearGradient colors={[COLORS.surface, '#252525']} style={styles.accessCard}>
              <View style={styles.accessHeader}>
                <Ionicons name="scan-outline" size={24} color={COLORS.primary} />
                <Text style={styles.accessTitle}>MEMBER ACCESS</Text>
              </View>
              <View style={styles.qrContainer}>
                <Image
                  source={{
                    uri: API_ENDPOINTS.qr(user?.id, selectedMembership?.id, qrTimestamp),
                  }}
                  style={{ width: 150, height: 150 }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    marginTop: 10,
                    color: COLORS.textSecondary,
                    fontSize: 12,
                    textAlign: 'center',
                  }}
                >
                  Auto-refresh in {timeLeft}s
                </Text>
              </View>
              <Text style={styles.memberIdText}>Member ID: {user?.id || 'N/A'}</Text>
              <Text style={styles.tapText}>Tap to enlarge</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.workouts || 0}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
            <Text style={styles.statSub}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.kcal || 0}</Text>
            <Text style={styles.statLabel}>Kcal Burned</Text>
            <Text style={styles.statSub}>Total</Text>
          </View>
        </View>

        {/* CHECK-IN HISTORY */}
        {recentCheckIns && recentCheckIns.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <Text style={[styles.sectionTitle, { fontSize: 18, marginBottom: 12 }]}>
              Recent Activity
            </Text>
            {recentCheckIns.slice(0, 3).map(
              (
                checkin,
                index // Show last 3
              ) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: COLORS.surface,
                    padding: 12,
                    marginBottom: 8,
                    borderRadius: 12,
                    borderLeftWidth: 3,
                    borderLeftColor: checkin.status === 'granted' ? COLORS.primary : COLORS.error,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name={
                        checkin.status === 'granted' ? 'checkbox-outline' : 'alert-circle-outline'
                      }
                      size={20}
                      color={checkin.status === 'granted' ? COLORS.primary : COLORS.error}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.text, fontWeight: '600' }}>
                      {checkin.status === 'granted' ? 'Gym Access Granted' : 'Access Denied'}
                    </Text>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                      {new Date(checkin.timestamp).toLocaleDateString()} •{' '}
                      {new Date(checkin.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              )
            )}
          </View>
        )}

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Schedule</Text>
          <TouchableOpacity onPress={() => onNavigate('schedule')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
          {upcomingClasses && upcomingClasses.length > 0 ? (
            upcomingClasses.map(item => (
              <ClassCard
                key={item.id}
                title={item.title}
                time={item.time}
                trainer={item.trainer}
                // Fallback image if not provided by backend mock
                image={
                  item.image ||
                  'https://images.unsplash.com/photo-1544367563-121910aa662f?w=500&q=80'
                }
              />
            ))
          ) : (
            <Text style={{ color: COLORS.textSecondary, fontStyle: 'italic' }}>
              No upcoming classes.
            </Text>
          )}
        </ScrollView>
      </ScrollView>

      {/* Full-Screen QR Modal */}
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <TouchableOpacity
          style={styles.qrModalOverlay}
          activeOpacity={1}
          onPress={() => setShowQRModal(false)}
        >
          <View style={styles.qrModalContent}>
            <View style={styles.qrModalHeader}>
              <Text style={styles.qrModalTitle}>MEMBER ACCESS QR</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <Ionicons name="close-circle" size={32} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.qrModalQRContainer}>
              {user?.id && (
                <React.Fragment>
                  <Image
                    source={{
                      uri: API_ENDPOINTS.qr(user.id, selectedMembership?.id, qrTimestamp),
                    }}
                    style={{ width: 280, height: 280 }}
                    resizeMode="contain"
                  />
                  <Text style={{ marginTop: 10, color: COLORS.textSecondary, fontSize: 12 }}>
                    Auto-refresh in {timeLeft}s
                  </Text>
                </React.Fragment>
              )}
            </View>

            <View style={styles.qrModalInfo}>
              <Text style={styles.qrModalMemberId}>Member ID: {user?.id || 'N/A'}</Text>
              <Text style={styles.qrModalName}>{user?.name || 'Guest'}</Text>
              <Text style={styles.qrModalInstructions}>
                Present this QR code at the gym entrance scanner
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 120, // Increased for Bottom Tab
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  userName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  profileImg: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  /* Membership Card Styles */
  membershipContainer: {
    marginBottom: 24,
  },
  membershipCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: SIZES.radius,
  },
  memberInfo: {
    flex: 1,
  },
  memberPlan: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberExpiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberExpiryText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginLeft: 6,
  },
  renewBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  renewText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  /* Suspended Warning Styles */
  suspendedContainer: {
    marginBottom: 24,
  },
  suspendedCard: {
    padding: 20,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: '#991b1b',
  },
  suspendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  suspendedTitle: {
    color: '#fca5a5',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  suspendedText: {
    color: '#fecaca',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  suspendedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suspendedContact: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    width: '48%',
    padding: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  statSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  accessCard: {
    padding: 20,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  accessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  accessTitle: {
    color: COLORS.text,
    fontWeight: 'bold',
    marginLeft: 10,
    letterSpacing: 1,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  memberIdText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tapText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  /* QR Modal Styles */
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  qrModalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  qrModalQRContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  qrModalInfo: {
    alignItems: 'center',
    width: '100%',
  },
  qrModalMemberId: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  qrModalName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  qrModalInstructions: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: 14,
  },
  horizontalList: {
    marginBottom: 32,
    overflow: 'visible',
  },
  promoBanner: {
    borderRadius: SIZES.radius,
    overflow: 'hidden',
  },
  promoGradient: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  promoDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  /* Bottom Tab Bar */
});
