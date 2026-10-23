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
            val isEnabled = enabledServices?.any {
                it.resolveInfo.serviceInfo.packageName == reactContext.packageName &&
                it.resolveInfo.serviceInfo.name.contains("RecoverAccessibilityService")
            } ?: false
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
}
