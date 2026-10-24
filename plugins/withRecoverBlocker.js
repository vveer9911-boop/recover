const { withAndroidManifest, withDangerousMod, withMainApplication, withAppBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withRecoverAndroidManifest = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    // Ensure permissions
    if (!androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = [];
    }

    const permissions = androidManifest.manifest['uses-permission'];
    const addPermission = (name) => {
      if (!permissions.some((p) => p.$['android:name'] === name)) {
        permissions.push({ $: { 'android:name': name } });
      }
    };

    addPermission('android.permission.SYSTEM_ALERT_WINDOW');
    addPermission('android.permission.FOREGROUND_SERVICE');

    // Register RecoverAccessibilityService
    if (!mainApplication.service) {
      mainApplication.service = [];
    }
    const services = mainApplication.service;
    if (!services.some((s) => s.$['android:name'] === '.RecoverAccessibilityService' || s.$['android:name'] === 'com.recover.app.RecoverAccessibilityService')) {
      services.push({
        $: {
          'android:name': 'com.recover.app.RecoverAccessibilityService',
          'android:permission': 'android.permission.BIND_ACCESSIBILITY_SERVICE',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.accessibilityservice.AccessibilityService' } }],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.accessibilityservice',
              'android:resource': '@xml/accessibility_service_config',
            },
          },
        ],
      });
    }

    // Register BlockingActivity
    if (!mainApplication.activity) {
      mainApplication.activity = [];
    }
    const activities = mainApplication.activity;
    if (!activities.some((a) => a.$['android:name'] === '.BlockingActivity' || a.$['android:name'] === 'com.recover.app.BlockingActivity')) {
      activities.push({
        $: {
          'android:name': 'com.recover.app.BlockingActivity',
          'android:theme': '@android:style/Theme.NoTitleBar.Fullscreen',
          'android:launchMode': 'singleTop',
          'android:exported': 'false',
        },
      });
    }

    return config;
  });
};

const withRecoverNativeFiles = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidRoot = config.modRequest.platformProjectRoot;

      const srcDir = path.join(projectRoot, 'android-plugin', 'src', 'main');
      const targetJavaDir = path.join(androidRoot, 'app', 'src', 'main', 'java', 'com', 'recover', 'app');
      const targetXmlDir = path.join(androidRoot, 'app', 'src', 'main', 'res', 'xml');
      const targetValuesDir = path.join(androidRoot, 'app', 'src', 'main', 'res', 'values');

      fs.mkdirSync(targetJavaDir, { recursive: true });
      fs.mkdirSync(targetXmlDir, { recursive: true });
      fs.mkdirSync(targetValuesDir, { recursive: true });

      // Copy Kotlin files
      const kotlinFiles = [
        'RecoverStore.kt',
        'BlockingActivity.kt',
        'RecoverAccessibilityService.kt',
        'RecoverBlockerModule.kt',
        'RecoverBlockerPackage.kt',
      ];

      for (const file of kotlinFiles) {
        const sourcePath = path.join(srcDir, 'java', 'com', 'recover', 'app', file);
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, path.join(targetJavaDir, file));
        }
      }

      // Copy xml and strings
      const xmlSrc = path.join(srcDir, 'res', 'xml', 'accessibility_service_config.xml');
      if (fs.existsSync(xmlSrc)) {
        fs.copyFileSync(xmlSrc, path.join(targetXmlDir, 'accessibility_service_config.xml'));
      }

      const valSrc = path.join(srcDir, 'res', 'values', 'strings_recover.xml');
      if (fs.existsSync(valSrc)) {
        fs.copyFileSync(valSrc, path.join(targetValuesDir, 'strings_recover.xml'));
      }

      return config;
    },
  ]);
};

const withRecoverMainApplication = (config) => {
  return withMainApplication(config, (config) => {
    let contents = config.modResults.contents;
    if (!contents.includes('RecoverBlockerPackage')) {
      if (contents.includes('PackageList(this).packages.apply {')) {
        contents = contents.replace(
          'PackageList(this).packages.apply {',
          'PackageList(this).packages.apply {\n              add(RecoverBlockerPackage())'
        );
      } else if (contents.includes('PackageList(this).packages')) {
        contents = contents.replace(
          'PackageList(this).packages',
          'PackageList(this).packages.apply { add(RecoverBlockerPackage()) }'
        );
      }
    }
    config.modResults.contents = contents;
    return config;
  });
};

const withRecoverAppBuildGradle = (config) => {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    if (contents.includes('react {') && !contents.includes('debuggableVariants = []')) {
      contents = contents.replace(
        'react {',
        'react {\n    debuggableVariants = []'
      );
    }
    config.modResults.contents = contents;
    return config;
  });
};

function withRecoverBlocker(config) {
  config = withRecoverAndroidManifest(config);
  config = withRecoverMainApplication(config);
  config = withRecoverAppBuildGradle(config);
  config = withRecoverNativeFiles(config);
  return config;
}

module.exports = createRunOncePlugin(withRecoverBlocker, 'withRecoverBlocker', '1.0.0');
