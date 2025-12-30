import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function BottomNavBar({ currentScreen, onNavigate }) {
  return (
    <View style={styles.bottomNavContainer}>
      <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('dashboard')}>
        <Ionicons
          name={currentScreen === 'dashboard' ? 'home' : 'home-outline'}
          size={24}
          color={currentScreen === 'dashboard' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text
          style={[
            styles.navText,
            { color: currentScreen === 'dashboard' ? COLORS.primary : COLORS.textSecondary },
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('schedule')}>
        <Ionicons
          name={currentScreen === 'schedule' ? 'calendar' : 'calendar-outline'}
          size={24}
          color={currentScreen === 'schedule' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text
          style={[
            styles.navText,
            { color: currentScreen === 'schedule' ? COLORS.primary : COLORS.textSecondary },
          ]}
        >
          Schedule
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('trainers')}>
        <Ionicons
          name={currentScreen === 'trainers' ? 'body' : 'body-outline'}
          size={24}
          color={currentScreen === 'trainers' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text
          style={[
            styles.navText,
            { color: currentScreen === 'trainers' ? COLORS.primary : COLORS.textSecondary },
          ]}
        >
          Trainers
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('profile')}>
        <Ionicons
          name={currentScreen === 'profile' ? 'person' : 'person-outline'}
          size={24}
          color={currentScreen === 'profile' ? COLORS.primary : COLORS.textSecondary}
        />
        <Text
          style={[
            styles.navText,
            { color: currentScreen === 'profile' ? COLORS.primary : COLORS.textSecondary },
          ]}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 80,
    backgroundColor: 'rgba(30,30,30,0.95)',
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
});
