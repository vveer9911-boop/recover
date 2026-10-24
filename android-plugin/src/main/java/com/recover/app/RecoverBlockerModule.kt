package com.recover.app

import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = RecoverBlockerModule.NAME)
class RecoverBlockerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "RecoverBlockerModule"
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun startFocus(minutes: Int, blockedApps: ReadableArray, promise: Promise) {
        try {
            val apps = mutableSetOf<String>()
            for (i in 0 until blockedApps.size()) {
                blockedApps.getString(i)?.let { apps.add(it) }
            }
            RecoverStore.start(reactContext, minutes, "Neutral", apps, false)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("START_FOCUS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopFocus(promise: Promise) {
        try {
            RecoverStore.stop(reactContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_FOCUS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun setBlockedApps(blockedApps: ReadableArray, promise: Promise) {
        try {
            val apps = mutableSetOf<String>()
            for (i in 0 until blockedApps.size()) {
                blockedApps.getString(i)?.let { apps.add(it) }
            }
            RecoverStore.setBlockedApps(reactContext, apps)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SET_APPS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isAccessibilityEnabled(promise: Promise) {
        try {
            val am = reactContext.getSystemService(Context.ACCESSIBILITY_SERVICE) as? AccessibilityManager
            val enabledServices = am?.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)
            val fromManager = enabledServices?.any {
                it.resolveInfo.serviceInfo.packageName == reactContext.packageName &&
                it.resolveInfo.serviceInfo.name.contains("RecoverAccessibilityService")
            } ?: false

            if (fromManager) {
                promise.resolve(true)
                return
            }

            // Fallback check in Secure settings string for all OEMs
            val settingVal = Settings.Secure.getString(
                reactContext.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: ""
            val isEnabled = settingVal.contains("${reactContext.packageName}/") ||
                settingVal.contains("RecoverAccessibilityService")
            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openAccessibilitySettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("OPEN_SETTINGS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isOverlayEnabled(promise: Promise) {
        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                promise.resolve(Settings.canDrawOverlays(reactContext))
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openOverlaySettings(promise: Promise) {
        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    android.net.Uri.parse("package:" + reactContext.packageName)
                ).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            try {
                val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(intent)
                promise.resolve(true)
            } catch (ex: Exception) {
                promise.reject("OPEN_OVERLAY_ERROR", ex.message, ex)
            }
        }
    }
}
