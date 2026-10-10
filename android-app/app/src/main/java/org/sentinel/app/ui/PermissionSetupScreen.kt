package org.sentinel.app.ui

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.sentinel.app.service.SentinelNotificationListener
import org.sentinel.app.theme.*

@Composable
fun PermissionSetupScreen(onContinue: () -> Unit) {
    val context = LocalContext.current
    var isGranted by remember { mutableStateOf(SentinelNotificationListener.isPermissionGranted(context)) }

    LaunchedEffect(Unit) {
        isGranted = SentinelNotificationListener.isPermissionGranted(context)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepNavy)
            .padding(24.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Text(
                text = "Notification Access",
                color = TextPrimary,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            Text(
                text = "SENTINEL requires Notification Listener permission to scan incoming messages from supported apps (WhatsApp, Instagram, Telegram, SMS) for threat patterns.",
                color = TextSecondary,
                fontSize = 15.sp,
                modifier = Modifier.padding(bottom = 20.dp)
            )

            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Current Status: " + if (isGranted) "ENABLED" else "DISABLED",
                        color = if (isGranted) EmeraldSuccess else AccentWarning,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "SENTINEL processes notification text 100% locally. It never accesses your private messages directly inside messaging apps, nor does it upload conversation data.",
                        color = TextSecondary,
                        fontSize = 13.sp
                    )
                }
            }

            Button(
                onClick = {
                    SentinelNotificationListener.openPermissionSettings(context)
                },
                colors = ButtonDefaults.buttonColors(containerColor = SurfaceVariantDark),
                modifier = Modifier.fillMaxWidth().height(48.dp)
            ) {
                Text("Open Android Settings to Enable Access", color = TextPrimary)
            }
        }

        Button(
            onClick = onContinue,
            colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo),
            modifier = Modifier.fillMaxWidth().height(50.dp)
        ) {
            Text("Proceed to SENTINEL Dashboard", color = TextPrimary, fontWeight = FontWeight.Bold)
        }
    }
}
