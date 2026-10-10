package org.sentinel.app

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import org.sentinel.app.theme.DeepNavy
import org.sentinel.app.theme.PrimaryIndigo
import org.sentinel.app.theme.SurfaceDark
import org.sentinel.app.theme.TextPrimary
import org.sentinel.app.theme.TextSecondary
import org.sentinel.app.ui.*

enum class AppScreen {
    ONBOARDING,
    PERMISSION_SETUP,
    DASHBOARD,
    ANALYZE,
    TIMELINE,
    SAFETY_CENTER,
    SETTINGS
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainNavigation() {
    var currentScreen by remember { mutableStateOf(AppScreen.ONBOARDING) }

    Scaffold(
        bottomBar = {
            if (currentScreen != AppScreen.ONBOARDING && currentScreen != AppScreen.PERMISSION_SETUP) {
                NavigationBar(
                    containerColor = SurfaceDark,
                    contentColor = TextPrimary
                ) {
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.DASHBOARD,
                        onClick = { currentScreen = AppScreen.DASHBOARD },
                        label = { Text("Home") },
                        icon = { Text("🏠") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = PrimaryIndigo,
                            selectedTextColor = PrimaryIndigo,
                            unselectedIconColor = TextSecondary,
                            unselectedTextColor = TextSecondary,
                            indicatorColor = PrimaryIndigo.copy(alpha = 0.2f)
                        )
                    )
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.ANALYZE,
                        onClick = { currentScreen = AppScreen.ANALYZE },
                        label = { Text("Scan") },
                        icon = { Text("🔍") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = PrimaryIndigo,
                            selectedTextColor = PrimaryIndigo,
                            unselectedIconColor = TextSecondary,
                            unselectedTextColor = TextSecondary,
                            indicatorColor = PrimaryIndigo.copy(alpha = 0.2f)
                        )
                    )
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.TIMELINE,
                        onClick = { currentScreen = AppScreen.TIMELINE },
                        label = { Text("Timeline") },
                        icon = { Text("📋") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = PrimaryIndigo,
                            selectedTextColor = PrimaryIndigo,
                            unselectedIconColor = TextSecondary,
                            unselectedTextColor = TextSecondary,
                            indicatorColor = PrimaryIndigo.copy(alpha = 0.2f)
                        )
                    )
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.SAFETY_CENTER,
                        onClick = { currentScreen = AppScreen.SAFETY_CENTER },
                        label = { Text("Safety") },
                        icon = { Text("🛡️") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = PrimaryIndigo,
                            selectedTextColor = PrimaryIndigo,
                            unselectedIconColor = TextSecondary,
                            unselectedTextColor = TextSecondary,
                            indicatorColor = PrimaryIndigo.copy(alpha = 0.2f)
                        )
                    )
                    NavigationBarItem(
                        selected = currentScreen == AppScreen.SETTINGS,
                        onClick = { currentScreen = AppScreen.SETTINGS },
                        label = { Text("Settings") },
                        icon = { Text("⚙️") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = PrimaryIndigo,
                            selectedTextColor = PrimaryIndigo,
                            unselectedIconColor = TextSecondary,
                            unselectedTextColor = TextSecondary,
                            indicatorColor = PrimaryIndigo.copy(alpha = 0.2f)
                        )
                    )
                }
            }
        },
        containerColor = DeepNavy
    ) { paddingValues ->
        Surface(
            modifier = Modifier.padding(paddingValues),
            color = DeepNavy
        ) {
            when (currentScreen) {
                AppScreen.ONBOARDING -> OnboardingScreen(
                    onProceed = { currentScreen = AppScreen.PERMISSION_SETUP }
                )
                AppScreen.PERMISSION_SETUP -> PermissionSetupScreen(
                    onContinue = { currentScreen = AppScreen.DASHBOARD }
                )
                AppScreen.DASHBOARD -> DashboardScreen(
                    onNavigateToAnalyze = { currentScreen = AppScreen.ANALYZE },
                    onNavigateToSafety = { currentScreen = AppScreen.SAFETY_CENTER },
                    onNavigateToTimeline = { currentScreen = AppScreen.TIMELINE }
                )
                AppScreen.ANALYZE -> AnalyzeScreen()
                AppScreen.TIMELINE -> TimelineScreen()
                AppScreen.SAFETY_CENTER -> SafetyCenterScreen()
                AppScreen.SETTINGS -> SettingsScreen()
            }
        }
    }
}
