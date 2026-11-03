export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      cartoApiKey: process.env.EXPO_PUBLIC_CARTO_API_KEY,
    },
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      }
    },
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      }
    }
  };
};