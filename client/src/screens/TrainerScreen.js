import React, { useState, useEffect } from 'react';
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
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { API_ENDPOINTS } from '../utils/api';
import TrainerCard from '../components/TrainerCard';
import axios from 'axios';

export default function TrainerScreen({ selectedMembership, onBack }) {
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [trainers, setTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    minRating: '',
    maxPrice: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    minRating: '',
    maxPrice: '',
  });

  useEffect(() => {
    fetchSpecialties();
  }, [selectedMembership]);

  useEffect(() => {
    fetchTrainers();
  }, [selectedMembership, searchQuery, selectedCategory, appliedFilters]);

  const fetchSpecialties = async () => {
    try {
      const gymId = selectedMembership?.Gym?.id || selectedMembership?.gymId;
      if (!gymId) return;

      // Use the new API endpoint
      const response = await axios.get(API_ENDPOINTS.specialties, { params: { gymId } });
      // Assume response.data is array of objects { id, name, gymId }
      const distinctNames = ['All', ...new Set(response.data.map(s => s.name))];
      setCategories(distinctNames);
    } catch (err) {
      console.log('Failed to fetch specialties, using default', err);
      // Fallback or keep 'All'
    }
  };

  const fetchTrainers = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const gymId = selectedMembership?.Gym?.id || selectedMembership?.gymId;

      if (!gymId) {
        Alert.alert('Error', 'Gym information not available');
        setIsLoading(false);
        return;
      }

      const response = await axios.get(API_ENDPOINTS.trainers, {
        params: {
          gymId,
          search: searchQuery,
          specialty: selectedCategory,
          minRating: appliedFilters.minRating,
          maxPrice: appliedFilters.maxPrice,
        },
      });
      setTrainers(response.data);
    } catch (err) {
      console.error('Failed to fetch trainers:', err);
      Alert.alert('Error', 'Failed to load trainers. Please try again.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchTrainers(false), fetchSpecialties()]);
    setRefreshing(false);
  }, [selectedMembership, searchQuery, selectedCategory, appliedFilters]);

  const handleBook = (trainerId, trainerName) => {
    Alert.alert('Select Booking Type', `How would you like to train with ${trainerName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Single Session',
        onPress: () => processBooking(trainerId, 'single'),
      },
      {
        text: '10-Session Package',
        onPress: () => processBooking(trainerId, 'package'),
      },
    ]);
  };

  const processBooking = async (trainerId, bookingType) => {
    try {
      const response = await axios.post(API_ENDPOINTS.bookTrainer, {
        trainerId,
        memberId: 1, // Hardcoded for now, should ideally come from Context/Auth
        date: new Date().toISOString(),
        bookingType,
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
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    setIsFilterVisible(false);
  };

  const clearFilters = () => {
    setFilters({ minRating: '', maxPrice: '' });
    setAppliedFilters({ minRating: '', maxPrice: '' });
    setIsFilterVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.padding}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Trainers</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search & Filter */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <View style={[styles.searchContainer, { flex: 1, marginBottom: 0 }]}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Search trainers..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setIsFilterVisible(true)}>
            <Ionicons name="options-outline" size={24} color={COLORS.text} />
            {(appliedFilters.minRating || appliedFilters.maxPrice) && (
              <View style={styles.activeFilterBadge} />
            )}
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.categoryContainer}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === item && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === item && styles.categoryTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* List */}
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={trainers}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
              />
            }
            renderItem={({ item }) => (
              <TrainerCard {...item} onBook={() => handleBook(item.id, item.name)} />
            )}
            ListEmptyComponent={() => (
              <View style={{ alignItems: 'center', marginTop: 50 }}>
                <Ionicons name="people-outline" size={64} color={COLORS.surface} />
                <Text style={{ marginTop: 20, color: COLORS.textSecondary, fontSize: 16 }}>
                  No trainers found matching your criteria.
                </Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setIsFilterVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Trainers</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Minimum Rating</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g. 4.5"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
                value={filters.minRating}
                onChangeText={text => setFilters({ ...filters, minRating: text })}
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Maximum Price (IDR)</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g. 150000"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
                value={filters.maxPrice}
                onChangeText={text => setFilters({ ...filters, maxPrice: text })}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  {
                    flex: 1,
                    backgroundColor: COLORS.surface,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  },
                ]}
                onPress={clearFilters}
              >
                <Text style={[styles.applyButtonText, { color: COLORS.text }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.applyButton, { flex: 1 }]} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterBtn: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  activeFilterBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
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
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.background,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
  },
  filterInput: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
