package org.sentinel.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.sentinel.app.service.SentinelNotificationListener
import org.sentinel.app.theme.*

@Composable
fun SettingsScreen() {
    val context = LocalContext.current
    var isMonitoring by remember { mutableStateOf(SentinelNotificationListener.isMonitoringEnabled(context)) }
    val isGranted = SentinelNotificationListener.isPermissionGranted(context)

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepNavy)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Privacy & Settings",
                color = TextPrimary,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
        }

        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Background Notification Monitoring", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                            Text("Process incoming message notifications", color = TextSecondary, fontSize = 13.sp)
                        }
                        Switch(
                            checked = isMonitoring && isGranted,
                            onCheckedChange = { checked ->
                                SentinelNotificationListener.setMonitoringEnabled(context, checked)
                                isMonitoring = checked
                            }
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = { SentinelNotificationListener.openPermissionSettings(context) },
                        colors = ButtonDefaults.buttonColors(containerColor = SurfaceVariantDark),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Manage Android Listener Permission", color = TextPrimary)
                    }
                }
            }
        }

        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("SENTINEL Privacy Guarantee", color = PrimaryIndigo, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("• 100% On-Device Deterministic Rule Engine", color = TextPrimary, fontSize = 13.sp)
                    Text("• No background data uploading or remote LLM calls without consent", color = TextSecondary, fontSize = 13.sp)
                    Text("• No contacts, camera, audio, or location access required", color = TextSecondary, fontSize = 13.sp)
                    Text("• Local incident timeline is controlled and erasable by you", color = TextSecondary, fontSize = 13.sp)
                }
            }
        }
    }
}
