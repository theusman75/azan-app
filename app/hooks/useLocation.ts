import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

type LocationState = {
  location: Location.LocationObject | null;
  error: string | null;
};

export default function useLocation(): LocationState {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission not granted');
          return;
        }

        const loc = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Location request timed out')),
              7000
            )
          ),
        ]);

        setLocation(loc as Location.LocationObject);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    getLocation();
  }, []);

  return { location, error };
}
