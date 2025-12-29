import React, { useEffect, useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES } from "../constants/theme";
import ClassCard from "../components/ClassCard";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/dashboard`;

export default function DashboardScreen({ onNavigate, user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Use user.id from props, fallback to 1 for dev
        const userId = user?.id || 1;
        const res = await fetch(`${API_URL}/${userId}`);
        const data = await res.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  const {
    user: userInfo,
    stats,
    upcomingClasses,
  } = dashboardData || {
    user: { name: "Guest", plan: "Standard" },
    stats: { workouts: 0, kcal: 0 },
    upcomingClasses: [],
  };

  // Use passed user name if available, otherwise fetched name
  const displayName = user?.name || userInfo?.name || "Member";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>{displayName.toUpperCase()}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => onNavigate("profile")}
          >
            <Image
              source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
              style={styles.profileImg}
            />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Membership Status Card */}
        <View style={styles.membershipContainer}>
          <LinearGradient
            colors={[COLORS.surface, "#2C2C2C"]}
            style={styles.membershipCard}
          >
            <View style={styles.memberInfo}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons
                    name="hourglass-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                    Current Plan
                  </Text>
                  <Text
                    style={{
                      color: COLORS.text,
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    {userInfo?.plan || "Members"}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.renewBtn}>
              <Text style={styles.renewText}>Upgrade</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Status Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.workouts || 0}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
            <Text style={styles.statSub}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.kcal || 0}</Text>
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statSub}>Burned</Text>
          </View>
        </View>

        {/* QR Access Card */}
        <LinearGradient
          colors={[COLORS.surface, "#252525"]}
          style={styles.accessCard}
        >
          <View style={styles.accessHeader}>
            <Ionicons name="scan-outline" size={24} color={COLORS.primary} />
            <Text style={styles.accessTitle}>MEMBER ACCESS</Text>
          </View>
          <View style={styles.qrPlaceholder}>
            {/* Mock QR */}
            <Ionicons name="qr-code" size={120} color={COLORS.text} />
          </View>
          <Text style={styles.tapText}>Tap to enlarge</Text>
        </LinearGradient>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Schedule</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
        >
          {upcomingClasses && upcomingClasses.length > 0 ? (
            upcomingClasses.map((item) => (
              <ClassCard
                key={item.id}
                title={item.title}
                time={item.time}
                trainer={item.trainer}
                // Fallback image if not provided by backend mock
                image={
                  item.image ||
                  "https://images.unsplash.com/photo-1544367563-121910aa662f?w=500&q=80"
                }
              />
            ))
          ) : (
            <Text style={{ color: COLORS.textSecondary, fontStyle: "italic" }}>
              No upcoming classes.
            </Text>
          )}
        </ScrollView>

        {/* Promotional Banner */}
        <View style={styles.promoBanner}>
          <LinearGradient
            colors={[COLORS.secondary, "#00B8D4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoGradient}
          >
            <View>
              <Text style={styles.promoTitle}>Invite a Friend</Text>
              <Text style={styles.promoDesc}>
                Get 1 month free when they join.
              </Text>
            </View>
            <Ionicons name="gift-outline" size={32} color={COLORS.text} />
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onNavigate("dashboard")}
        >
          <Ionicons name="home" size={24} color={COLORS.primary} />
          <Text style={[styles.navText, { color: COLORS.primary }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onNavigate("schedule")}
        >
          <Ionicons
            name="calendar-outline"
            size={24}
            color={COLORS.textSecondary}
          />
          <Text style={styles.navText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onNavigate("trainers")}
        >
          <Ionicons
            name="body-outline"
            size={24}
            color={COLORS.textSecondary}
          />
          <Text style={styles.navText}>Trainers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onNavigate("profile")}
        >
          <Ionicons
            name="person-outline"
            size={24}
            color={COLORS.textSecondary}
          />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  userName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
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
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  notificationDot: {
    position: "absolute",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: SIZES.radius,
  },
  memberInfo: {
    flex: 1,
  },
  memberPlan: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  memberExpiryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberExpiryText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginLeft: 6,
  },
  renewBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  renewText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    width: "48%",
    padding: 16,
    borderRadius: SIZES.radius,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: "bold",
  },
  statLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  statSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  accessCard: {
    padding: 20,
    borderRadius: SIZES.radius,
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  accessHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  accessTitle: {
    color: COLORS.text,
    fontWeight: "bold",
    marginLeft: 10,
    letterSpacing: 1,
  },
  qrPlaceholder: {
    backgroundColor: COLORS.text,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  tapText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: 14,
  },
  horizontalList: {
    marginBottom: 32,
    overflow: "visible",
  },
  promoBanner: {
    borderRadius: SIZES.radius,
    overflow: "hidden",
  },
  promoGradient: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  promoTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  promoDesc: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 4,
  },
  /* Bottom Tab Bar */
  bottomNavContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 80,
    backgroundColor: "rgba(30,30,30,0.95)",
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
});
