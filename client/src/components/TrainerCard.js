import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, ALIGN } from '../constants/theme';

export default function TrainerCard({ name, specialty, rating, image, price, onBook }) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      </View>

      <View style={styles.infoContainer}>
        <View style={ALIGN.rowBetween}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={COLORS.primary} />
            <Text style={styles.rating}>{rating}</Text>
          </View>
        </View>

        <Text style={styles.specialty}>{specialty}</Text>

        <View style={[ALIGN.rowBetween, { marginTop: 12 }]}>
          <Text style={styles.price}>
            Rp {price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            <Text style={styles.perHr}>/hr</Text>
          </Text>

          <TouchableOpacity onPress={onBook}>
            <LinearGradient
              colors={[COLORS.primary, '#96E6A1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bookBtn}
            >
              <Text style={styles.bookText}>Book</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    marginRight: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  specialty: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rating: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  price: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  perHr: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: 'normal',
  },
  bookBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
