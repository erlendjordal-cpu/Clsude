export const SLEIPNER_LOCATION = {
  name: 'Sleipner',
  latitude: Number(process.env.EXPO_PUBLIC_SLEIPNER_LAT ?? 58.37),
  longitude: Number(process.env.EXPO_PUBLIC_SLEIPNER_LON ?? 1.68),
};

export const WEATHER_USER_AGENT =
  process.env.EXPO_PUBLIC_WEATHER_USER_AGENT ?? 'SleipnerWeather/1.0';
