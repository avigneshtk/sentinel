package org.sentinel.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.sentinel.app.engine.DetectionResult
import org.sentinel.app.engine.Message
import org.sentinel.app.engine.OverallConcern
import org.sentinel.app.engine.ThreatDetector
import org.sentinel.app.repository.IncidentRepository
import org.sentinel.app.theme.*

@Composable
fun AnalyzeScreen() {
    var inputText by remember { mutableStateOf("") }
    var selectedApp by remember { mutableStateOf("WhatsApp") }
    var analysisResult by remember { mutableStateOf<DetectionResult?>(null) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepNavy)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Manual Message Scanner",
                color = TextPrimary,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Paste any message or conversation text below to evaluate threat indicators locally.",
                color = TextSecondary,
                fontSize = 14.sp
            )
        }

        item {
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                label = { Text("Paste conversation or message text") },
                placeholder = { Text("e.g. Send money right now or I will post your pictures...") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(150.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PrimaryIndigo,
                    unfocusedBorderColor = SurfaceVariantDark,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    focusedLabelColor = PrimaryIndigo
                )
            )
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = {
                        if (inputText.isNotBlank()) {
                            val msg = Message(
                                id = System.currentTimeMillis().toString(),
                                index = 1,
                                sender = "Manual Input",
                                text = inputText
                            )
                            val res = ThreatDetector.analyze(listOf(msg))
                            analysisResult = res

                            if (res.overallConcern != OverallConcern.NO_STRONG_INDICATORS) {
                                IncidentRepository.addIncident(res, msg, source = "Manual Scan ($selectedApp)")
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo),
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp)
                ) {
                    Text("Analyze Threat", color = TextPrimary, fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = {
                        inputText = ""
                        analysisResult = null
                    },
                    modifier = Modifier.height(48.dp)
                ) {
                    Text("Clear", color = TextSecondary)
                }
            }
        }

        analysisResult?.let { res ->
            item {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = when (res.overallConcern) {
                            OverallConcern.ELEVATED_CONCERN -> CriticalRed.copy(alpha = 0.15f)
                            OverallConcern.CAUTION -> AccentWarning.copy(alpha = 0.15f)
                            OverallConcern.NO_STRONG_INDICATORS -> EmeraldSuccess.copy(alpha = 0.15f)
                        }
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = res.title,
                            color = when (res.overallConcern) {
                                OverallConcern.ELEVATED_CONCERN -> CriticalRed
                                OverallConcern.CAUTION -> AccentWarning
                                OverallConcern.NO_STRONG_INDICATORS -> EmeraldSuccess
                            },
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(res.body, color = TextPrimary, fontSize = 14.sp)
                    }
                }
            }

            if (res.findings.isNotEmpty()) {
                item {
                    Text("Matched Evidence Signals", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }

                items(res.findings) { finding ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(finding.signal, color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                Text(
                                    finding.severity.name,
                                    color = if (finding.severity == org.sentinel.app.engine.Severity.ELEVATED) CriticalRed else AccentWarning,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Matched Excerpt: \"${finding.excerpt}\"", color = AccentWarning, fontSize = 13.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(finding.explanation, color = TextSecondary, fontSize = 13.sp)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Recommended Action:", color = PrimaryIndigo, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                            Text(finding.recommendation, color = TextPrimary, fontSize = 13.sp)
                        }
                    }
                }
            }
        }
    }
}
