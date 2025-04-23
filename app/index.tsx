import { Link } from 'expo-router';
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { getNextPrayer } from '@utils/prayerUtils';
import usePrayerTimes from './hooks/usePrayerTimes';
import { parse } from 'date-fns';
import { useEffect, useState } from 'react';
import { formatPrayerTime } from '@utils/date';
import { Asset } from 'expo-asset';
import Carousel from '@components/Carousel';
import { MaterialIcons } from '@expo/vector-icons'; // Import fallback icon

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  // State for carousel content
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch content for the carousel
  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Use real or mock data
        const mockContent = [
          {
            id: '1',
            type: 'Quran',
            content:
              '“Indeed, prayer prohibits immorality and wrongdoing.”\n— [Quran 29:45]',
          },
          {
            id: '2',
            type: 'Hadith',
            content:
              '“The best among you are those who learn the Qur’an and teach it.”\n— Prophet Muhammad (ﷺ)',
          },
          {
            id: '3',
            type: 'Wisdom',
            content:
              '“And whoever puts their trust in Allah, He will be enough for them.”\n— [Quran 65:3]',
          },
          {
            id: '4',
            type: 'Add Name',
            content:
              'Place addvertisement here.\n\nThis is a placeholder for your ad content.',
          },
        ];

        setContent(mockContent);
      } catch (error) {
        console.error('Error setting mock data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Preload image asset
  useEffect(() => {
    Asset.fromModule(
      require('../assets/images/arabic-texture.jpg')
    ).downloadAsync();
  }, []);

  // 1. Fetch prayer times
  const { isLoading, error, data: prayerTimes, refetch } = usePrayerTimes();

  // 2. Determine next prayer
  const [nextPrayer, setNextPrayer] = useState<{
    name: string;
    time: string;
  } | null>(null);

  // 3. Real-time countdown state
  const [countdown, setCountdown] = useState('');

  // Update next prayer when data loads
  useEffect(() => {
    if (prayerTimes?.timings) {
      const next = getNextPrayer(prayerTimes.timings);
      setNextPrayer(next);
    }
  }, [prayerTimes]);

  // Live countdown effect
  useEffect(() => {
    if (!nextPrayer) return;

    const updateCountdown = () => {
      try {
        const now = new Date();
        const prayerDate = parse(nextPrayer.time, 'HH:mm', now);
        let diff = prayerDate.getTime() - now.getTime();

        // Handle next-day prayers
        if (diff <= 0) {
          prayerDate.setDate(prayerDate.getDate() + 1);
          diff = prayerDate.getTime() - now.getTime();
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown(
          hours > 0
            ? `${hours}h ${minutes}m remaining`
            : `${minutes}m ${seconds}s remaining`
        );
      } catch {
        setCountdown('--:--');
      }
    };

    // Initial update
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer]);

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-zinc-900">
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text className="text-white mt-4">Fetching prayer times...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-zinc-900 px-6">
        <Text className="text-red-400 text-lg mb-4 text-center">
          Failed to load prayer times
        </Text>
        <TouchableOpacity
          onPress={refetch}
          className="bg-amber-500 rounded-lg px-6 py-3"
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main render
  return (
    <ImageBackground
      source={require('../assets/images/header.jpg')}
      resizeMode="cover"
      className="flex-1"
      style={{ height, width: '100%' }}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        {/* Fallback Icon */}
        <MaterialIcons
          name="sunny"
          size={80}
          color="#fbbf24"
          style={{ marginBottom: 10 }}
        />

        <Text className="text-4xl font-semibold text-amber-500 mb-2 text-center">
          السلام عليكم
        </Text>
        <Text className="text-4xl font-semibold text-white mb-4 text-center">
          Welcome to Azan App
        </Text>
        <Text className="text-lg text-zinc-300 mb-10 text-center">
          Your daily prayer times, always on time.
        </Text>

        {/* Carousel with Content */}
        <View className="px-4 mt-2">
          {!loading && <Carousel content={content} />}
        </View>

        {nextPrayer && (
          <View className="bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mt-6 w-[80%]">
            <Text className="text-center text-amber-400 text-sm font-medium">
              Next: <Text className="font-bold">{nextPrayer.name}</Text> at{' '}
              {formatPrayerTime(nextPrayer.time)}
            </Text>

            {/* Optional countdown timer */}
            <Text className="text-center text-amber-500/80 text-xs mt-1">
              {countdown}
            </Text>
          </View>
        )}

        <Link href="/PrayerDetailsScreen" asChild>
          <TouchableOpacity className="bg-white rounded-xl mt-6 px-6 py-3 shadow-lg">
            <Text className="text-zinc-900 text-lg font-semibold">
              Get Started
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ImageBackground>
  );
}
