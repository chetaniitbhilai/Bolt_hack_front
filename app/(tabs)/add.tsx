import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock, MapPin, User, UtensilsCrossed, Navigation } from 'lucide-react-native';
import { CreateBhandaraRequest } from '@/types/bhandara';
import { api } from '@/utils/api';
import { locationService } from '@/utils/location';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AddBhandaraScreen() {
  const [formData, setFormData] = useState<Partial<CreateBhandaraRequest>>({
    title: '',
    location: '',
    organizer: '',
    foodItems: [],
  });
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [foodItemInput, setFoodItemInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const selected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      
      if (selected >= today) {
        setDate(selectedDate);
      } else {
        Alert.alert('Invalid Date', 'Please select a date from today onwards.');
      }
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const now = new Date();
      const selectedDate = new Date(date);
      const isToday = selectedDate.toDateString() === now.toDateString();
      
      if (!isToday || selectedTime >= now) {
        setStartTime(selectedTime);
        // Auto-adjust end time to be at least 1 hour after start time
        const newEndTime = new Date(selectedTime.getTime() + 60 * 60 * 1000);
        setEndTime(newEndTime);
      } else {
        Alert.alert('Invalid Time', 'Please select a time from now onwards.');
      }
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      if (selectedTime > startTime) {
        setEndTime(selectedTime);
      } else {
        Alert.alert('Invalid Time', 'End time must be after start time.');
      }
    }
  };

  const addFoodItem = () => {
    if (foodItemInput.trim()) {
      const currentItems = formData.foodItems || [];
      setFormData({
        ...formData,
        foodItems: [...currentItems, foodItemInput.trim()],
      });
      setFoodItemInput('');
    }
  };

  const removeFoodItem = (index: number) => {
    const currentItems = formData.foodItems || [];
    setFormData({
      ...formData,
      foodItems: currentItems.filter((_, i) => i !== index),
    });
  };

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      const hasPermission = await locationService.requestPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Location permission is required to get your current location.'
        );
        return;
      }

      const location = await locationService.getCurrentLocation();
      if (location) {
        setFormData({
          ...formData,
          latitude: location.latitude,
          longitude: location.longitude,
        });
        // Clear manual inputs when auto-location is used
        setManualLat('');
        setManualLon('');
        setShowManualCoords(false);
        Alert.alert('Success', 'Location captured successfully!');
      } else {
        Alert.alert('Error', 'Unable to get your current location.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);

    if (isNaN(lat) || isNaN(lon)) {
      Alert.alert('Invalid Coordinates', 'Please enter valid latitude and longitude values.');
      return;
    }

    if (lat < -90 || lat > 90) {
      Alert.alert('Invalid Latitude', 'Latitude must be between -90 and 90 degrees.');
      return;
    }

    if (lon < -180 || lon > 180) {
      Alert.alert('Invalid Longitude', 'Longitude must be between -180 and 180 degrees.');
      return;
    }

    setFormData({
      ...formData,
      latitude: lat,
      longitude: lon,
    });

    Alert.alert('Success', 'Manual coordinates set successfully!');
  };

  const clearCoordinates = () => {
    setFormData({
      ...formData,
      latitude: undefined,
      longitude: undefined,
    });
    setManualLat('');
    setManualLon('');
    setShowManualCoords(false);
  };

  const validateForm = (): boolean => {
    if (!formData.title?.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for the bhandara.');
      return false;
    }
    if (!formData.location?.trim()) {
      Alert.alert('Validation Error', 'Please enter the location.');
      return false;
    }
    if (!formData.organizer?.trim()) {
      Alert.alert('Validation Error', 'Please enter the organizer name.');
      return false;
    }
    if (!formData.latitude || !formData.longitude) {
      Alert.alert('Validation Error', 'Please capture your location or enter coordinates manually.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const bhandaraData: CreateBhandaraRequest = {
        title: formData.title!,
        location: formData.location!,
        date: date.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        organizer: formData.organizer!,
        foodItems: formData.foodItems || [],
        latitude: formData.latitude!,
        longitude: formData.longitude!,
      };

      await api.createBhandara(bhandaraData);
      
      Alert.alert(
        'Success!',
        'Your bhandara has been created successfully. Community members nearby will be able to see it.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                title: '',
                location: '',
                organizer: '',
                foodItems: [],
              });
              setDate(new Date());
              setStartTime(new Date());
              setEndTime(new Date());
              setManualLat('');
              setManualLon('');
              setShowManualCoords(false);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create bhandara. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Creating your bhandara..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Bhandara</Text>
        <Text style={styles.subtitle}>
          Share the joy of community dining
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="e.g., Community Langar, Temple Prasad"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              placeholder="e.g., Gurudwara Sahib, Temple Hall"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Organizer *</Text>
            <View style={styles.inputWithIcon}>
              <User size={20} color="#666" />
              <TextInput
                style={styles.inputWithIconText}
                value={formData.organizer}
                onChangeText={(text) => setFormData({ ...formData, organizer: text })}
                placeholder="Your name or organization"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color="#666" />
                <Text style={styles.dateTimeText}>
                  {date.toLocaleDateString('en-IN')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Start Time *</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Clock size={20} color="#666" />
                <Text style={styles.dateTimeText}>
                  {startTime.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>End Time *</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Clock size={20} color="#666" />
                <Text style={styles.dateTimeText}>
                  {endTime.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location Coordinates *</Text>
            
            {/* Current coordinates display */}
            {formData.latitude && formData.longitude && (
              <View style={styles.coordinatesDisplay}>
                <Navigation size={16} color="#FF9500" />
                <Text style={styles.coordinatesText}>
                  {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </Text>
                <TouchableOpacity onPress={clearCoordinates} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Auto-capture location button */}
            <TouchableOpacity
              style={[
                styles.locationButton,
                formData.latitude ? styles.locationButtonSuccess : {},
              ]}
              onPress={getLocation}
              disabled={locationLoading}
            >
              <MapPin size={20} color={formData.latitude ? "#fff" : "#FF9500"} />
              <Text style={[
                styles.locationButtonText,
                formData.latitude ? styles.locationButtonTextSuccess : {},
              ]}>
                {locationLoading
                  ? 'Getting location...'
                  : formData.latitude
                  ? 'Location captured'
                  : 'Capture current location'}
              </Text>
            </TouchableOpacity>

            {/* Manual coordinates toggle */}
            <TouchableOpacity
              style={styles.manualToggleButton}
              onPress={() => setShowManualCoords(!showManualCoords)}
            >
              <Text style={styles.manualToggleText}>
                {showManualCoords ? 'Hide manual entry' : 'Enter coordinates manually'}
              </Text>
            </TouchableOpacity>

            {/* Manual coordinates input */}
            {showManualCoords && (
              <View style={styles.manualCoordsContainer}>
                <View style={styles.coordRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8, marginBottom: 0 }]}>
                    <Text style={styles.coordLabel}>Latitude</Text>
                    <TextInput
                      style={styles.coordInput}
                      value={manualLat}
                      onChangeText={setManualLat}
                      placeholder="e.g., 28.6139"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8, marginBottom: 0 }]}>
                    <Text style={styles.coordLabel}>Longitude</Text>
                    <TextInput
                      style={styles.coordInput}
                      value={manualLon}
                      onChangeText={setManualLon}
                      placeholder="e.g., 77.2090"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.setCoordinatesButton}
                  onPress={handleManualCoordinates}
                >
                  <Text style={styles.setCoordinatesText}>Set Coordinates</Text>
                </TouchableOpacity>
                <Text style={styles.coordsHint}>
                  Tip: You can get coordinates from Google Maps by right-clicking on a location
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Food Items</Text>
            <View style={styles.foodInputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={foodItemInput}
                onChangeText={setFoodItemInput}
                placeholder="e.g., Dal, Rice, Sabzi"
                placeholderTextColor="#999"
                onSubmitEditing={addFoodItem}
              />
              <TouchableOpacity style={styles.addButton} onPress={addFoodItem}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            
            {formData.foodItems && formData.foodItems.length > 0 && (
              <View style={styles.foodItemsList}>
                {formData.foodItems.map((item, index) => (
                  <View key={index} style={styles.foodItem}>
                    <UtensilsCrossed size={16} color="#666" />
                    <Text style={styles.foodItemText}>{item}</Text>
                    <TouchableOpacity
                      onPress={() => removeFoodItem(index)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Create Bhandara</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartTimeChange}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndTimeChange}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWithIconText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 12,
  },
  coordinatesDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0f0ff',
  },
  coordinatesText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  clearButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF9500',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  locationButtonSuccess: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  locationButtonText: {
    fontSize: 16,
    color: '#FF9500',
    marginLeft: 12,
    fontWeight: '600',
  },
  locationButtonTextSuccess: {
    color: '#fff',
  },
  manualToggleButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  manualToggleText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  manualCoordsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  coordLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  coordInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  setCoordinatesButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
  },
  setCoordinatesText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  coordsHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  foodInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  foodItemsList: {
    marginTop: 12,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  foodItemText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    marginLeft: 8,
  },
  removeButton: {
    backgroundColor: '#FF6B35',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});