package org.sentinel.app.repository

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.sentinel.app.engine.DetectionResult
import org.sentinel.app.engine.Message
import java.util.Date
import java.util.UUID

data class IncidentItem(
    val id: String = UUID.randomUUID().toString(),
    val timestamp: Date = Date(),
    val source: String,
    val sender: String?,
    val rawText: String,
    val result: DetectionResult
)

object IncidentRepository {

    private val _incidents = MutableStateFlow<List<IncidentItem>>(emptyList())
    val incidents: StateFlow<List<IncidentItem>> = _incidents.asStateFlow()

    fun addIncident(result: DetectionResult, message: Message, source: String): IncidentItem {
        val item = IncidentItem(
            timestamp = Date(),
            source = source,
            sender = message.sender,
            rawText = message.text,
            result = result
        )
        _incidents.value = listOf(item) + _incidents.value
        return item
    }

    fun deleteIncident(id: String) {
        _incidents.value = _incidents.value.filter { it.id != id }
    }

    fun clearAll() {
        _incidents.value = emptyList()
    }
}
