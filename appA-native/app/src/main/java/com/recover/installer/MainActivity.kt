package com.recover.installer

import android.app.Activity
import android.app.AlertDialog
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class MainActivity : Activity() {

    private var thinkingOrbs: ThinkingOrbsView? = null
    private var statusText: TextView? = null
    private var descText: TextView? = null
    private var actionBtn: Button? = null

    private var isInstalling = false

    // Fallback release URL if APK is not bundled in assets
    private val remoteDownloadUrl = "https://github.com/vveer9911-boop/recover/releases/latest/download/App-B-Recover-Wallet.apk"

    private val installStatusReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                InstallReceiver.ACTION_INSTALL_SUCCESS -> {
                    showCompletedUi()
                }
                InstallReceiver.ACTION_INSTALL_FAILED -> {
                    val msg = intent.getStringExtra(InstallReceiver.EXTRA_MESSAGE) ?: "Installation failed"
                    showFailedUi(msg)
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = Color.BLACK
        window.navigationBarColor = Color.BLACK
        buildUi()
    }

    override fun onResume() {
        super.onResume()
        val filter = IntentFilter().apply {
            addAction(InstallReceiver.ACTION_INSTALL_SUCCESS)
            addAction(InstallReceiver.ACTION_INSTALL_FAILED)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(installStatusReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(installStatusReceiver, filter)
        }

        val prefs = getSharedPreferences(InstallReceiver.PREFS_NAME, Context.MODE_PRIVATE)
        val isUpdated = prefs.getBoolean(InstallReceiver.KEY_IS_UPDATED, false)

        if (isUpdated) {
            showCompletedUi()
        } else if (!isInstalling) {
            updateDefaultState()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            unregisterReceiver(installStatusReceiver)
        } catch (_: Exception) {}
    }

    private fun isAppInstalled(pkg: String): Boolean {
        return try {
            packageManager.getPackageInfo(pkg, 0)
            true
        } catch (e: Exception) {
            false
        }
    }

    private fun buildUi() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.BLACK)
            gravity = Gravity.CENTER_HORIZONTAL
            setPadding(dp(28), dp(48), dp(28), dp(36))
        }

        val topSpacer = View(this)
        root.addView(topSpacer, LinearLayout.LayoutParams(-1, 0, 1.0f))

        // Title: recover
        val title = TextView(this).apply {
            text = "recover"
            setTextColor(Color.WHITE)
            textSize = 36f
            gravity = Gravity.CENTER
            typeface = Typeface.DEFAULT_BOLD
            letterSpacing = -0.04f
        }
        root.addView(title)

        val subtitle = TextView(this).apply {
            text = "Your path to distraction-free focus"
            setTextColor(Color.parseColor("#A1A1AA"))
            textSize = 15f
            gravity = Gravity.CENTER
            setPadding(0, dp(8), 0, 0)
        }
        root.addView(subtitle)

        val midSpacer = View(this)
        root.addView(midSpacer, LinearLayout.LayoutParams(-1, 0, 1.2f))

        // Thinking Orbs Bottom Loader (Jakubantalik/thinking-orbs)
        thinkingOrbs = ThinkingOrbsView(this).apply {
            visibility = View.GONE
            val lp = LinearLayout.LayoutParams(dp(160), dp(160)).apply {
                gravity = Gravity.CENTER_HORIZONTAL
                bottomMargin = dp(16)
            }
            layoutParams = lp
        }
        root.addView(thinkingOrbs)

        // Status text displayed during updating and when completed
        statusText = TextView(this).apply {
            text = ""
            setTextColor(Color.parseColor("#38BDF8"))
            textSize = 16f
            gravity = Gravity.CENTER
            typeface = Typeface.DEFAULT_BOLD
            visibility = View.GONE
            setPadding(dp(16), 0, dp(16), dp(18))
        }
        root.addView(statusText)

        // Description text
        descText = TextView(this).apply {
            text = "Manage distracting apps, complete focus sessions, and earn credits toward temporary screen-time unlocks."
            setTextColor(Color.parseColor("#71717A"))
            textSize = 13f
            gravity = Gravity.CENTER
            setLineSpacing(0f, 1.3f)
            setPadding(dp(12), 0, dp(12), dp(24))
        }
        root.addView(descText)

        // Primary Action Button
        actionBtn = Button(this).apply {
            val appInstalled = isAppInstalled("com.recover.app")
            text = if (appInstalled) "Update App" else "Continue"
            setTextColor(Color.BLACK)
            textSize = 16f
            typeface = Typeface.DEFAULT_BOLD
            val bg = GradientDrawable().apply {
                setColor(Color.WHITE)
                cornerRadius = dp(28).toFloat()
            }
            background = bg
            setOnClickListener { onActionClicked() }
        }
        root.addView(actionBtn, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(54)))

        setContentView(root)
    }

    private fun updateDefaultState() {
        val appInstalled = isAppInstalled("com.recover.app")
        actionBtn?.apply {
            visibility = View.VISIBLE
            isEnabled = true
            text = if (appInstalled) "Update App" else "Continue"
            setTextColor(Color.BLACK)
            val bg = GradientDrawable().apply {
                setColor(Color.WHITE)
                cornerRadius = dp(28).toFloat()
            }
            background = bg
            setOnClickListener { onActionClicked() }
        }
        descText?.apply {
            visibility = View.VISIBLE
            text = if (appInstalled) {
                "Update Recover Study Wallet to apply the latest optimizations while preserving all your credits and settings."
            } else {
                "Manage distracting apps, complete focus sessions, and earn credits toward temporary screen-time unlocks."
            }
        }
        statusText?.visibility = View.GONE
        thinkingOrbs?.reset()
    }

    private fun onActionClicked() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (!packageManager.canRequestPackageInstalls()) {
                val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                    data = Uri.parse("package:$packageName")
                }
                startActivity(intent)
                Toast.makeText(this, "Please allow Recover Installer to proceed", Toast.LENGTH_SHORT).show()
                return
            }
        }

        showConfirmDialog()
    }

    private fun showConfirmDialog() {
        val isUpdate = isAppInstalled("com.recover.app")
        val dialogView = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(20), dp(20), dp(8))
        }

        val dTitle = TextView(this).apply {
            text = if (isUpdate) "Update Recover?" else "Allow Installing App?"
            textSize = 17f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.BLACK)
            gravity = Gravity.CENTER
        }
        dialogView.addView(dTitle)

        val dMsg = TextView(this).apply {
            text = if (isUpdate) {
                "Update “Recover” with the latest improvements. All your focus sessions, coin balances, and accessibility rules will stay preserved."
            } else {
                "Allow “Recover” to install and configure focus rules on your device so that distraction blocking, focus sessions, and screen-time unlock features work properly."
            }
            textSize = 13f
            setTextColor(Color.parseColor("#3C3C43"))
            gravity = Gravity.CENTER
            setPadding(0, dp(8), 0, dp(16))
            setLineSpacing(0f, 1.25f)
        }
        dialogView.addView(dMsg)

        val builder = AlertDialog.Builder(this)
        builder.setView(dialogView)
        builder.setNegativeButton("Deny") { d, _ -> d.dismiss() }
        builder.setPositiveButton(if (isUpdate) "Update" else "Allow") { d, _ ->
            d.dismiss()
            startPackageSessionInstall()
        }
        builder.show()
    }

    private fun startPackageSessionInstall() {
        isInstalling = true

        getSharedPreferences(InstallReceiver.PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(InstallReceiver.KEY_IS_UPDATED, false)
            .apply()

        // Hide idle description and action button to highlight thinking orbs loader
        descText?.visibility = View.GONE
        actionBtn?.visibility = View.GONE

        // Start thinking orbs loader with exact "Updating..." text
        thinkingOrbs?.startUpdating()
        statusText?.apply {
            visibility = View.VISIBLE
            text = "Updating..."
            setTextColor(Color.parseColor("#38BDF8"))
            textSize = 16f
            typeface = Typeface.DEFAULT_BOLD
        }

        thread {
            try {
                val assetApkName = "recover-study-wallet.apk"
                val localApk = File(cacheDir, "recover-study-wallet.apk")
                var fileSize: Long

                // 1. Extract bundled asset first
                if (!localApk.exists() || localApk.length() < 1_000_000) {
                    try {
                        assets.open(assetApkName).use { inS ->
                            FileOutputStream(localApk).use { outS ->
                                val buffer = ByteArray(65536)
                                var read: Int
                                while (inS.read(buffer).also { read = it } != -1) {
                                    outS.write(buffer, 0, read)
                                }
                                outS.flush()
                            }
                        }
                    } catch (_: Exception) {
                        // Assets missing or fallback to remote
                    }
                }

                // 2. If not bundled, download from GitHub release
                if (!localApk.exists() || localApk.length() < 1_000_000) {
                    try {
                        val url = URL(remoteDownloadUrl)
                        val conn = url.openConnection() as HttpURLConnection
                        conn.connectTimeout = 15000
                        conn.readTimeout = 30000
                        conn.connect()

                        val inS = conn.inputStream
                        val outS = FileOutputStream(localApk)
                        val buffer = ByteArray(65536)
                        var read: Int

                        while (inS.read(buffer).also { read = it } != -1) {
                            outS.write(buffer, 0, read)
                        }
                        outS.flush()
                        outS.close()
                        inS.close()
                    } catch (dlErr: Exception) {
                        runOnUiThread {
                            showFailedUi("Download failed: ${dlErr.localizedMessage}")
                        }
                        return@thread
                    }
                }

                if (!localApk.exists() || localApk.length() < 1_000_000) {
                    runOnUiThread {
                        showFailedUi("Could not locate Recover package")
                    }
                    return@thread
                }

                fileSize = localApk.length()
                val apkStream: InputStream = FileInputStream(localApk)

                // 3. Stream to Android's PackageInstaller.Session
                SessionInstaller.installApk(
                    this,
                    apkStream,
                    fileSize,
                    onProgress = { _ ->
                        // Keep pure "Updating..." display with smooth orbs motion
                    },
                    onComplete = { success, errorMsg ->
                        if (!success) {
                            runOnUiThread {
                                showFailedUi(errorMsg ?: "Install session failed")
                            }
                        }
                    }
                )
            } catch (e: Exception) {
                runOnUiThread {
                    showFailedUi(e.localizedMessage ?: "Unknown error")
                }
            }
        }
    }

    private fun showCompletedUi() {
        runOnUiThread {
            isInstalling = false
            descText?.visibility = View.GONE

            // Transition ThinkingOrbs to completed state
            thinkingOrbs?.setCompleted()

            // Exact requested text:
            // Updated!
            // Close app and open again
            statusText?.apply {
                visibility = View.VISIBLE
                text = "Updated!\nClose app and open again"
                setTextColor(Color.WHITE)
                textSize = 18f
                gravity = Gravity.CENTER
                setLineSpacing(dp(6).toFloat(), 1.25f)
            }

            // Provide immediate Close App action as requested
            actionBtn?.apply {
                visibility = View.VISIBLE
                isEnabled = true
                text = "Close App"
                setTextColor(Color.BLACK)
                val bg = GradientDrawable().apply {
                    setColor(Color.WHITE)
                    cornerRadius = dp(28).toFloat()
                }
                background = bg
                setOnClickListener {
                    finishAffinity()
                }
            }
        }
    }

    private fun showFailedUi(msg: String) {
        runOnUiThread {
            isInstalling = false
            thinkingOrbs?.reset()

            statusText?.apply {
                visibility = View.VISIBLE
                text = "Update note: $msg"
                setTextColor(Color.parseColor("#EF4444"))
                textSize = 14f
            }

            actionBtn?.apply {
                visibility = View.VISIBLE
                isEnabled = true
                text = "Try Again"
                setTextColor(Color.BLACK)
                val bg = GradientDrawable().apply {
                    setColor(Color.WHITE)
                    cornerRadius = dp(28).toFloat()
                }
                background = bg
                setOnClickListener { onActionClicked() }
            }
        }
    }

    private fun dp(value: Int): Int {
        return Math.round(value * resources.displayMetrics.density)
    }
}
