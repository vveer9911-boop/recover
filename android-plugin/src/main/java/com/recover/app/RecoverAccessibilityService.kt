package com.recover.app

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.TextView

class RecoverAccessibilityService : AccessibilityService() {
    companion object {
        private const val YOUTUBE = "com.google.android.youtube"
        private const val INSTAGRAM = "com.instagram.android"
    }

    private var shortState = "NO_SHORT_VIDEO"
    private var shortStateCount = 0

    private val handler = Handler(Looper.getMainLooper())
    private var windowManager: WindowManager? = null
    private var shortsPopup: TextView? = null
    private var blockingActivityPackage: String? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as? WindowManager
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || event.packageName == null) return

        try {
            if (!RecoverStore.focus(this)) {
                blockingActivityPackage = null
                return
            }

            val eventPackage = event.packageName.toString()

            if ((event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
                    || event.eventType == AccessibilityEvent.TYPE_WINDOWS_CHANGED)
                && eventPackage != packageName
                && eventPackage != blockingActivityPackage
            ) {
                blockingActivityPackage = null
            }

            val selected = RecoverStore.selectedPackages(this)

            if (selected.contains(eventPackage)
                && !(YOUTUBE == eventPackage && RecoverStore.blockShortsOnly(this))
            ) {
                showBlockingActivity(eventPackage)
                return
            }

            if (YOUTUBE == eventPackage && RecoverStore.blockShortsOnly(this)) {
                val root = rootInActiveWindow
                if (root != null && isShortOrReel(root)) {
                    performGlobalAction(GLOBAL_ACTION_BACK)
                    handler.postDelayed({ showShortsPopup() }, 100)
                }
            }
        } catch (_: Exception) {}
    }

    private fun showBlockingActivity(packageName: String) {
        if (packageName == blockingActivityPackage) return
        blockingActivityPackage = packageName

        val intent = Intent(this, BlockingActivity::class.java).apply {
            putExtra("blockedPackage", packageName)
            addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK or
                Intent.FLAG_ACTIVITY_CLEAR_TOP or
                Intent.FLAG_ACTIVITY_SINGLE_TOP
            )
        }

        try {
            startActivity(intent)
        } catch (_: Exception) {}
    }

    private fun showShortsPopup() {
        if (!RecoverStore.focus(this)) return
        removeShortsPopup()

        val popup = TextView(this).apply {
            text = "No Shorts during focus session"
            setTextColor(Color.WHITE)
            textSize = 14f
            gravity = Gravity.CENTER
            setPadding(dp(22), dp(12), dp(22), dp(12))
            val bg = GradientDrawable().apply {
                setColor(Color.BLACK)
                cornerRadius = dp(40).toFloat()
            }
            background = bg
        }

        val wp = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
            y = dp(90)
        }

        try {
            windowManager?.addView(popup, wp)
            shortsPopup = popup
            handler.postDelayed({ removeShortsPopup() }, 1800)
        } catch (_: Exception) {}
    }

    private fun removeShortsPopup() {
        shortsPopup?.let {
            try {
                windowManager?.removeView(it)
            } catch (_: Exception) {}
            shortsPopup = null
        }
    }

    private fun dp(value: Int): Int {
        return Math.round(value * resources.displayMetrics.density)
    }

    override fun onServiceConnected() {
        val info = serviceInfo ?: AccessibilityServiceInfo()
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or AccessibilityEvent.TYPE_WINDOWS_CHANGED
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
        info.flags = AccessibilityServiceInfo.FLAG_DEFAULT or
            AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS or
            AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS
        info.notificationTimeout = 100L
        serviceInfo = info
    }

    private fun isShortOrReel(node: AccessibilityNodeInfo): Boolean {
        val sb = StringBuilder()
        buildExactTreeSignature(node, sb)

        val packageName = node.packageName?.toString() ?: ""
        val treeStr = sb.toString()

        val detected = if (INSTAGRAM == packageName) {
            treeStr.contains("clips_viewer_view_pager")
        } else {
            treeStr.contains("reel_player_page_container") ||
            treeStr.contains("reel_progress_bar") ||
            treeStr.contains("Remix this Short") ||
            treeStr.contains("reel_time_bar")
        }

        if (detected && "IS_SHORT_VIDEO" == shortState) {
            if (++shortStateCount > 3) {
                shortStateCount = 0
                shortState = "NO_SHORT_VIDEO"
            }
            return false
        }

        if (detected) {
            shortStateCount = 1
            shortState = "IS_SHORT_VIDEO"
            return true
        }

        shortStateCount = 0
        shortState = "NO_SHORT_VIDEO"
        return false
    }

    private fun buildExactTreeSignature(node: AccessibilityNodeInfo, sb: StringBuilder) {
        sb.append(node.viewIdResourceName).append(" | ")
            .append(node.className).append(" | ")
            .append(node.text).append(" | ")
            .append(node.contentDescription).append("\n")
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            if (child != null) buildExactTreeSignature(child, sb)
        }
    }

    override fun onInterrupt() {}

    override fun onDestroy() {
        removeShortsPopup()
        handler.removeCallbacksAndMessages(null)
        blockingActivityPackage = null
        shortStateCount = 0
        shortState = "NO_SHORT_VIDEO"
        super.onDestroy()
    }
}
