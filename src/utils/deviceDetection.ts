/**
 * Utility functions for detecting device and platform capabilities
 * Especially useful for handling Android WebView and PWA scenarios
 */

interface DeviceInfo {
  isAndroid: boolean;
  isIOS: boolean;
  isMobile: boolean;
  isWebView: boolean;
  isPWA: boolean;
  supportsGeolocation: boolean;
  isSecureContext: boolean;
}

/**
 * Detects if the app is running in an Android WebView
 */
export const isAndroidWebView = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  return (
    (ua.indexOf('wv') > -1 || ua.indexOf('android') > -1) &&
    (ua.indexOf('chrome') > -1 || ua.indexOf('version') > -1)
  );
};

/**
 * Detects if the app is running as a PWA (installed on home screen)
 */
export const isPWA = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Detects if running on Android
 */
export const isAndroid = (): boolean => {
  return /android/i.test(navigator.userAgent);
};

/**
 * Detects if running on iOS
 */
export const isIOS = (): boolean => {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
};

/**
 * Detects if running on mobile device
 */
export const isMobile = (): boolean => {
  return (
    window.innerWidth <= 1024 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
};

/**
 * Checks if geolocation is supported
 */
export const supportsGeolocation = (): boolean => {
  return 'geolocation' in navigator;
};

/**
 * Checks if running in a secure context (HTTPS or localhost)
 */
export const isSecureContext = (): boolean => {
  return (
    window.isSecureContext ||
    location.protocol === 'https:' ||
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1'
  );
};

/**
 * Gets comprehensive device information
 */
export const getDeviceInfo = (): DeviceInfo => {
  return {
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    isMobile: isMobile(),
    isWebView: isAndroidWebView(),
    isPWA: isPWA(),
    supportsGeolocation: supportsGeolocation(),
    isSecureContext: isSecureContext(),
  };
};

/**
 * Logs device information for debugging
 */
export const logDeviceInfo = (): void => {
  const info = getDeviceInfo();
  console.log('=== Device Information ===');
  console.log('Platform:', {
    Android: info.isAndroid,
    iOS: info.isIOS,
    Mobile: info.isMobile,
    WebView: info.isWebView,
    PWA: info.isPWA,
  });
  console.log('Capabilities:', {
    Geolocation: info.supportsGeolocation,
    SecureContext: info.isSecureContext,
  });
  console.log('User Agent:', navigator.userAgent);
  console.log('Protocol:', location.protocol);
  console.log('========================');
};

/**
 * Requests location permission with Android-specific handling
 */
export const requestLocationPermission = async (): Promise<PermissionState> => {
  try {
    if ('permissions' in navigator) {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    }
    return 'prompt';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return 'prompt';
  }
};

/**
 * Opens device location settings (Android-specific)
 */
export const openLocationSettings = (): void => {
  if (isAndroid()) {
    // For Android WebView, try to trigger settings intent
    const settingsUrl = 'android.settings.LOCATION_SOURCE_SETTINGS';
    try {
      // This will work if the WebView has proper intent handling
      window.location.href = `intent://${settingsUrl}#Intent;scheme=android.settings;end`;
    } catch (error) {
      console.warn('Could not open location settings:', error);
      // Fallback - show instructions to user
      alert(
        'Please enable location services:\n\n' +
          '1. Open Settings\n' +
          '2. Go to Location\n' +
          '3. Turn ON Location services\n' +
          '4. Return to the app and try again'
      );
    }
  } else {
    // For other platforms, show generic instructions
    alert('Please enable location services in your device settings.');
  }
};

export default {
  isAndroidWebView,
  isPWA,
  isAndroid,
  isIOS,
  isMobile,
  supportsGeolocation,
  isSecureContext,
  getDeviceInfo,
  logDeviceInfo,
  requestLocationPermission,
  openLocationSettings,
};
