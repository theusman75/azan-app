import { PrayerTimes, CalculationMethod, Coordinates, Madhab } from 'adhan';

export function calculatePrayerTimes(
  coords: Coordinates,
  date = new Date(),
  methodId = 3,
  madhab = Madhab.Shafi
) {
  // Create a new date object to avoid reference issues
  const calculationDate = new Date(date);

  // Map numeric method IDs to Adhan's CalculationMethod
  const method = getCalculationMethod(methodId);
  const params = method();
  params.madhab = madhab;

  const prayerTimes = new PrayerTimes(coords, calculationDate, params);

  return {
    Fajr: formatTime(prayerTimes.fajr),
    Sunrise: formatTime(prayerTimes.sunrise),
    Dhuhr: formatTime(prayerTimes.dhuhr),
    Asr: formatTime(prayerTimes.asr),
    Maghrib: formatTime(prayerTimes.maghrib),
    Isha: formatTime(prayerTimes.isha),
  };
}

function getCalculationMethod(methodId: number) {
  switch (methodId) {
    case 1:
      return CalculationMethod.Karachi;
    case 2:
      return CalculationMethod.NorthAmerica;
    case 3:
      return CalculationMethod.MuslimWorldLeague;
    case 4:
      return CalculationMethod.UmmAlQura;
    case 5:
      return CalculationMethod.Egyptian;
    case 7:
      return CalculationMethod.Tehran;
    default:
      return CalculationMethod.MuslimWorldLeague;
  }
}

function formatTime(date: Date) {
  // Use UTC methods to avoid timezone issues
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
