package org.sentinel.app.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val DeepNavy = Color(0xFF0B0F19)
val SurfaceDark = Color(0xFF151C2C)
val SurfaceVariantDark = Color(0xFF1E293B)
val PrimaryIndigo = Color(0xFF6366F1)
val AccentWarning = Color(0xFFF59E0B)
val CriticalRed = Color(0xFFEF4444)
val EmeraldSuccess = Color(0xFF10B981)
val TextPrimary = Color(0xFFF8FAFC)
val TextSecondary = Color(0xFF94A3B8)

private val DarkColorPalette = darkColorScheme(
    primary = PrimaryIndigo,
    background = DeepNavy,
    surface = SurfaceDark,
    surfaceVariant = SurfaceVariantDark,
    onPrimary = Color.White,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    onSurfaceVariant = TextSecondary,
    error = CriticalRed
)

@Composable
fun SENTINELTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorPalette,
        content = content
    )
}
