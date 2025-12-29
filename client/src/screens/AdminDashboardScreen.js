import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES, ALIGN } from "../constants/theme";

const RECENT_CHECKINS = [
  {
    id: "1",
    name: "Alice Smith",
    time: "10:02 AM",
    status: "Active",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "2",
    name: "Bob Jones",
    time: "09:55 AM",
    status: "Expired",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "3",
    name: "Charlie Day",
    time: "09:48 AM",
    status: "Active",
    image: "https://randomuser.me/api/portraits/men/64.jpg",
  },
];

export default function AdminDashboardScreen({ onNavigate }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Admin Portal</Text>
            <Text style={styles.gymName}>
              GYM<Text style={{ color: COLORS.primary }}>NEXUS</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Quick Scan Action - Prominent */}
        <TouchableOpacity activeOpacity={0.9} style={styles.scanBtnContainer}>
          <LinearGradient
            colors={[COLORS.primary, "#96E6A1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scanBtn}
          >
            <Ionicons name="scan" size={32} color={COLORS.background} />
            <Text style={styles.scanBtnText}>SCAN MEMBER QR</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* KPI Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons
              name="people"
              size={24}
              color={COLORS.primary}
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.statValue}>124</Text>
            <Text style={styles.statLabel}>Checked In</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons
              name="cash"
              size={24}
              color={COLORS.success}
              style={{ marginBottom: 8 }}
            />
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              $4.2k
            </Text>
            <Text style={styles.statLabel}>Daily Rev</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Check-ins</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {RECENT_CHECKINS.map((item) => (
            <View key={item.id} style={styles.checkinRow}>
              <Image source={{ uri: item.image }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.checkinTime}>{item.time}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  item.status === "Active"
                    ? { backgroundColor: "rgba(0, 250, 154, 0.1)" }
                    : { backgroundColor: "rgba(255, 77, 77, 0.1)" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    item.status === "Active"
                      ? { color: COLORS.success }
                      : { color: COLORS.error },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Admin Actions Grid */}
        <Text
          style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}
        >
          Management
        </Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItem}>
            <View style={styles.gridIcon}>
              <Ionicons
                name="person-add-outline"
                size={24}
                color={COLORS.text}
              />
            </View>
            <Text style={styles.gridLabel}>Add Member</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <View style={styles.gridIcon}>
              <Ionicons name="calendar-outline" size={24} color={COLORS.text} />
            </View>
            <Text style={styles.gridLabel}>Classes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <View style={styles.gridIcon}>
              <Ionicons name="barbell-outline" size={24} color={COLORS.text} />
            </View>
            <Text style={styles.gridLabel}>Equipment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <View style={styles.gridIcon}>
              <Ionicons
                name="stats-chart-outline"
                size={24}
                color={COLORS.text}
              />
            </View>
            <Text style={styles.gridLabel}>Reports</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Admin Bottom Nav - Simplified */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onNavigate("adminDashboard")}
        >
          <Ionicons name="grid" size={24} color={COLORS.primary} />
          <Text style={[styles.navText, { color: COLORS.primary }]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="people-outline"
            size={24}
            color={COLORS.textSecondary}
          />
          <Text style={styles.navText}>Members</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onNavigate("login")}
        >
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          <Text style={[styles.navText, { color: COLORS.error }]}>Logout</Text>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  gymName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
  },
  settingsBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scanBtnContainer: {
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: SIZES.radius,
  },
  scanBtnText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  statCard: {
    width: "48%",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
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
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  listContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkinRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberName: {
    color: COLORS.text,
    fontWeight: "bold",
    fontSize: 14,
  },
  checkinTime: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "23%",
    alignItems: "center",
    marginBottom: 16,
  },
  gridIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gridLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    textAlign: "center",
  },
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
    shadowOffset: { width: 0, height: 10 },
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
