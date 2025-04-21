import { Stack } from 'expo-router';
import { View, Image, Animated, StyleSheet } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import Navigation from '@components/Navigation';
import { SettingsProvider } from '../context/SettingsContext'; // Import SettingsProvider
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font'; // Import useFonts
import './globals.css';

SplashScreen.preventAutoHideAsync(); // Prevent the splash screen from auto-hiding

export default function Layout() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity: 0

  // Load the custom font
  const [fontsLoaded] = useFonts({
    Inter: require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Start fade-in animation
      Animated.timing(fadeAnim, {
        toValue: 1, // Final opacity: 1
        duration: 2000, // Animation duration: 2 seconds
        useNativeDriver: true,
      }).start(() => {
        // Keep the splash screen visible for 30 seconds
        setTimeout(() => {
          SplashScreen.hideAsync();
          setIsSplashVisible(false);
        }, 2000); // 30 seconds delay before hiding the splash screen
      });
    }
  }, [fadeAnim, fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Don't render anything until the font is loaded
  }

  if (isSplashVisible) {
    return (
      <View style={styles.splashContainer}>
        {/* Logo */}
        <Image
          source={require('../assets/images/azan-app.png')} // Path to your logo
          style={styles.logo}
        />
        {/* App Name with Fade Animation */}
        <Animated.Text style={[styles.appName, { opacity: fadeAnim }]}>
          Azan App
        </Animated.Text>
      </View>
    );
  }

  return (
    <SettingsProvider>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#1e1e1e', // Header background color
            },
            headerTintColor: '#fff', // Header text color
            headerTitleStyle: {
              fontWeight: 'bold', // Header title font weight
              fontFamily: 'Inter', // Use the custom font
            },
            contentStyle: {
              backgroundColor: '#fff', // Screen background color
            },
            animation: 'fade', // Default animation for all screens
            animationDuration: 300, // Animation duration
            animationTypeForReplace: 'push', // Animation type for replacing screens
          }}
        >
          {/* Existing Screens */}
          <Stack.Screen
            name="index"
            options={{
              headerTitle: 'Home',
              animation: 'slide_from_left',
            }}
          />
          <Stack.Screen
            name="PrayerDetailsScreen"
            options={{
              headerTitle: 'Prayer Times',
            }}
          />
          <Stack.Screen
            name="AlarmScreen"
            options={{
              headerTitle: 'Set Alarm',
            }}
          />
          <Stack.Screen
            name="QiblaScreen"
            options={{
              headerTitle: 'Qibla',
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="SettingsScreen"
            options={{
              headerTitle: 'Settings',
              animation: 'slide_from_left',
            }}
          />
        </Stack>

        {/* Navigation Bar */}
        <Navigation />
      </View>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3F3F46', // Match the splash screen background color
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF', // Modern orange color
    fontFamily: 'english', // Use the custom font
    opacity: 1, // Ensure text is visible by default
  },
});
