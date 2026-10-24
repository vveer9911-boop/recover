package com.recover.installer

import android.app.Activity
import android.app.AlertDialog
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
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

/**
 * Recover Installer (App A - com.recover.installer)
 * 
 * Rules:
 * 1. App A manages installation and launching of App B (com.recover.app).
 * 2. The "Update" button for App A updates App A itself (com.recover.installer), NOT App B.
 * 3. Only offers to launch App B when App B is actually installed.
 * 4. Never bypasses Android restricted settings protections.
 * 5. Uses Thinking Orbs (Jakubantalik/thinking-orbs 3D orbits) for progress.
 */
class MainActivity : Activity() {

    private var thinkingOrbs: ThinkingOrbsView? = null
    private var statusText: TextView? = null
    private var descText: TextView? = null
    private var primaryActionBtn: Button? = null
    private var updateAppABtn: Button? = null
    private var versionBadge: TextView? = null

    private var isBusy = false

    companion object {
        const val APP_B_PACKAGE = "com.recover.app"
        const val PREFS_NAME = "installer_prefs"
        const val KEY_PENDING_SELF_UPDATE = "pending_self_update"
        const val KEY_PRIOR_VERSION_CODE = "prior_version_code"
        const val KEY_IS_APP_B_UPDATED = "is_app_b_updated"

        // Official release URLs
        const val REMOTE_APP_A_URL = "https://github.com/vveer9911-boop/recover/releases/latest/download/App-A-Recover-Installer.apk"
        const val REMOTE_APP_B_URL = "https://github.com/vveer9911-boop/recover/releases/latest/download/App-B-Recover-Wallet.apk"
    }

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

        checkPendingSelfUpdateVerification()

        if (!isBusy) {
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
        } catch (_: Exception) {
            false
        }
    }

    private fun getAppAVersion(): String {
        return try {
            val pInfo = packageManager.getPackageInfo(packageName, 0)
            "v${pInfo.versionName} (${getVersionCode(pInfo)})"
        } catch (_: Exception) {
            "v1.0.0"
        }
    }

    @Suppress("DEPRECATION")
    private fun getVersionCode(pInfo: PackageInfo): Long {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            pInfo.longVersionCode
        } else {
            pInfo.versionCode.toLong()
        }
    }

    /**
     * Requirement 6: Verify installed version after update of App A
     */
    private fun checkPendingSelfUpdateVerification() {
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val pending = prefs.getBoolean(KEY_PENDING_SELF_UPDATE, false)
        if (pending) {
            val priorCode = prefs.getLong(KEY_PRIOR_VERSION_CODE, 0L)
            val currentCode = try {
                val pInfo = packageManager.getPackageInfo(packageName, 0)
                getVersionCode(pInfo)
            } catch (_: Exception) {
                0L
            }

            prefs.edit().putBoolean(KEY_PENDING_SELF_UPDATE, false).apply()

            if (currentCode > priorCode) {
                Toast.makeText(this, "Recover Installer updated successfully!", Toast.LENGTH_LONG).show()
                showCompletedUi("Recover Installer Updated!\nClose app and open again")
            }
        }
    }

    private fun buildUi() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.BLACK)
            gravity = Gravity.CENTER_HORIZONTAL
            setPadding(dp(28), dp(44), dp(28), dp(36))
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
            setPadding(0, dp(8), 0, dp(6))
        }
        root.addView(subtitle)

        versionBadge = TextView(this).apply {
            text = "Installer ${getAppAVersion()}"
            setTextColor(Color.parseColor("#38BDF8"))
            textSize = 12f
            gravity = Gravity.CENTER
            typeface = Typeface.MONOSPACE
            setPadding(dp(12), dp(4), dp(12), dp(4))
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#18181B"))
                cornerRadius = dp(12).toFloat()
                setStroke(dp(1), Color.parseColor("#27272A"))
            }
        }
        root.addView(versionBadge)

        val midSpacer = View(this)
        root.addView(midSpacer, LinearLayout.LayoutParams(-1, 0, 1.2f))

        // Thinking Orbs 3D Loader (Jakubantalik/thinking-orbs orbits)
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
            setPadding(dp(12), 0, dp(12), dp(20))
        }
        root.addView(descText)

        // Primary Action Button (App B Management: Install / Open)
        primaryActionBtn = Button(this).apply {
            text = "Continue"
            setTextColor(Color.BLACK)
            textSize = 15f
            typeface = Typeface.DEFAULT_BOLD
            background = GradientDrawable().apply {
                setColor(Color.WHITE)
                cornerRadius = dp(28).toFloat()
            }
            setOnClickListener { onPrimaryActionClicked() }
        }
        root.addView(primaryActionBtn, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(52)))

        // Secondary Action Button (App A Self-Update: Updates Installer itself)
        updateAppABtn = Button(this).apply {
            text = "Check for Installer Update"
            setTextColor(Color.parseColor("#A1A1AA"))
            textSize = 13f
            typeface = Typeface.DEFAULT_BOLD
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#18181B"))
                cornerRadius = dp(24).toFloat()
                setStroke(dp(1), Color.parseColor("#27272A"))
            }
            val lp = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(44)).apply {
                topMargin = dp(10)
            }
            layoutParams = lp
            setOnClickListener { onSelfUpdateClicked() }
        }
        root.addView(updateAppABtn)

        setContentView(root)
    }

    private fun updateDefaultState() {
        val appBInstalled = isAppInstalled(APP_B_PACKAGE)

        primaryActionBtn?.apply {
            visibility = View.VISIBLE
            isEnabled = true
            if (appBInstalled) {
                text = "Open Recover"
                setOnClickListener { launchAppB() }
            } else {
                text = "Install Recover (App B)"
                setOnClickListener { onPrimaryActionClicked() }
            }
        }

        updateAppABtn?.apply {
            visibility = View.VISIBLE
            isEnabled = true
            text = "Update Installer (App A)"
        }

        descText?.apply {
            visibility = View.VISIBLE
            text = if (appBInstalled) {
                "Recover Study Wallet (App B) is installed and ready. Tap below to launch your focus wallet."
            } else {
                "Install Recover Study Wallet (App B) to configure focus rules, distraction blocking, and screen-time credits."
            }
        }

        statusText?.visibility = View.GONE
        thinkingOrbs?.reset()
    }

    /**
     * Launch App B directly when installed
     */
    private fun launchAppB() {
        try {
            val intent = packageManager.getLaunchIntentForPackage(APP_B_PACKAGE)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                startActivity(intent)
            } else {
                Toast.makeText(this, "Could not launch Recover", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            Toast.makeText(this, "Launch error: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun ensureInstallPermission(): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (!packageManager.canRequestPackageInstalls()) {
                val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                    data = Uri.parse("package:$packageName")
                }
                startActivity(intent)
                Toast.makeText(this, "Please allow Recover Installer to install packages", Toast.LENGTH_SHORT).show()
                return false
            }
        }
        return true
    }

    /**
     * Install App B (Recover Study Wallet)
     */
    private fun onPrimaryActionClicked() {
        if (!ensureInstallPermission()) return

        val builder = AlertDialog.Builder(this)
        builder.setTitle("Install Recover Study Wallet?")
        builder.setMessage("Install Recover Study Wallet (App B) on your device to manage distracting apps, complete focus sessions, and earn credits.")
        builder.setNegativeButton("Cancel") { d, _ -> d.dismiss() }
        builder.setPositiveButton("Install") { d, _ ->
            d.dismiss()
            startAppBInstallation()
        }
        builder.show()
    }

    /**
     * Requirement 6: Self-Update App A (Recover Installer itself)
     */
    private fun onSelfUpdateClicked() {
        if (!ensureInstallPermission()) return

        val builder = AlertDialog.Builder(this)
        builder.setTitle("Update Recover Installer?")
        builder.setMessage("Update this installer app (App A: $packageName) with the latest features and package installer engine.")
        builder.setNegativeButton("Cancel") { d, _ -> d.dismiss() }
        builder.setPositiveButton("Update App A") { d, _ ->
            d.dismiss()
            startAppASelfUpdate()
        }
        builder.show()
    }

    private fun startAppBInstallation() {
        isBusy = true
        descText?.visibility = View.GONE
        primaryActionBtn?.visibility = View.GONE
        updateAppABtn?.visibility = View.GONE

        thinkingOrbs?.startUpdating()
        statusText?.apply {
            visibility = View.VISIBLE
            text = "Installing Recover (App B)..."
            setTextColor(Color.parseColor("#38BDF8"))
        }

        thread {
            try {
                val assetApkName = "recover-study-wallet.apk"
                val localApk = File(cacheDir, "recover-study-wallet.apk")

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
                    } catch (_: Exception) {}
                }

                if (!localApk.exists() || localApk.length() < 1_000_000) {
                    downloadApk(REMOTE_APP_B_URL, localApk)
                }

                val fileSize = localApk.length()
                val apkStream: InputStream = FileInputStream(localApk)

                SessionInstaller.installApk(
                    this,
                    apkStream,
                    fileSize,
                    onProgress = {},
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
                    showFailedUi(e.localizedMessage ?: "Installation error")
                }
            }
        }
    }

    private fun startAppASelfUpdate() {
        isBusy = true
        descText?.visibility = View.GONE
        primaryActionBtn?.visibility = View.GONE
        updateAppABtn?.visibility = View.GONE

        thinkingOrbs?.startUpdating()
        statusText?.apply {
            visibility = View.VISIBLE
            text = "Updating Recover Installer (App A)..."
            setTextColor(Color.parseColor("#38BDF8"))
        }

        // Save pending update state in SharedPreferences before update session
        val pInfo = packageManager.getPackageInfo(packageName, 0)
        getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_PENDING_SELF_UPDATE, true)
            .putLong(KEY_PRIOR_VERSION_CODE, getVersionCode(pInfo))
            .apply()

        thread {
            try {
                val localApk = File(cacheDir, "app-a-installer-update.apk")
                downloadApk(REMOTE_APP_A_URL, localApk)

                val fileSize = localApk.length()
                val apkStream: InputStream = FileInputStream(localApk)

                SessionInstaller.installApk(
                    this,
                    apkStream,
                    fileSize,
                    onProgress = {},
                    onComplete = { success, errorMsg ->
                        if (!success) {
                            runOnUiThread {
                                showFailedUi(errorMsg ?: "Self-update failed")
                            }
                        }
                    }
                )
            } catch (e: Exception) {
                runOnUiThread {
                    showFailedUi(e.localizedMessage ?: "Self-update error")
                }
            }
        }
    }

    private fun downloadApk(urlStr: String, destFile: File) {
        val url = URL(urlStr)
        val conn = url.openConnection() as HttpURLConnection
        conn.connectTimeout = 15000
        conn.readTimeout = 30000
        conn.connect()

        val inS = conn.inputStream
        val outS = FileOutputStream(destFile)
        val buffer = ByteArray(65536)
        var read: Int

        while (inS.read(buffer).also { read = it } != -1) {
            outS.write(buffer, 0, read)
        }
        outS.flush()
        outS.close()
        inS.close()
    }

    private fun showCompletedUi(customText: String? = null) {
        runOnUiThread {
            isBusy = false
            descText?.visibility = View.GONE
            thinkingOrbs?.setCompleted()

            statusText?.apply {
                visibility = View.VISIBLE
                text = customText ?: "Updated!\nClose app and open again"
                setTextColor(Color.WHITE)
                textSize = 18f
                gravity = Gravity.CENTER
                setLineSpacing(dp(6).toFloat(), 1.25f)
            }

            primaryActionBtn?.apply {
                visibility = View.VISIBLE
                isEnabled = true
                text = "Close App"
                setOnClickListener {
                    finishAffinity()
                }
            }

            updateAppABtn?.visibility = View.GONE
        }
    }

    private fun showFailedUi(msg: String) {
        runOnUiThread {
            isBusy = false
            thinkingOrbs?.reset()

            statusText?.apply {
                visibility = View.VISIBLE
                text = "Note: $msg"
                setTextColor(Color.parseColor("#EF4444"))
                textSize = 14f
            }

            primaryActionBtn?.apply {
                visibility = View.VISIBLE
                isEnabled = true
                text = "Try Again"
                setOnClickListener { updateDefaultState() }
            }

            updateAppABtn?.visibility = View.VISIBLE
        }
    }

    private fun dp(value: Int): Int {
        return Math.round(value * resources.displayMetrics.density)
    }
}
