import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { API_ENDPOINTS } from '../utils/api';
import axios from 'axios';

export default function ScheduleScreen({ selectedMembership, onBack }) {
  const [scheduleDays, setScheduleDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Generate Schedule Days (Next 7 days)
  useEffect(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue...
        date: d.getDate(), // 15, 16...
        fullDate: d.toISOString().split('T')[0],
      });
    }
    setScheduleDays(days);
    setSelectedDay(days[0].name);
  }, []);

  const fetchClasses = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const gymId = selectedMembership?.Gym?.id || selectedMembership?.gymId;

      if (!gymId) {
        console.error('No gym ID available');
        Alert.alert('Error', 'Gym information not available');
        if (showLoading) setIsLoading(false);
        return;
      }

      const response = await axios.get(API_ENDPOINTS.classes, {
        params: { gymId },
      });
      setClasses(response.data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      Alert.alert('Error', 'Failed to load classes. Please try again.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [selectedMembership]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchClasses(false);
    setRefreshing(false);
  }, [selectedMembership]);

  const handleBook = (classId, title) => {
    Alert.alert('Book Class', `Confirm booking for ${title}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            const response = await axios.post(API_ENDPOINTS.bookClass, {
              classId,
              memberId: 1, // ToDo: Get from context
            });

            if (response.data.success) {
              Alert.alert('Success', response.data.message);
            } else {
              Alert.alert('Error', 'Booking failed.');
            }
          } catch (err) {
            console.error('Booking error:', err);
            Alert.alert('Error', 'Could not connect to server. Please try again.');
          }
        },
      },
    ]);
  };

  // Filter classes by selected Day
  const filteredClasses = useMemo(() => {
    if (!selectedDay) return [];
    return classes.filter(c => c.day === selectedDay || !c.day); // Fallback: Show classes without day (legacy) on ALL days, or hide. Showing them ensures demo isn't empty.
    // Ideally: return classes.filter(c => c.day === selectedDay);
  }, [classes, selectedDay]);

  const renderClassItem = ({ item }) => {
    const isFull = item.booked >= item.capacity;

    return (
      <View style={styles.card}>
        <View style={[styles.timeStrip, { backgroundColor: item.color || COLORS.primary }]}>
          <Text style={styles.timeText}>{item.time ? item.time.split(' ')[0] : 'TBA'}</Text>
          <Text style={styles.ampm}>
            {item.time && item.time.split(' ')[1] ? item.time.split(' ')[1] : ''}
          </Text>
        </View>
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.classTitle}>{item.title}</Text>
            <Text style={styles.trainerName}>{item.trainer}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{item.duration}</Text>
              <View style={{ width: 10 }} />
              <Ionicons name="people-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>
                {item.booked}/{item.capacity}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.bookBtn, isFull && styles.fullBtn]}
            disabled={isFull}
            onPress={() => handleBook(item.id, item.title)}
          >
            <Text style={[styles.bookBtnText, isFull && { color: COLORS.textSecondary }]}>
              {isFull ? 'FULL' : 'BOOK'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Weekly Schedule</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Calendar Strip */}
      <View style={styles.calendarStrip}>
        {scheduleDays.map((item, index) => {
          const isActive = item.name === selectedDay;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.dayItem, isActive && styles.dayItemActive]}
              onPress={() => setSelectedDay(item.name)}
            >
              <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{item.name}</Text>
              <Text style={[styles.dateText, isActive && styles.dateTextActive]}>{item.date}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredClasses}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: SIZES.padding }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          renderItem={renderClassItem}
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Ionicons name="calendar-outline" size={64} color={COLORS.surface} />
              <Text style={{ marginTop: 20, color: COLORS.textSecondary, fontSize: 16 }}>
                No classes scheduled for {selectedDay}.
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    marginVertical: 20,
  },
  dayItem: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 45,
  },
  dayItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  dayTextActive: {
    color: 'black',
    fontWeight: 'bold',
  },
  dateText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateTextActive: {
    color: 'black',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeStrip: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  timeText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ampm: {
    color: 'black',
    fontSize: 12,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trainerName: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  bookBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  fullBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bookBtnText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
