import React, { useState } from "react";
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import TrainerScreen from "./src/screens/TrainerScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

// Screens: 'login' | 'dashboard' | 'trainers' | 'schedule' | 'profile'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("login");
  const [user, setUser] = useState(null);

  const navigate = (screen) => {
    setCurrentScreen(screen);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    navigate("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    navigate("login");
  };

  // --- MEMBER FLOW ---
  if (currentScreen === "dashboard") {
    return <DashboardScreen user={user} onNavigate={navigate} />;
  }

  if (currentScreen === "trainers") {
    return <TrainerScreen onBack={() => navigate("dashboard")} />;
  }

  if (currentScreen === "schedule") {
    return <ScheduleScreen onBack={() => navigate("dashboard")} />;
  }

  if (currentScreen === "profile") {
    return (
      <ProfileScreen
        user={user}
        onBack={() => navigate("dashboard")}
        onLogout={handleLogout}
      />
    );
  }

  // --- AUTH FLOW ---
  return <LoginScreen onLogin={handleLogin} />;
}
