import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

export default function GymSelectionScreen({ user, memberships, onSelectGym }) {
  const handleSelectGym = membership => {
    // Call parent callback with selected gym
    onSelectGym(membership);
  };

  const getStatusColor = membership => {
    if (membership.suspended) return '#f59e0b';
    if (membership.daysRemaining <= 0) return '#ef4444';
    if (membership.daysRemaining < 7) return '#f59e0b';
    return COLORS.primary;
  };

  const getStatusText = membership => {
    if (membership.suspended) return 'Suspended';
    if (membership.daysRemaining <= 0) return 'Expired';
    return `${membership.daysRemaining} days left`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user.name.toUpperCase()}</Text>
        <Text style={styles.subtitle}>Select your gym to continue</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {memberships.map(membership => (
          <TouchableOpacity
            key={membership.id}
            onPress={() => handleSelectGym(membership)}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[COLORS.surface, '#2C2C2C']} style={styles.gymCard}>
              {/* Gym Icon */}
              <View style={styles.gymIconContainer}>
                <LinearGradient colors={[COLORS.primary, '#9ACD32']} style={styles.gymIcon}>
                  <Ionicons name="fitness" size={32} color="black" />
                </LinearGradient>
              </View>

              {/* Gym Info */}
              <View style={styles.gymInfo}>
                <Text style={styles.gymName}>{membership.gymName}</Text>
                {membership.gymAddress && (
                  <View style={styles.addressRow}>
                    <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.gymAddress}>{membership.gymAddress}</Text>
                  </View>
                )}

                {/* Status Badge */}
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(membership)}20` },
                    ]}
                  >
                    <View
                      style={[styles.statusDot, { backgroundColor: getStatusColor(membership) }]}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(membership) }]}>
                      {getStatusText(membership)}
                    </Text>
                  </View>

                  {membership.status === 'Active' && !membership.suspended && (
                    <View style={styles.planBadge}>
                      <Text style={styles.planText}>{membership.duration}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Arrow */}
              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.footerText}>You can switch gyms anytime from settings</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
    paddingTop: 20,
    paddingBottom: 30,
  },
  greeting: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingTop: 0,
  },
  gymCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: SIZES.radius,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gymIconContainer: {
    marginRight: 16,
  },
  gymIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  gymAddress: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  planBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  arrowContainer: {
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
