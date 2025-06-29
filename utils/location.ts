import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export const locationService = {
  async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // For web platform, use browser geolocation
        return new Promise((resolve) => {
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              () => resolve(true),
              () => resolve(false)
            );
          } else {
            resolve(false);
          }
        });
      } else {
        // For mobile platforms
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  },

  async getCurrentLocation(): Promise<LocationCoords | null> {
    try {
      if (Platform.OS === 'web') {
        // For web platform, use browser geolocation
        return new Promise((resolve) => {
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
              },
              (error) => {
                console.error('Geolocation error:', error);
                resolve(null);
              }
            );
          } else {
            resolve(null);
          }
        });
      } else {
        // For mobile platforms
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  },
};