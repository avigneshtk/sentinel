package org.sentinel.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.sentinel.app.engine.OverallConcern
import org.sentinel.app.repository.IncidentRepository
import org.sentinel.app.theme.*

@Composable
fun TimelineScreen() {
    val incidents by IncidentRepository.incidents.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepNavy)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Incident Timeline",
                    color = TextPrimary,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )

                if (incidents.isNotEmpty()) {
                    TextButton(onClick = { IncidentRepository.clearAll() }) {
                        Text("Clear All", color = CriticalRed)
                    }
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
                        modifier = Modifier.padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("No Incidents Recorded", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Your incident timeline is empty. When background notification monitoring or manual scans detect potential threats, they will be logged here for evidence preservation.",
                            color = TextSecondary,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        } else {
            items(incidents, key = { it.id }) { incident ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = incident.source,
                                color = TextSecondary,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium
                            )
                            IconButton(onClick = { IncidentRepository.deleteIncident(incident.id) }) {
                                Text("✕", color = TextSecondary)
                            }
                        }

                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = incident.result.title,
                            color = if (incident.result.overallConcern == OverallConcern.ELEVATED_CONCERN) CriticalRed else AccentWarning,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )

                        Spacer(modifier = Modifier.height(8.dp))
                        Card(
                            colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "\"${incident.rawText}\"",
                                color = TextPrimary,
                                fontSize = 13.sp,
                                modifier = Modifier.padding(12.dp)
                            )
                        }

                        if (incident.result.recommendations.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(12.dp))
                            Text("Recommended Next Steps:", color = PrimaryIndigo, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            incident.result.recommendations.forEach { rec ->
                                Text("• $rec", color = TextSecondary, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
