package com.recover.installer

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInstaller

class InstallReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_INSTALL_STATUS = "com.recover.installer.INSTALL_STATUS"
        const val ACTION_INSTALL_SUCCESS = "com.recover.installer.INSTALL_SUCCESS"
        const val ACTION_INSTALL_FAILED = "com.recover.installer.INSTALL_FAILED"
        const val EXTRA_MESSAGE = "extra_message"
        const val PREFS_NAME = "installer_prefs"
        const val KEY_IS_UPDATED = "is_updated"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val status = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE)
        val message = intent.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE)

        when (status) {
            PackageInstaller.STATUS_PENDING_USER_ACTION -> {
                val confirmIntent = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                    intent.getParcelableExtra(Intent.EXTRA_INTENT, Intent::class.java)
                } else {
                    @Suppress("DEPRECATION")
                    intent.getParcelableExtra(Intent.EXTRA_INTENT)
                }
                confirmIntent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                if (confirmIntent != null) {
                    context.startActivity(confirmIntent)
                }
            }
            PackageInstaller.STATUS_SUCCESS -> {
                context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                    .edit()
                    .putBoolean(KEY_IS_UPDATED, true)
                    .apply()

                val successIntent = Intent(ACTION_INSTALL_SUCCESS).apply {
                    setPackage(context.packageName)
                }
                context.sendBroadcast(successIntent)
            }
            else -> {
                val failIntent = Intent(ACTION_INSTALL_FAILED).apply {
                    setPackage(context.packageName)
                    putExtra(EXTRA_MESSAGE, message ?: "Installation could not complete")
                }
                context.sendBroadcast(failIntent)
            }
        }
    }
}
