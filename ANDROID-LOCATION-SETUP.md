# Android Configuration for Mana Nivasam App

## Required AndroidManifest.xml Permissions

Add these permissions to your `AndroidManifest.xml` file:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.mananivasam.app">

    <!-- Required permissions for location services -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    
    <!-- Location permissions (both for better accuracy) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- Optional: For background location (if needed) -->
    <!-- <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" /> -->

    <!-- Declare features used by the app -->
    <uses-feature android:name="android.hardware.location.gps" android:required="false" />
    <uses-feature android:name="android.hardware.location.network" android:required="false" />

    <application
        android:name=".Application"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false">

        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:label="@string/app_name"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:exported="true">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Deep linking support -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="mananivasam.com" />
                <data android:scheme="http" android:host="mananivasam.com" />
            </intent-filter>
        </activity>

        <!-- Provider for file access (if needed for image uploads) -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
</manifest>
```

## For TWA (Trusted Web Activity) Configuration

If using TWA, add this to your `build.gradle`:

```gradle
dependencies {
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
}
```

And in your Digital Asset Links file (`.well-known/assetlinks.json`):

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.mananivasam.app",
    "sha256_cert_fingerprints": [
      "YOUR_APP_FINGERPRINT_HERE"
    ]
  }
}]
```

## For WebView Configuration

If using a custom WebView, add this to your MainActivity:

```java
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.Manifest;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class MainActivity extends AppCompatActivity {
    private static final int LOCATION_PERMISSION_REQUEST_CODE = 100;
    private WebView webView;
    private GeolocationPermissions.Callback geolocationCallback;
    private String geolocationOrigin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        
        // Enable JavaScript
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setGeolocationEnabled(true);
        
        // Enable location
        webSettings.setGeolocationDatabasePath(getFilesDir().getPath());

        // Set WebChromeClient for geolocation
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                geolocationCallback = callback;
                geolocationOrigin = origin;
                
                // Check if we have location permission
                if (ContextCompat.checkSelfPermission(MainActivity.this, 
                        Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                    // Request permission
                    ActivityCompat.requestPermissions(MainActivity.this,
                            new String[]{Manifest.permission.ACCESS_FINE_LOCATION, 
                                       Manifest.permission.ACCESS_COARSE_LOCATION},
                            LOCATION_PERMISSION_REQUEST_CODE);
                } else {
                    // Permission already granted
                    callback.invoke(origin, true, false);
                }
            }
        });

        webView.loadUrl("https://your-website-url.com");
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission granted
                if (geolocationCallback != null) {
                    geolocationCallback.invoke(geolocationOrigin, true, false);
                }
            } else {
                // Permission denied
                if (geolocationCallback != null) {
                    geolocationCallback.invoke(geolocationOrigin, false, false);
                }
            }
        }
    }
}
```

## Testing Location Services

1. **Enable location on device**: Settings > Location > Turn ON
2. **Grant app permissions**: Settings > Apps > Mana Nivasam > Permissions > Location > Allow
3. **Test on real device**: Emulators may have location issues
4. **Check HTTPS**: Ensure your website uses HTTPS (required for geolocation API)

## Privacy Policy Requirements

Ensure your app's privacy policy includes:
- How location data is collected
- Why location data is needed
- How location data is stored and used
- User's right to deny location access
- How to disable location services

Add this to your Google Play Console listing.
