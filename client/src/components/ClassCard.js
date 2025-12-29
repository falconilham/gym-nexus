import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/theme";

export default function ClassCard({ title, time, trainer, image, style }) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={[styles.container, style]}>
      <ImageBackground
        source={{ uri: image }}
        style={styles.bgImage}
        imageStyle={{ borderRadius: SIZES.radius }}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.9)"]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>BOOKED</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.row}>
              <Ionicons name="time-outline" size={14} color={COLORS.primary} />
              <Text style={styles.subText}> {time}</Text>
            </View>
            <Text style={styles.trainer}>with {trainer}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 250,
    borderRadius: SIZES.radius,
    marginRight: 16,
    backgroundColor: COLORS.surface,
  },
  bgImage: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  gradient: {
    height: "60%",
    width: "100%",
    justifyContent: "flex-end",
    padding: 16,
    borderRadius: SIZES.radius,
  },
  content: {
    alignItems: "flex-start",
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: "bold",
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  subText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  trainer: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
  },
});
