import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { MapPin, Clock, Calendar, Navigation } from 'lucide-react-native';
import { Bhandara } from '@/types/bhandara';

interface BhandaraCardProps {
  bhandara: Bhandara;
}

export function BhandaraCard({ bhandara }: BhandaraCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const openDirections = () => {
    const { latitude, longitude } = bhandara;
    
    if (Platform.OS === 'web') {
      // For web, open Google Maps in browser
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      window.open(url, '_blank');
    } else {
      // For mobile, try to open native maps app first, fallback to Google Maps
      const scheme = Platform.select({
        ios: `maps:0,0?q=${latitude},${longitude}`,
        android: `geo:0,0?q=${latitude},${longitude}`,
      });
      
      const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      
      if (scheme) {
        Linking.canOpenURL(scheme).then((supported) => {
          if (supported) {
            Linking.openURL(scheme);
          } else {
            Linking.openURL(fallbackUrl);
          }
        }).catch(() => {
          Linking.openURL(fallbackUrl);
        });
      } else {
        Linking.openURL(fallbackUrl);
      }
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{bhandara.title}</Text>
        <TouchableOpacity style={styles.directionsButton} onPress={openDirections}>
          <Navigation size={16} color="#fff" />
          <Text style={styles.directionsText}>Directions</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoRow}>
        <MapPin size={16} color="#666" />
        <Text style={styles.infoText}>{bhandara.location}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Calendar size={16} color="#666" />
        <Text style={styles.infoText}>{formatDate(bhandara.date)}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Clock size={16} color="#666" />
        <Text style={styles.infoText}>
          {formatTime(bhandara.startTime)} - {formatTime(bhandara.endTime)}
        </Text>
      </View>
      
      <Text style={styles.organizer}>Organized by {bhandara.organizer}</Text>
      
      {bhandara.foodItems.length > 0 && (
        <View style={styles.foodSection}>
          <Text style={styles.foodTitle}>Food Items:</Text>
          <Text style={styles.foodItems}>{bhandara.foodItems.join(', ')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF9500',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  directionsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  organizer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
    marginTop: 8,
  },
  foodSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  foodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  foodItems: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});