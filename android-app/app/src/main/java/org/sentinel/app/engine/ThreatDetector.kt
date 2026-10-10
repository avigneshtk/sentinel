package org.sentinel.app.engine

import java.util.Date
import java.util.regex.Pattern

enum class Severity {
    INFORMATIONAL,
    CAUTION,
    ELEVATED
}

enum class Confidence {
    SUPPORTED,
    POSSIBLE,
    UNCERTAIN
}

enum class OverallConcern {
    NO_STRONG_INDICATORS,
    CAUTION,
    ELEVATED_CONCERN
}

data class Message(
    val id: String,
    val index: Int,
    val sender: String?,
    val text: String,
    val timestamp: Date? = null,
    val packageName: String? = null
)

data class SignalMatch(
    val ruleId: String,
    val signal: String,
    val severity: Severity,
    val confidence: Confidence,
    val excerpt: String,
    val messageIndexes: List<Int>,
    val explanation: String,
    val recommendation: String,
    val limitation: String? = null
)

data class DetectionResult(
    val analyzedAt: Date = Date(),
    val messageCount: Int,
    val findings: List<SignalMatch>,
    val overallConcern: OverallConcern,
    val title: String,
    val body: String,
    val immediateSafetyAlert: Boolean,
    val recommendations: List<String>
)

object ThreatDetector {

    private val NEGATION_PATTERNS = listOf(
        Pattern.compile("\\b(not|never|don'?t|won'?t|didn'?t|wouldn'?t|cannot|can'?t)\\b", Pattern.CASE_INSENSITIVE)
    )

    private val EXPLICIT_THREATS = listOf(
        Pattern.compile("\\b(i'?ll|i will|i'?m going to|let me)\\s+(kill|murder|hurt|harm|beat up|ruin|track down|find)\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(kill|murder)\\s+(you|yourself|u\\b)", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\byou'?ll\\s+(regret|pay|suffer|be sorry)\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(beat you up|hurt you|harm you|ruin your (life|career|reputation|future))\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(you will die|you'?ll die|die (today|tonight|now))\\b", Pattern.CASE_INSENSITIVE)
    )

    private val SEXTORTION_PATTERNS = listOf(
        Pattern.compile("\\b(leak|post|share|send|publish|upload|distribute)\\s+(your|the)?\\s*(nudes|pics|pictures|photos|videos|intimate|private)\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(send|give|pay)\\s+.*\\s+or\\s+(i'?ll|i will)\\s+(post|share|leak|send)\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(blackmail|expose you|ruin your reputation)\\b", Pattern.CASE_INSENSITIVE)
    )

    private val SENSITIVE_INFO_PATTERNS = listOf(
        Pattern.compile("\\b(send|share|tell me|give me)\\s+(your|the)?\\s*(otp|password|passcode|pin|verification code|credit card|cvv|bank account)\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(what is|whats)\\s+(your|the)?\\s*(otp|password|pin|code)\\b", Pattern.CASE_INSENSITIVE)
    )

    private val FINANCIAL_URGENCY_PATTERNS = listOf(
        Pattern.compile("\\b(send|transfer|upi|gpay|phonepe|wire)\\s+(me|money|cash|rs|rupees|\\$)\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(urgent|emergency|immediately|right now)\\s+.*\\s*(send|transfer|money)\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(need|pay)\\s+(money|cash|rs|rupees|\\$)\\s+(urgently|today|now)\\b", Pattern.CASE_INSENSITIVE)
    )

    private val SUSPICIOUS_LINK_PATTERNS = listOf(
        Pattern.compile("https?://[\\w\\.-]+\\.(xyz|top|club|link|click|online|free|tk|ml|ga|cf|gq|work|vip)/?\\S*", Pattern.CASE_INSENSITIVE),
        Pattern.compile("https?://(bit\\.ly|tinyurl\\.com|t\\.co|cutt\\.ly|rb\\.gy|is\\.gd)/\\S+", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\b(click|open)\\s+(this|the)?\\s*link\\b", Pattern.CASE_INSENSITIVE)
    )

    private val SECRECY_PATTERNS = listOf(
        Pattern.compile("\\b(don'?t|do not)\\s+(tell|show|share with)\\s+(anyone|your parents|friends|police)\\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\\bkeep\\s+this\\s+(a\\s+)?secret\\b", Pattern.CASE_INSENSITIVE)
    )

    fun analyze(messages: List<Message>): DetectionResult {
        if (messages.isEmpty()) {
            return DetectionResult(
                messageCount = 0,
                findings = emptyList(),
                overallConcern = OverallConcern.NO_STRONG_INDICATORS,
                title = "No message provided",
                body = "No messages available to analyze.",
                immediateSafetyAlert = false,
                recommendations = emptyList()
            )
        }

        val findings = mutableListOf<SignalMatch>()

        // 1. Explicit Threats
        for (msg in messages) {
            for (pattern in EXPLICIT_THREATS) {
                val matcher = pattern.matcher(msg.text)
                if (matcher.find()) {
                    val excerpt = matcher.group()
                    if (!isNegated(msg.text, matcher.start())) {
                        findings.add(
                            SignalMatch(
                                ruleId = "explicit-threats",
                                signal = "Explicit threat of violence or harm",
                                severity = Severity.ELEVATED,
                                confidence = Confidence.SUPPORTED,
                                excerpt = excerpt,
                                messageIndexes = listOf(msg.index),
                                explanation = "Direct threatening language directed at you detected.",
                                recommendation = "Prioritise your safety. Do not provoke or escalate. If in danger, contact emergency helpline 112.",
                                limitation = "SENTINEL cannot verify real-world physical intent automatically."
                            )
                        )
                        break
                    }
                }
            }
        }

        // 2. Sextortion & Image Abuse
        for (msg in messages) {
            for (pattern in SEXTORTION_PATTERNS) {
                val matcher = pattern.matcher(msg.text)
                if (matcher.find()) {
                    val excerpt = matcher.group()
                    findings.add(
                        SignalMatch(
                            ruleId = "image-abuse-threat",
                            signal = "Blackmail or threat to share intimate media",
                            severity = Severity.ELEVATED,
                            confidence = Confidence.SUPPORTED,
                            excerpt = excerpt,
                            messageIndexes = listOf(msg.index),
                            explanation = "Language indicating extortion or threats to expose private images detected.",
                            recommendation = "Do NOT comply with demands or send money/images. Take screenshots as evidence, block the sender, and report to 1930 / cybercrime.gov.in.",
                            limitation = "Automated detection flags pattern matches, user judgment required."
                        )
                    )
                    break
                }
            }
        }

        // 3. Sensitive Info / OTP Harvesting
        for (msg in messages) {
            for (pattern in SENSITIVE_INFO_PATTERNS) {
                val matcher = pattern.matcher(msg.text)
                if (matcher.find()) {
                    val excerpt = matcher.group()
                    findings.add(
                        SignalMatch(
                            ruleId = "sensitive-info",
                            signal = "Request for OTP, PIN, or confidential credentials",
                            severity = Severity.CAUTION,
                            confidence = Confidence.SUPPORTED,
                            excerpt = excerpt,
                            messageIndexes = listOf(msg.index),
                            explanation = "Request for sensitive credentials or verification codes detected.",
                            recommendation = "Never share OTPs, passwords, or PINs with anyone. Banks and official apps will never ask for your OTP.",
                            limitation = "Ensure sender identity before sharing any sensitive information."
                        )
                    )
                    break
                }
            }
        }

        // 4. Financial Urgency / Money Scam
        for (msg in messages) {
            for (pattern in FINANCIAL_URGENCY_PATTERNS) {
                val matcher = pattern.matcher(msg.text)
                if (matcher.find()) {
                    val excerpt = matcher.group()
                    findings.add(
                        SignalMatch(
                            ruleId = "money-pressure",
                            signal = "Urgent demand for money or financial transfer",
                            severity = Severity.CAUTION,
                            confidence = Confidence.SUPPORTED,
                            excerpt = excerpt,
                            messageIndexes = listOf(msg.index),
                            explanation = "Urgent monetary request detected. Frequent pattern in impersonation scams.",
                            recommendation = "Verify the requester's identity through a separate phone call or trusted channel before transferring money.",
                            limitation = "Financial requests between close trusted contacts are common, verify context."
                        )
                    )
                    break
                }
            }
        }

        // 5. Suspicious Links
        for (msg in messages) {
            for (pattern in SUSPICIOUS_LINK_PATTERNS) {
                val matcher = pattern.matcher(msg.text)
                if (matcher.find()) {
                    val excerpt = matcher.group()
                    findings.add(
                        SignalMatch(
                            ruleId = "suspicious-link",
                            signal = "Suspicious or shortened web link",
                            severity = Severity.CAUTION,
                            confidence = Confidence.POSSIBLE,
                            excerpt = excerpt,
                            messageIndexes = listOf(msg.index),
                            explanation = "Unusual domain extension or shortened link detected.",
                            recommendation = "Do not click unknown links or enter credentials on unknown web pages.",
                            limitation = "Some short links are legitimate marketing links."
                        )
                    )
                    break
                }
            }
        }

        // 6. Secrecy & Coercion
        for (msg in messages) {
            for (pattern in SECRECY_PATTERNS) {
                val matcher = pattern.matcher(msg.text)
                if (matcher.find()) {
                    val excerpt = matcher.group()
                    findings.add(
                        SignalMatch(
                            ruleId = "urgency-secrecy",
                            signal = "Pressure for secrecy or hiding communications",
                            severity = Severity.CAUTION,
                            confidence = Confidence.SUPPORTED,
                            excerpt = excerpt,
                            messageIndexes = listOf(msg.index),
                            explanation = "Demands to hide conversation from trusted friends, family, or police detected.",
                            recommendation = "Be cautious when asked to hide interactions. Talk to a trusted person if you feel uncomfortable.",
                            limitation = "Context determines whether secrecy request is malicious."
                        )
                    )
                    break
                }
            }
        }

        // Deduplicate findings by ruleId & messageIndex
        val uniqueFindings = findings.distinctBy { "${it.ruleId}:${it.messageIndexes.joinToString()}" }

        val elevatedCount = uniqueFindings.count { it.severity == Severity.ELEVATED }
        val cautionCount = uniqueFindings.count { it.severity == Severity.CAUTION }

        val overallConcern = when {
            elevatedCount >= 1 || cautionCount >= 2 -> OverallConcern.ELEVATED_CONCERN
            cautionCount == 1 -> OverallConcern.CAUTION
            else -> OverallConcern.NO_STRONG_INDICATORS
        }

        val immediateSafetyAlert = uniqueFindings.any { f ->
            f.severity == Severity.ELEVATED && (f.ruleId == "explicit-threats" || f.ruleId == "image-abuse-threat")
        }

        val (title, body) = when (overallConcern) {
            OverallConcern.NO_STRONG_INDICATORS -> Pair(
                "No strong risk indicators detected",
                "The automated rules did not detect strong warning signs in the provided message content. Always trust your instincts if something feels wrong."
            )
            OverallConcern.CAUTION -> Pair(
                "Potential risk indicators detected — review with care",
                "Warning signs such as financial pressure, requests for credentials, or suspicious links were identified. Review findings carefully."
            )
            OverallConcern.ELEVATED_CONCERN -> Pair(
                "High risk warning: Threat or extortion pattern detected",
                "Severe warning signs (explicit threats, blackmail, or coercive pressure) were detected. Prioritise safety and review recommended actions."
            )
        }

        val recs = uniqueFindings.map { it.recommendation }.distinct()

        return DetectionResult(
            messageCount = messages.size,
            findings = uniqueFindings,
            overallConcern = overallConcern,
            title = title,
            body = body,
            immediateSafetyAlert = immediateSafetyAlert,
            recommendations = recs
        )
    }

    private fun isNegated(text: String, matchIndex: Int): Boolean {
        val windowStart = (matchIndex - 30).coerceAtLeast(0)
        val prefix = text.substring(windowStart, matchIndex)
        return NEGATION_PATTERNS.any { it.matcher(prefix).find() }
    }
}
