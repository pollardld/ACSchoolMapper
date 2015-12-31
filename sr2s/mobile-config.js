App.info({
  id: 'com.pollardldsr2s',
  name: 'ACSchoolMapper',
  description: 'Alameda County School Mapper application lets you track your routes to school and report any issues you see along the way. AC School Mapper is part of the Safe Routes 2 School program. Continued use of GPS running in the background can dramatically decrease battery life.',
  author: 'Alta Planning + Design',
  email: 'davidpollard@altaplanning.com',
  website: 'http://sr2s.meteor.com',
  version: '0.3.0'
});

App.accessRule('*');
/*
App.accessRule('/*');
App.accessRule('triceratops.local');
App.accessRule('*://www.openstreetmap.org/*');
App.accessRule('https://luminous-inferno-6303.firebaseio.com/*');
App.accessRule('*.firebaseio.com/*');
App.accessRule('*.mapbox.com/*');
App.accessRule('*.firebase.com/*');
App.accessRule('*.geonames.org/*');
App.accessRule('*.googleapis.com/*');
*/

App.icons({
  'iphone': 'resources/icon/ios/Icon.png',
  'iphone_2x': 'resources/icons/icon-120x120.png',
  'iphone_3x': 'resources/icons/icon-120x120@3x.png',
  'ipad': 'resources/icon/ios/AppIcon.appiconset/Icon-76.png',
  'ipad_2x': 'resources/icon/ios/AppIcon.appiconset/Icon-76@2x.png',
  'android_ldpi': 'resources/icon/android/drawable-ldpi/ic_launcher.png',
  'android_mdpi': 'resources/icon/android/drawable-mdpi/ic_launcher.png',
  'android_hdpi': 'resources/icon/android/drawable-hdpi/ic_launcher.png',
  'android_xhdpi': 'resources/icon/android/drawable-xhdpi/ic_launcher.png'
});

App.launchScreens({
  'iphone': 'resources/splash/splash-540x960.png',
  'iphone_2x': 'resources/splash/splash-640x960@2x.png',
  'iphone5': 'resources/splash/splash-640x1136@2x.png',
  'iphone6': 'resources/splash/splash-750x1334@2x.png',
  'iphone6p_portrait': 'resources/splash/splash-1242x2208@3x.png',
  'ipad_portrait': 'resources/splash/splash-768x1024.png',
  'ipad_portrait_2x': 'resources/splash/splash-1536x2048@2x.png',
  'ipad_landscape': 'resources/splash/splash-1024x768.png',
  'ipad_landscape_2x': 'resources/splash/splash-2048x1536@2x.png',
  'android_ldpi_landscape': 'resources/splash/splash-470x320.png',
  'android_ldpi_portrait': 'resources/splash/splash-320x470.png',
  'android_mdpi_landscape': 'resources/splash/splash-470x320.png',
  'android_mdpi_portrait': 'resources/splash/splash-320x470.png',
  'android_hdpi_landscape': 'resources/splash/splash-960x540.png',
  'android_hdpi_portrait': 'resources/splash/splash-640x960@2x.png',
  'android_xhdpi_landscape': 'resources/splash/splash-960x540.png',
  'android_xhdpi_portrait': 'resources/splash/splash-640x960@2x.png'
});

App.setPreference('StatusBarBackgroundColor', '#BDEAD0');
App.setPreference('BackgroundColor', '0xffBDEAD0');
App.setPreference('BackupWebStorage', 'local');
App.setPreference('Orientation', 'portrait');
