package com.recover.app

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

object RecoverStore {
    private const val PREFS = "recover"
    private const val END = "focus_end"
    private const val START = "focus_start"
    private const val MOOD = "mood"
    private const val BLOCK = "blocking"
    private const val APPS = "blocked_apps"
    private const val SHORTS_ONLY = "block_shorts_only"
    private const val ELAPSED = "elapsed_millis"
    private const val DURATION = "duration_minutes"
    private const val PENDING = "setup_pending"
    private const val P_MIN = "pending_minutes"
    private const val P_MOOD = "pending_mood"
    private const val P_APPS = "pending_apps"
    private const val P_SHORTS = "pending_shorts"
    private const val COMPLETED = "completed"
    private const val BLOCK_ATTEMPTS = "block_attempts"
    private const val HISTORY = "session_history"

    private fun prefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    }

    fun start(
        context: Context,
        minutes: Int,
        mood: String = "Neutral",
        apps: Set<String>,
        shortsOnly: Boolean = false
    ) {
        val now = System.currentTimeMillis()
        prefs(context).edit()
            .putLong(START, now)
            .putLong(END, now + minutes * 60_000L)
            .putLong(ELAPSED, 0L)
            .putString(MOOD, mood)
            .putStringSet(APPS, HashSet(apps))
            .putBoolean(SHORTS_ONLY, shortsOnly)
            .putBoolean(BLOCK, true)
            .putInt(DURATION, minutes)
            .putBoolean(PENDING, false)
            .putBoolean(COMPLETED, false)
            .putInt(BLOCK_ATTEMPTS, 0)
            .apply()
    }

    fun setBlockedApps(context: Context, apps: Set<String>) {
        prefs(context).edit()
            .putStringSet(APPS, HashSet(apps))
            .apply()
    }

    fun stop(context: Context) {
        val elapsed = elapsedMillis(context)
        prefs(context).edit()
            .putLong(ELAPSED, elapsed)
            .putBoolean(BLOCK, false)
            .putBoolean(COMPLETED, false)
            .remove(END)
            .remove(START)
            .remove(PENDING)
            .apply()
    }

    fun complete(context: Context) {
        val elapsed = Math.min(durationMinutes(context) * 60_000L, elapsedMillis(context))
        prefs(context).edit()
            .putLong(ELAPSED, elapsed)
            .putBoolean(BLOCK, false)
            .putBoolean(COMPLETED, true)
            .remove(END)
            .apply()
    }

    fun focus(context: Context): Boolean {
        return remaining(context) > 0 && prefs(context).getBoolean(BLOCK, false)
    }

    fun remaining(context: Context): Long {
        return Math.max(0, prefs(context).getLong(END, 0L) - System.currentTimeMillis())
    }

    fun elapsedMillis(context: Context): Long {
        val p = prefs(context)
        if (p.getBoolean(COMPLETED, false)) return p.getLong(ELAPSED, 0L)
        val start = p.getLong(START, 0L)
        if (start <= 0L) return p.getLong(ELAPSED, 0L)
        return Math.min(
            p.getInt(DURATION, 5) * 60_000L,
            Math.max(0L, System.currentTimeMillis() - start)
        )
    }

    fun durationMinutes(context: Context): Int {
        return prefs(context).getInt(DURATION, 5)
    }

    fun mood(context: Context): String {
        return prefs(context).getString(MOOD, "Neutral") ?: "Neutral"
    }

    fun blockShortsOnly(context: Context): Boolean {
        return prefs(context).getBoolean(SHORTS_ONLY, false)
    }

    fun selectedPackages(context: Context): Set<String> {
        val set = prefs(context).getStringSet(APPS, emptySet()) ?: emptySet()
        return HashSet(set)
    }

    fun nextBlockAttempt(context: Context, packageName: String?): Int {
        val p = prefs(context)
        val sessionStart = p.getLong(START, 0L)
        val safePackage = packageName?.replace("[^A-Za-z0-9_.]".toRegex(), "_") ?: "unknown"
        val key = "${BLOCK_ATTEMPTS}_${sessionStart}_$safePackage"
        val next = p.getInt(key, 0) + 1
        p.edit().putInt(key, next).apply()
        return next
    }
}
