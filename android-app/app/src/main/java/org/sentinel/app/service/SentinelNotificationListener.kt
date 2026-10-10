package org.sentinel.app.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import org.sentinel.app.R
import org.sentinel.app.engine.DetectionResult
import org.sentinel.app.engine.Message
import org.sentinel.app.engine.OverallConcern
import org.sentinel.app.engine.ThreatDetector
import org.sentinel.app.repository.IncidentRepository
import java.util.Date

class SentinelNotificationListener : NotificationListenerService() {

    override fun onListenerConnected() {
        super.onListenerConnected()
        isServiceRunning = true
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        isServiceRunning = false
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (!isMonitoringEnabled(applicationContext)) return
        if (sbn == null) return

        val pkg = sbn.packageName ?: return
        if (!SUPPORTED_PACKAGES.contains(pkg)) return

        val extras = sbn.notification.extras ?: return
        val title = extras.getCharSequence("android.title")?.toString()
        val text = extras.getCharSequence("android.text")?.toString() ?: extras.getCharSequence("android.bigText")?.toString()

        if (text.isNullOrBlank()) return

        val dedupeKey = "$pkg:$title:$text"
        val now = System.currentTimeMillis()
        if (lastProcessedMsgs.containsKey(dedupeKey) && (now - (lastProcessedMsgs[dedupeKey] ?: 0L)) < DEDUPE_WINDOW_MS) {
            return
        }
        lastProcessedMsgs[dedupeKey] = now

        val message = Message(
            id = sbn.key ?: "$now",
            index = 1,
            sender = title,
            text = text,
            timestamp = Date(sbn.postTime),
            packageName = pkg
        )

        val result = ThreatDetector.analyze(listOf(message))
        if (result.overallConcern != OverallConcern.NO_STRONG_INDICATORS) {
            IncidentRepository.addIncident(result, message, source = "Notification Monitoring ($pkg)")

            if (result.overallConcern == OverallConcern.ELEVATED_CONCERN) {
                showDiscreetAlert(applicationContext, result)
            }
        }
    }

    private fun String?.lyricalBlank(): Boolean {
        return this.isNullOrBlank()
    }

    companion object {
        var isServiceRunning: Boolean = false

        private const val DEDUPE_WINDOW_MS = 60_000L
        private val lastProcessedMsgs = mutableMapOf<String, Long>()

        val SUPPORTED_PACKAGES = setOf(
            "com.whatsapp",
            "com.instagram.android",
            "org.telegram.messenger",
            "com.google.android.apps.messaging",
            "com.samsung.android.messaging"
        )

        const val CHANNEL_ID = "sentinel_safety_alerts"

        fun isPermissionGranted(context: Context): Boolean {
            val enabledListeners = NotificationManagerCompat.getEnabledListenerPackages(context)
            return enabledListeners.contains(context.packageName)
        }

        fun isMonitoringEnabled(context: Context): Boolean {
            val prefs = context.getSharedPreferences("sentinel_prefs", Context.MODE_PRIVATE)
            return prefs.getBoolean("monitoring_active", true) && isPermissionGranted(context)
        }

        fun setMonitoringEnabled(context: Context, enabled: Boolean) {
            val prefs = context.getSharedPreferences("sentinel_prefs", Context.MODE_PRIVATE)
            prefs.edit().putBoolean("monitoring_active", enabled).apply()
        }

        fun openPermissionSettings(context: Context) {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        }

        fun showDiscreetAlert(context: Context, result: DetectionResult) {
            createNotificationChannel(context)

            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val notification = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("SENTINEL Safety Notice")
                .setContentText("SENTINEL detected a potentially concerning interaction. Open the app to review.")
                .setStyle(
                    NotificationCompat.BigTextStyle()
                        .bigText("SENTINEL detected a potentially concerning interaction. Open the app to review details securely inside SENTINEL.")
                )
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .build()

            notificationManager.notify((System.currentTimeMillis() % 10000).toInt(), notification)
        }

        private fun createNotificationChannel(context: Context) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    "SENTINEL Discreet Safety Alerts",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Alerts for detected high-risk or threatening messaging interactions"
                }
                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.createNotificationChannel(channel)
            }
        }
    }
}
