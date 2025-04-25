import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import AlarmCards from './components/AlarmCards';
import usePrayerTimes from './hooks/usePrayerTimes';
import useLocation from './hooks/useLocation'; // ✅ Make sure this import is correct

const { height } = Dimensions.get('window');

export default function AlarmScreen() {
  const { data: prayerTimes, isLoading, error, refetch } = usePrayerTimes();
  const { error: locationError } = useLocation(); // ✅ Hook must be inside the component
  const [alarms, setAlarms] = useState<Record<string, boolean>>({});

  // Load saved alarms
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedAlarms = await AsyncStorage.getItem('alarms');
        if (savedAlarms) {
          setAlarms(JSON.parse(savedAlarms));
        }
      } catch (error) {
        console.error('Failed to load alarms:', error);
      }
    };

    loadSettings();
  }, []);

  // Save alarms on change
  useEffect(() => {
    const saveAlarms = async () => {
      try {
        await AsyncStorage.setItem('alarms', JSON.stringify(alarms));
      } catch (error) {
        console.error('Failed to save alarms:', error);
      }
    };

    saveAlarms();
  }, [alarms]);

  // Request notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable notifications to set alarms.'
        );
      }
    };

    requestPermissions();
  }, []);

  // Save Alarms
  const handleSaveAlarms = async () => {
    const hasEnabledAlarms = Object.values(alarms).some(Boolean);

    if (!hasEnabledAlarms) {
      return Alert.alert(
        'Set Alarm',
        'Please set at least one alarm before saving.'
      );
    }

    const selectedAzan =
      (await AsyncStorage.getItem('selectedAzan')) || 'Adhan Makkah';

    for (const [prayer, isEnabled] of Object.entries(alarms)) {
      if (!isEnabled) continue;

      const time = prayerTimes?.timings?.[prayer];
      if (!time) continue;

      const [hour, minute] = time.split(':').map(Number);
      const now = new Date();
      const alarmTime = new Date();
      alarmTime.setHours(hour, minute, 0, 0);

      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
      }

      const azanFileMap = {
        'Adhan Makkah': 'azan1.mp3',
        'Adhan Madinah': 'azan2.mp3',
        'Adhan Egypt': 'azan3.mp3',
        'Adhan Turkey': 'azan4.mp3',
      };

      const selectedSound = azanFileMap[selectedAzan] || 'azan1.mp3';

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${prayer} Alarm`,
          body: `It's time for ${prayer}!`,
          sound: selectedSound,
        },
        trigger: {
          date: alarmTime,
        },
      });
    }

    Alert.alert('Success', 'Alarms have been saved successfully!');
  };

  // Test notification
  const triggerTestNotification = async () => {
    const selectedSound =
      (await AsyncStorage.getItem('selectedAzan')) || 'azan1.mp3';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Alarm',
        body: 'This is a test notification with Azan sound.',
        sound: selectedSound,
      },
      trigger: {
        seconds: 5,
      },
    });
  };

  // Loading UI
  if (!prayerTimes?.timings && isLoading) {
    return (
      <View className="flex-1 bg-zinc-900 justify-center items-center">
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text className="text-white mt-4">Loading prayer times...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/home.jpg')}
      resizeMode="cover"
      className="flex-1"
      style={{ height }}
    >
      <View className="flex-1 p-2">
        <Text className="text-white text-2xl mt-10 font-bold mb-6 text-center">
          Prayer Alarms
        </Text>

        {/* Location error */}
        {locationError && (
          <View className="bg-red-500/40 p-2 rounded-lg mx-4 mb-2 mt-[-8px]">
            <Text className="text-white text-center text-sm">
              Location Error: {locationError}. Please enable location services.
            </Text>
          </View>
        )}

        {/* API error */}
        {error && (
          <View className="bg-red-500/60 p-2 rounded-lg mx-4 mb-4">
            <Text className="text-white text-center text-sm">{error}</Text>
            <TouchableOpacity onPress={refetch}>
              <View className="mt-2 bg-white/10 py-2 px-4 rounded-md">
                <Text className="text-white text-center">Retry</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView className="flex-1">
          <AlarmCards
            prayerTimes={prayerTimes?.timings || {}}
            alarms={alarms}
            onAlarmsChange={setAlarms}
          />

          <View className="mt-8 px-4">
            <TouchableOpacity onPress={handleSaveAlarms}>
              <View className="bg-amber-500 rounded-xl px-6 py-3">
                <Text className="text-white font-semibold text-center">
                  Save Alarms
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="mt-4 px-4">
            <TouchableOpacity onPress={triggerTestNotification}>
              <View className="bg-blue-500 rounded-xl px-6 py-3">
                <Text className="text-white font-semibold text-center">
                  Test Notification
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View className="my-2 p-4 bg-black/50 rounded-lg">
          <Text className="text-center text-zinc-300 text-2xl">
            Place Add Here
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}
