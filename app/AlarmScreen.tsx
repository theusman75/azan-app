import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import AlarmCards from './components/AlarmCards';
import usePrayerTimes from './hooks/usePrayerTimes';

const { height } = Dimensions.get('window');

export default function AlarmScreen() {
  const { data: prayerTimes } = usePrayerTimes();
  const [alarms, setAlarms] = useState<Record<string, boolean>>({});

  // Load saved alarms from AsyncStorage when the component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedAlarms = await AsyncStorage.getItem('alarms');
        if (savedAlarms) {
          setAlarms(JSON.parse(savedAlarms));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save alarms to AsyncStorage whenever they change
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
      console.log('Notification Permission Status:', status); // Debug log
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable notifications to set alarms.'
        );
      }
    };

    requestPermissions();
  }, []);

  if (!prayerTimes?.timings) {
    return (
      <View className="flex-1 bg-zinc-900 justify-center items-center">
        <Text className="text-white">Loading prayer times...</Text>
      </View>
    );
  }

  const handleSaveAlarms = async () => {
    const hasEnabledAlarms = Object.values(alarms).some(
      (isEnabled) => isEnabled
    );

    if (hasEnabledAlarms) {
      const selectedAzan =
        (await AsyncStorage.getItem('selectedAzan')) || 'Adhan Makkah'; // Default to 'Adhan Makkah'

      for (const [prayer, isEnabled] of Object.entries(alarms)) {
        if (isEnabled) {
          const time = prayerTimes.timings[prayer]; // Get prayer time
          const [hour, minute] = time.split(':').map(Number); // Parse hour and minute

          const now = new Date();
          const alarmTime = new Date();
          alarmTime.setHours(hour, minute, 0, 0);

          // If the alarm time is in the past, schedule it for the next day
          if (alarmTime <= now) {
            alarmTime.setDate(alarmTime.getDate() + 1);
          }

          // Map the selected Azan name to the corresponding file
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
              sound: selectedSound, // Use the selected sound
            },
            trigger: {
              date: alarmTime,
            },
          });
        }
      }

      Alert.alert('Success', 'Alarms have been saved successfully!');
    } else {
      Alert.alert('Set Alarm', 'Please set at least one alarm before saving.');
    }
  };

  const triggerTestNotification = async () => {
    console.log('Triggering Test Notification'); // Debug log
    try {
      const selectedSound =
        (await AsyncStorage.getItem('selectedAzan')) || 'azan1.mp3'; // Default to azan1.mp3

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Alarm',
          body: 'This is a test notification with Azan sound.',
          sound: selectedSound, // Use the selected sound
        },
        trigger: {
          seconds: 5, // Trigger after 5 seconds
        },
      });
      console.log('Notification Scheduled'); // Debug log
    } catch (error) {
      console.error('Error scheduling notification:', error); // Debug log
    }
  };

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

        <ScrollView className="flex-1">
          <AlarmCards
            prayerTimes={prayerTimes.timings}
            alarms={alarms} // Pass the saved alarms state
            onAlarmsChange={setAlarms} // Pass a callback to update alarms state
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
