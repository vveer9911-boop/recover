package com.recover.app

import android.app.Activity
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.Drawable
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView

class BlockingActivity : Activity() {
    private val handler = Handler(Looper.getMainLooper())
    private var titleView: TextView? = null
    private var messageView: TextView? = null
    private var iconView: ImageView? = null

    private val focusCheckRunnable = object : Runnable {
        override fun run() {
            if (!RecoverStore.focus(this@BlockingActivity)) {
                finish()
                return
            }
            handler.postDelayed(this, 350)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = Color.BLACK
        window.navigationBarColor = Color.BLACK
        render(intent)
        handler.post(focusCheckRunnable)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        render(intent)
    }

    private fun render(intent: Intent?) {
        val blockedPackage = intent?.getStringExtra("blockedPackage")
        if (blockedPackage == null || !RecoverStore.focus(this)) {
            finish()
            return
        }

        var appName = blockedPackage
        var appIcon: Drawable? = null
        try {
            val pm = packageManager
            val info: ApplicationInfo = pm.getApplicationInfo(blockedPackage, 0)
            appName = pm.getApplicationLabel(info).toString()
            appIcon = pm.getApplicationIcon(info)
        } catch (_: Exception) {}

        val attempt = RecoverStore.nextBlockAttempt(this, blockedPackage)
        val textMessage = getEnforcementMessage(blockedPackage, attempt)

        if (titleView == null) {
            buildLayout(appName, appIcon, textMessage)
        } else {
            iconView?.setImageDrawable(appIcon)
            titleView?.text = "$appName is\nBlocked by Recover"
            messageView?.text = textMessage
        }
    }

    private fun buildLayout(appName: String, appIcon: Drawable?, firstMessage: String) {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(dp(28), dp(32), dp(28), dp(28))
            setBackgroundColor(Color.BLACK)
        }

        val content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
        }

        val icon = ImageView(this).apply {
            setImageDrawable(appIcon)
            layoutParams = LinearLayout.LayoutParams(dp(84), dp(84)).apply {
                bottomMargin = dp(24)
            }
        }
        iconView = icon
        content.addView(icon)

        val title = TextView(this).apply {
            text = "$appName is\nBlocked by Recover"
            setTextColor(Color.WHITE)
            textSize = 24f
            gravity = Gravity.CENTER
            typeface = Typeface.DEFAULT_BOLD
            letterSpacing = -0.02f
        }
        titleView = title
        content.addView(title)

        val message = TextView(this).apply {
            text = firstMessage
            setTextColor(Color.parseColor("#A1A1AA"))
            textSize = 14f
            gravity = Gravity.CENTER
            setPadding(dp(12), dp(16), dp(12), dp(32))
            lineSpacingMultiplier = 1.25f
        }
        messageView = message
        content.addView(message)

        val backBtn = Button(this).apply {
            text = "BACK TO FOCUS"
            textSize = 15f
            setTextColor(Color.BLACK)
            typeface = Typeface.DEFAULT_BOLD
            val bg = GradientDrawable().apply {
                setColor(Color.WHITE)
                cornerRadius = dp(28).toFloat()
            }
            background = bg
            setOnClickListener { goHome() }
        }
        content.addView(backBtn, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(54)))

        val footer = TextView(this).apply {
            text = "Protected by Recover Study Wallet"
            setTextColor(Color.parseColor("#52525B"))
            textSize = 12f
            gravity = Gravity.CENTER
            setPadding(0, dp(20), 0, 0)
        }
        content.addView(footer)

        val screenWidth = resources.displayMetrics.widthPixels
        root.addView(content, LinearLayout.LayoutParams(Math.min(dp(380), screenWidth - dp(36)), LinearLayout.LayoutParams.WRAP_CONTENT))

        setContentView(root)
    }

    private fun getEnforcementMessage(packageName: String, attempt: Int): String {
        val i = Math.max(0, Math.min(attempt - 1, 9))
        return when (packageName) {
            "com.google.android.youtube" -> arrayOf(
                "You chose focus. YouTube is pulling you away from the work you committed to.",
                "The feed is not part of your goal. Step back and return to your study.",
                "You are giving your attention to video recommendations instead of the task at hand.",
                "Every video breaks the momentum you are working to build. Protect your time.",
                "You set this time aside for a reason. Keep your commitment to yourself.",
                "Distraction is taking your energy right now. Return your attention to your goal.",
                "Another video will not move your future forward. Your work will.",
                "Stop feeding the distraction. Put your focus back on what matters.",
                "You keep returning to YouTube while your goal is waiting. Choose your work.",
                "Enough scrolling. Protect your study time and finish what you started."
            )[i]
            "com.instagram.android" -> arrayOf(
                "You chose focus. Instagram is pulling you away from your session.",
                "The feed can wait. Return to the task you started.",
                "You are giving away your valuable study time to social algorithms.",
                "Every refresh fractures the concentration you need to succeed.",
                "You committed this block of time to yourself. Don't compromise.",
                "Social feeds are draining your momentum. Reclaim your focus.",
                "Another swipe will not build your future. Your dedication will.",
                "Stop checking stories. Step back and complete your study session.",
                "Past you made a decision to lock in. Honor that decision.",
                "Enough scrolling. Your goals demand your full presence."
            )[i]
            else -> arrayOf(
                "You chose focus. This app is pulling you away from your goal.",
                "Every interruption makes it harder to sustain the momentum you started with.",
                "You traded this time for focus. Don't trade it away for a temporary impulse.",
                "You started this session for a reason. Step back and finish your task.",
                "Your commitment to yourself matters more than a quick notification check.",
                "Protect your concentration now so you can enjoy your free time later.",
                "Another attempt will not move your work forward. Your focus will.",
                "Stop negotiating with distraction. Return to the work that counts.",
                "Your future self will thank you for closing this app right now.",
                "Enough. Protect your time and finish the focus session you started."
            )[i]
        }
    }

    private fun goHome() {
        try {
            val home = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_HOME)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(home)
        } catch (_: Exception) {}
        finish()
    }

    private fun dp(value: Int): Int {
        return Math.round(value * resources.displayMetrics.density)
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        goHome()
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        super.onDestroy()
    }
}
