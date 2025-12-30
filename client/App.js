import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TrainerScreen from './src/screens/TrainerScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BottomNavBar from './src/components/BottomNavBar';

// Screens: 'login' | 'dashboard' | 'trainers' | 'schedule' | 'profile' | 'forgotPassword'

import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setCurrentScreen('dashboard');
      }
    } catch (e) {
      console.log('Failed to load user');
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = screen => {
    setCurrentScreen(screen);
  };

  const handleLogin = async userData => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      navigate('dashboard');
    } catch (e) {
      console.log('Failed to save user');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      navigate('login');
    } catch (e) {
      console.log('Failed to remove user');
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

  // --- MEMBER FLOW (With Bottom Nav) ---
  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen user={user} onNavigate={navigate} />;
      case 'trainers':
        return <TrainerScreen onBack={() => navigate('dashboard')} />;
      case 'schedule':
        return <ScheduleScreen onBack={() => navigate('dashboard')} />;
      case 'profile':
        return (
          <ProfileScreen user={user} onBack={() => navigate('dashboard')} onLogout={handleLogout} />
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

  return <LoginScreen onLogin={handleLogin} onForgotPassword={() => navigate('forgotPassword')} />;
}
