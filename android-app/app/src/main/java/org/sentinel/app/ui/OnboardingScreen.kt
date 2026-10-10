package org.sentinel.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.sentinel.app.theme.*

@Composable
fun OnboardingScreen(onProceed: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepNavy)
            .padding(24.dp),
        verticalArrangement = Arrangement.SpaceBetween,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(32.dp))

        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Surface(
                color = PrimaryIndigo.copy(alpha = 0.2f),
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.padding(bottom = 16.dp)
            ) {
                Text(
                    text = "SENTINEL",
                    color = PrimaryIndigo,
                    fontWeight = FontWeight.Bold,
                    fontSize = 24.sp,
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)
                )
            }

            Text(
                text = "Privacy-First Digital Safety",
                color = TextPrimary,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 12.dp)
            )

            Text(
                text = "Detect threat patterns, coercion, and harassment early — processing locally on your device with total privacy control.",
                color = TextSecondary,
                fontSize = 15.sp,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }

        Card(
            colors = CardDefaults.cardColors(containerColor = SurfaceDark),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("How SENTINEL protects you:", color = TextPrimary, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                Spacer(modifier = Modifier.height(8.dp))
                Text("• Monitors messaging notifications locally", color = TextSecondary, fontSize = 14.sp)
                Text("• Evaluates threat indicators synchronously on-device", color = TextSecondary, fontSize = 14.sp)
                Text("• Displays discreet alerts without lockscreen leak", color = TextSecondary, fontSize = 14.sp)
                Text("• Connects you directly to 112 emergency & 1930 Cybercrime help", color = TextSecondary, fontSize = 14.sp)
            }
        }

        Button(
            onClick = onProceed,
            colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo),
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp)
        ) {
            Text("Get Started & Configure Permissions", color = TextPrimary, fontWeight = FontWeight.Bold)
        }
    }
}
