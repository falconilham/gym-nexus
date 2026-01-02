import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import GymSelectionScreen from './src/screens/GymSelectionScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TrainerScreen from './src/screens/TrainerScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BottomNavBar from './src/components/BottomNavBar';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

// Screens: 'login' | 'gymSelection' | 'dashboard' | 'trainers' | 'schedule' | 'profile' | 'forgotPassword'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedMembership = await AsyncStorage.getItem('selectedMembership');

      if (storedUser && storedMembership) {
        setUser(JSON.parse(storedUser));
        setSelectedMembership(JSON.parse(storedMembership));
        setCurrentScreen('dashboard');
      }
    } catch (e) {
      console.log('Failed to load user:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = screen => {
    // Feature Gating
    if (selectedMembership?.Gym?.features) {
      const features = selectedMembership.Gym.features;
      if (screen === 'trainers' && !features.includes('trainers')) {
        Alert.alert('Access Denied', 'Trainers feature is not enabled for this gym.');
        return;
      }
      if (screen === 'schedule' && !features.includes('schedule')) {
        Alert.alert('Access Denied', 'Schedule feature is not enabled for this gym.');
        return;
      }
    }
    setCurrentScreen(screen);
  };

  const handleLoginSuccess = async (userData, membershipsList) => {
    try {
      setUser(userData);
      setMemberships(membershipsList);

      // If only one membership, auto-select it
      if (membershipsList.length === 1) {
        await handleGymSelection(userData, membershipsList[0]);
      } else {
        // Show gym selection screen
        navigate('gymSelection');
      }
    } catch (e) {
      console.log('Failed to handle login:', e);
    }
  };

  const handleGymSelection = async (userData, membership) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('selectedMembership', JSON.stringify(membership));
      setUser(userData);
      setSelectedMembership(membership);
      navigate('dashboard');
    } catch (e) {
      console.log('Failed to save gym selection:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('selectedMembership');
      setUser(null);
      setSelectedMembership(null);
      setMemberships([]);
      navigate('login');
    } catch (e) {
      console.log('Failed to remove user:', e);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}
      >
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  // --- GYM SELECTION SCREEN ---
  if (currentScreen === 'gymSelection') {
    return (
      <GymSelectionScreen
        user={user}
        memberships={memberships}
        onSelectGym={membership => handleGymSelection(user, membership)}
      />
    );
  }

  // --- MEMBER FLOW (With Bottom Nav) ---
  const updateUserData = async updatedFields => {
    try {
      const newUser = { ...user, ...updatedFields };
      setUser(newUser);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (e) {
      console.log('Failed to update user storage:', e);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardScreen
            user={user}
            selectedMembership={selectedMembership}
            onNavigate={navigate}
          />
        );
      case 'trainers':
        return (
          <TrainerScreen
            selectedMembership={selectedMembership}
            onBack={() => navigate('dashboard')}
          />
        );
      case 'schedule':
        return (
          <ScheduleScreen
            selectedMembership={selectedMembership}
            onBack={() => navigate('dashboard')}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            user={user}
            onBack={() => navigate('dashboard')}
            onLogout={handleLogout}
            onUpdateUser={updateUserData}
          />
        );
      default:
        return null;
    }
  };

  if (['dashboard', 'trainers', 'schedule', 'profile'].includes(currentScreen)) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {renderScreen()}
        <BottomNavBar currentScreen={currentScreen} onNavigate={navigate} />
      </View>
    );
  }

  // --- AUTH FLOW ---
  if (currentScreen === 'forgotPassword') {
    return <ForgotPasswordScreen onBack={() => navigate('login')} />;
  }

  return (
    <LoginScreen
      onLoginSuccess={handleLoginSuccess}
      onForgotPassword={() => navigate('forgotPassword')}
    />
  );
}
