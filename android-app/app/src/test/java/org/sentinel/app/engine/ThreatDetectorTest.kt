package org.sentinel.app.engine

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ThreatDetectorTest {

    @Test
    fun testHarmlessMessage() {
        val messages = listOf(
            Message("1", 1, "Friend", "Hey, are we still meeting for lunch at 1 PM?")
        )
        val result = ThreatDetector.analyze(messages)
        assertEquals(OverallConcern.NO_STRONG_INDICATORS, result.overallConcern)
        assertTrue(result.findings.isEmpty())
        assertFalse(result.immediateSafetyAlert)
    }

    @Test
    fun testExplicitThreat() {
        val messages = listOf(
            Message("1", 1, "Unknown", "I will track you down and hurt you if you don't respond right now.")
        )
        val result = ThreatDetector.analyze(messages)
        assertEquals(OverallConcern.ELEVATED_CONCERN, result.overallConcern)
        assertTrue(result.immediateSafetyAlert)
        assertEquals(1, result.findings.size)
        assertEquals("explicit-threats", result.findings[0].ruleId)
        assertEquals(Severity.ELEVATED, result.findings[0].severity)
    }

    @Test
    fun testSextortionThreat() {
        val messages = listOf(
            Message("1", 1, "Attacker", "Pay me $500 or I will leak your nudes to all your followers.")
        )
        val result = ThreatDetector.analyze(messages)
        assertEquals(OverallConcern.ELEVATED_CONCERN, result.overallConcern)
        assertTrue(result.immediateSafetyAlert)
        assertTrue(result.findings.any { it.ruleId == "image-abuse-threat" })
    }

    @Test
    fun testOtpHarvesting() {
        val messages = listOf(
            Message("1", 1, "Scammer", "What is your OTP? Tell me the code immediately.")
        )
        val result = ThreatDetector.analyze(messages)
        assertEquals(OverallConcern.CAUTION, result.overallConcern)
        assertFalse(result.immediateSafetyAlert)
        assertTrue(result.findings.any { it.ruleId == "sensitive-info" })
    }

    @Test
    fun testSuspiciousLinkAndMoneyDemand() {
        val messages = listOf(
            Message("1", 1, "Scammer", "Urgent! Send me money immediately on this link: http://free-cash.xyz/claim")
        )
        val result = ThreatDetector.analyze(messages)
        assertEquals(OverallConcern.ELEVATED_CONCERN, result.overallConcern)
        assertTrue(result.findings.size >= 2)
    }

    @Test
    fun testNegatedThreat() {
        val messages = listOf(
            Message("1", 1, "Friend", "Don't worry, I will not hurt you ever!")
        )
        val result = ThreatDetector.analyze(messages)
        assertEquals(OverallConcern.NO_STRONG_INDICATORS, result.overallConcern)
        assertTrue(result.findings.none { it.ruleId == "explicit-threats" })
    }
}
