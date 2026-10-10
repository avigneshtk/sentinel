package org.sentinel.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.sentinel.app.engine.OverallConcern
import org.sentinel.app.repository.IncidentRepository
import org.sentinel.app.service.SentinelNotificationListener
import org.sentinel.app.theme.*

@Composable
fun DashboardScreen(
    onNavigateToAnalyze: () -> Unit,
    onNavigateToSafety: () -> Unit,
    onNavigateToTimeline: () -> Unit
) {
    val context = LocalContext.current
    val incidents by IncidentRepository.incidents.collectAsState()
    val isGranted = SentinelNotificationListener.isPermissionGranted(context)
    val isMonitoring = SentinelNotificationListener.isMonitoringEnabled(context)

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepNavy)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "SENTINEL Dashboard",
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
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Monitoring Status",
                            color = TextSecondary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (isGranted && isMonitoring) "Active (Background)" else "Inactive",
                            color = if (isGranted && isMonitoring) EmeraldSuccess else CriticalRed,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Switch(
                        checked = isMonitoring && isGranted,
                        onCheckedChange = { checked ->
                            if (!isGranted) {
                                SentinelNotificationListener.openPermissionSettings(context)
                            } else {
                                SentinelNotificationListener.setMonitoringEnabled(context, checked)
                            }
                        }
                    )
                }
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Card(
                    onClick = onNavigateToAnalyze,
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Manual Scan", color = PrimaryIndigo, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Paste text to analyze", color = TextSecondary, fontSize = 12.sp)
                    }
                }

                Card(
                    onClick = onNavigateToSafety,
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Safety Center", color = EmeraldSuccess, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Helplines & 112 Dial", color = TextSecondary, fontSize = 12.sp)
                    }
                }
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recent Incident Alerts",
                    color = TextPrimary,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )

                TextButton(onClick = onNavigateToTimeline) {
                    Text("View All (${incidents.size})", color = PrimaryIndigo)
                }
            }
        }

        if (incidents.isEmpty()) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("No Threat Alerts Recorded", color = TextPrimary, fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Any high-risk messages detected in background notifications or manual scans will appear here.", color = TextSecondary, fontSize = 13.sp)
                    }
                }
            }
        } else {
            items(incidents.take(3)) { incident ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = incident.source,
                                color = TextSecondary,
                                fontSize = 12.sp
                            )
                            Text(
                                text = incident.result.overallConcern.name,
                                color = if (incident.result.overallConcern == OverallConcern.ELEVATED_CONCERN) CriticalRed else AccentWarning,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(incident.result.title, color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(incident.rawText, color = TextSecondary, fontSize = 13.sp, maxLines = 2)
                    }
                }
            }
        }
    }
}
