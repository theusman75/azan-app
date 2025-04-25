import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculatePrayerTimes } from '../utils/PrayerTimeCalculator';
import useLocation from './useLocation';

type PrayerTimesResponse = {
  timings: Record<string, string>;
  date: {
    readable: string;
    timestamp: string;
  };
  meta: {
    method: {
      id: number;
      name: string;
    };
  };
};

type PrayerTimesState = {
  isLoading: boolean;
  error: string | null;
  data: PrayerTimesResponse | null;
  refetch: () => void;
};

const CACHE_KEY = 'cachedPrayerTimes';

export default function usePrayerTimes(
  methodId = 3, // Default to Muslim World League
  autoLocation = true
): PrayerTimesState {
  const [state, setState] = useState<PrayerTimesState>({
    isLoading: true,
    error: null,
    data: null,
    refetch: () => {},
  });

  const { location, error: locationError } = useLocation();

  const fetchPrayerTimes = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      let coords = {
        latitude: 21.4225, // Default: Makkah
        longitude: 39.8262,
      };

      if (location && autoLocation) {
        coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }

      const timings = calculatePrayerTimes(coords, new Date(), methodId);
      const now = new Date();

      const data: PrayerTimesResponse = {
        timings,
        date: {
          readable: now.toDateString(),
          timestamp: now.getTime().toString(),
        },
        meta: {
          method: {
            id: methodId,
            name: getMethodName(methodId),
          },
        },
      };

      setState({
        isLoading: false,
        error: null,
        data,
        refetch: fetchPrayerTimes,
      });

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Prayer times fetch error:', error);

      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        setState({
          isLoading: false,
          error: 'Using cached data',
          data: JSON.parse(cached),
          refetch: fetchPrayerTimes,
        });
      } else {
        setState({
          isLoading: false,
          error:
            locationError ||
            (error instanceof Error ? error.message : 'Unknown error'),
          data: null,
          refetch: fetchPrayerTimes,
        });
      }
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, [location?.coords.latitude, location?.coords.longitude, methodId]);

  return state;
}

// Optional helper to label method
function getMethodName(id: number): string {
  switch (id) {
    case 1:
      return 'University of Islamic Sciences, Karachi';
    case 2:
      return 'Islamic Society of North America';
    case 3:
      return 'Muslim World League';
    case 4:
      return 'Umm Al-Qura University, Makkah';
    case 5:
      return 'Egyptian General Authority';
    case 7:
      return 'Institute of Geophysics, University of Tehran';
    default:
      return 'Custom';
  }
}
