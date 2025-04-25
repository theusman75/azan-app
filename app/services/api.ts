import { calculatePrayerTimes } from '../utils/PrayerTimeCalculator';
import { Coordinates } from '../types';
import { LocationService } from './location';

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

type PrayerTimesParams = {
  coords: Coordinates;
  method?: number;
};

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
      return 'University of Tehran';
    default:
      return 'Custom';
  }
}

export const PrayerTimesAPI = {
  /**
   * Fetch prayer times for current day based on coordinates using local calculator
   */
  getPrayerTimes: async ({
    coords,
    method = 3, // Default: Muslim World League
  }: PrayerTimesParams): Promise<PrayerTimesResponse> => {
    const now = new Date();
    const timings = calculatePrayerTimes(coords, now, method);

    return {
      timings,
      date: {
        readable: now.toDateString(),
        timestamp: now.getTime().toString(),
      },
      meta: {
        method: {
          id: method,
          name: getMethodName(method),
        },
      },
    };
  },

  /**
   * Auto-fetch prayer times using device location and local calculator
   */
  getPrayerTimesAutoLocation: async (): Promise<PrayerTimesResponse> => {
    const hasPermission = await LocationService.requestPermissions();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    const coords = await LocationService.getCurrentCoordinates();

    return await PrayerTimesAPI.getPrayerTimes({ coords });
  },

  /**
   * Optional: static method list for UI selection
   */
  getMethods: () => {
    return [
      { id: 1, name: 'Karachi (Hanafi)' },
      { id: 2, name: 'ISNA (North America)' },
      { id: 3, name: 'Muslim World League' },
      { id: 4, name: 'Umm al-Qura, Makkah' },
      { id: 5, name: 'Egyptian General Authority' },
      { id: 7, name: 'Tehran Institute' },
      { id: 99, name: 'Custom' },
    ];
  },
};
