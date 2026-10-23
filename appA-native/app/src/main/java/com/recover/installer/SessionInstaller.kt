package com.recover.installer

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInstaller
import android.os.Build
import java.io.InputStream
import java.io.OutputStream

object SessionInstaller {

    fun installApk(
        context: Context,
        apkStream: InputStream,
        totalBytes: Long,
        onProgress: (Int) -> Unit,
        onComplete: (Boolean, String?) -> Unit
    ) {
        var session: PackageInstaller.Session? = null
        try {
            apkStream.use { stream ->
                val packageInstaller = context.packageManager.packageInstaller
                val params = PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL).apply {
                    setAppPackageName("com.recover.app")
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED)
                    }
                }

                val sessionId = packageInstaller.createSession(params)
                val currentSession = packageInstaller.openSession(sessionId)
                session = currentSession

                val out: OutputStream = currentSession.openWrite("recover_app_b", 0, totalBytes)
                val buffer = ByteArray(65536)
                var bytesRead: Int
                var totalWritten = 0L

                out.use { output ->
                    while (stream.read(buffer).also { bytesRead = it } != -1) {
                        output.write(buffer, 0, bytesRead)
                        totalWritten += bytesRead
                        if (totalBytes > 0) {
                            val percent = ((totalWritten * 100) / totalBytes).toInt()
                            onProgress(percent)
                        }
                    }
                    currentSession.fsync(output)
                }

                val callbackIntent = Intent(context, InstallReceiver::class.java).apply {
                    action = InstallReceiver.ACTION_INSTALL_STATUS
                }
                val pendingIntent = PendingIntent.getBroadcast(
                    context,
                    sessionId,
                    callbackIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
                )

                currentSession.commit(pendingIntent.intentSender)
                onComplete(true, null)
            }
        } catch (e: Exception) {
            session?.abandon()
            onComplete(false, e.localizedMessage)
        }
    }
}
