import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Bhandara } from '@/types/bhandara';
import { api } from '@/utils/api';
import { locationService } from '@/utils/location';
import { BhandaraCard } from '@/components/BhandaraCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function NearbyBhandarasScreen() {
  const [bhandaras, setBhandaras] = useState<Bhandara[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearbyBhandaras = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const hasPermission = await locationService.requestPermission();
      if (!hasPermission) {
        setError(
          'Location permission is required to find nearby bhandaras. Please enable location services in your device settings.'
        );
        return;
      }

      const location = await locationService.getCurrentLocation();
      if (!location) {
        setError(
          'Unable to get your current location. Please check your location settings and try again.'
        );
        return;
      }

      const nearbyBhandaras = await api.getNearbyBhandaras(
        location.latitude,
        location.longitude
      );

      setBhandaras(nearbyBhandaras);
    } catch (err) {
      setError(
        'Failed to fetch nearby bhandaras. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchNearbyBhandaras(true);
  };

  useFocusEffect(
    useCallback(() => {
      fetchNearbyBhandaras();
    }, [])
  );

  if (loading && !refreshing) {
    return <LoadingSpinner message="Finding nearby bhandaras..." />;
  }

  if (error && !refreshing) {
    return (
      <ErrorMessage message={error} onRetry={() => fetchNearbyBhandaras()} />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Nearby Bhandaras</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://bolt.new/')}>
            <Image
              source={require('@/assets/images/badge.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Community events within 5km of your current location
        </Text>
      </View>

      {bhandaras.length === 0 && !loading && !refreshing ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No bhandaras nearby</Text>
          <Text style={styles.emptyMessage}>
            There are no community bhandaras within 5km of your current location.
            Check back later or consider organizing one yourself!
          </Text>
        </View>
      ) : (
        <FlatList
          data={bhandaras}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <BhandaraCard bhandara={item} />}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF9500']}
              tintColor="#FF9500"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginTop: 4,
  },
  icon: {
    width: 28,
    height: 28,
    marginLeft: 12,
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
