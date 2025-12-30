import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/classes`;
const BOOK_URL = `${process.env.EXPO_PUBLIC_API_URL}/book-class`;

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ScheduleScreen({ onBack }) {
  const [selectedDay, setSelectedDay] = useState('Wed'); // Mock 'Today'
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(err => console.error('Failed to fetch classes', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleBook = (classId, title) => {
    Alert.alert('Book Class', `Confirm booking for ${title}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          fetch(BOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classId, memberId: 1 }),
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) Alert.alert('Success', data.message);
              else Alert.alert('Error', 'Booking failed.');
            })
            .catch(err => Alert.alert('Error', 'Server error'));
        },
      },
    ]);
  };

  const renderClassItem = ({ item }) => {
    // Mock filter: show all for now or randomize based on day?
    // For demo, we just show all
    const isFull = item.booked >= item.capacity;

    return (
      <View style={styles.card}>
        <View style={[styles.timeStrip, { backgroundColor: item.color || COLORS.primary }]}>
          <Text style={styles.timeText}>{item.time.split(' ')[0]}</Text>
          <Text style={styles.ampm}>{item.time.split(' ')[1]}</Text>
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
        {DAYS.map((day, index) => {
          const isActive = day === selectedDay;
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayItem, isActive && styles.dayItemActive]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{day}</Text>
              <Text style={[styles.dateText, isActive && styles.dateTextActive]}>{15 + index}</Text>
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
          data={classes}
          keyExtractor={item => item.id.toString()}
          renderItem={renderClassItem}
          contentContainerStyle={{ padding: SIZES.padding }}
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Ionicons name="calendar-outline" size={64} color={COLORS.surface} />
              <Text style={{ marginTop: 20, color: COLORS.textSecondary, fontSize: 16 }}>
                No classes scheduled for this day.
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
    color: COLORS.background,
    fontWeight: 'bold',
  },
  dateText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateTextActive: {
    color: COLORS.background,
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
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  timeText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ampm: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fullBtn: {
    backgroundColor: COLORS.border,
  },
  bookBtnText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 12,
  },
});
