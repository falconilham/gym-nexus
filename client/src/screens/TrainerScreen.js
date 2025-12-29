import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/theme";
import TrainerCard from "../components/TrainerCard";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/trainers`;

const CATEGORIES = ["All", "HIIT", "Strength", "Yoga", "Boxing"];

export default function TrainerScreen({ onBack }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setTrainers(data))
      .catch((err) => console.error("Failed to fetch trainers", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleBook = (trainerId, trainerName) => {
    Alert.alert(
      "Select Booking Type",
      `How would you like to train with ${trainerName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Single Session",
          onPress: () => processBooking(trainerId, "single"),
        },
        {
          text: "10-Session Package",
          onPress: () => processBooking(trainerId, "package"),
        },
      ]
    );
  };

  const processBooking = (trainerId, bookingType) => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/book-trainer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainerId,
        memberId: 1, // Hardcoded for now, should ideally come from Context/Auth
        date: new Date().toISOString(),
        bookingType,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) Alert.alert("Success", data.message);
        else Alert.alert("Error", "Booking failed.");
      })
      .catch((err) => {
        console.error(err);
        Alert.alert("Error", "Could not connect to server.");
      });
  };

  const filteredTrainers = trainers.filter(
    (t) =>
      (selectedCategory === "All" || t.specialty.includes(selectedCategory)) &&
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.padding}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Personal Trainers</Text>
          <TouchableOpacity>
            <Ionicons name="filter" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Find a trainer..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoryContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isActive = selectedCategory === item;
              return (
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    isActive && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isActive && styles.categoryTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* List */}
        {isLoading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredTrainers}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <TrainerCard
                {...item}
                onBook={() => handleBook(item.id, item.name)}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  padding: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: SIZES.radius,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.text,
    fontSize: 16,
  },
  categoryContainer: {
    marginBottom: 20,
    height: 40,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: COLORS.background,
  },
});
