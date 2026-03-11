import { appendFile } from 'node:fs/promises'
import path from 'node:path'
import { ensureDir } from '../core/fs-io.js'
import type { AgentEventEnvelope, AgentEventSink, AgentStepStatus } from './events.js'
import { AgentEventBus } from './events.js'

export type FeedbackMode = 'plain' | 'compact' | 'visual'

export interface RendererAdapter extends AgentEventSink {}

class CompactRenderer implements RendererAdapter {
  onEvent(envelope: AgentEventEnvelope): void {
    const { event } = envelope
    switch (event.type) {
      case 'agent_step':
        console.log(
          `${statusIcon(event.status)} ${event.label}${event.details ? ` — ${event.details}` : ''}`
        )
        return
      case 'assistant_text_delta':
        process.stdout.write(event.text)
        return
      case 'tool_call':
        console.log(`→ Tool: ${event.tool}${event.inputSummary ? ` (${event.inputSummary})` : ''}`)
        return
      case 'tool_result':
        console.log(
          `${event.status === 'success' ? '✓' : 'x'} Tool ${event.tool}${event.outputSummary ? ` — ${event.outputSummary}` : ''}`
        )
        return
      case 'file_change':
        console.log(
          `${fileIcon(event.changeType)} ${event.path}${formatDelta(event.addedLines, event.removedLines)}`
        )
        return
      case 'system_event':
        console.log(`[${event.level}] ${event.message}`)
        return
      case 'final_summary':
        console.log(`\n${event.title}`)
        for (const line of event.lines) console.log(`- ${line}`)
        return
    }
  }
}

class VisualRenderer implements RendererAdapter {
  onEvent(envelope: AgentEventEnvelope): void {
    const { event } = envelope
    switch (event.type) {
      case 'agent_step':
        this.printBox(`STEP ${statusLabel(event.status)}`, [
          event.label,
          ...(event.details ? [event.details] : [])
        ])
        return
      case 'assistant_text_delta':
        process.stdout.write(event.text)
        return
      case 'tool_call':
        this.printBox('TOOL CALL', [
          `${event.tool}${event.inputSummary ? ` | ${event.inputSummary}` : ''}`
        ])
        return
      case 'tool_result':
        this.printBox(`TOOL RESULT ${event.status.toUpperCase()}`, [
          `${event.tool}${event.outputSummary ? ` | ${event.outputSummary}` : ''}`
        ])
        return
      case 'file_change':
        this.printBox(`FILE ${event.changeType.toUpperCase()}`, [
          event.path,
          `${formatDelta(event.addedLines, event.removedLines).trim() || 'no line delta'}`,
          ...(event.preview ? [event.preview] : [])
        ])
        return
      case 'system_event':
        this.printBox(`SYSTEM ${event.level.toUpperCase()}`, [event.message])
        return
      case 'final_summary':
        this.printBox(event.title, event.lines)
        return
    }
  }

  private printBox(title: string, lines: string[]): void {
    const content = [title, ...lines].filter(Boolean)
    const width = Math.max(28, ...content.map((line) => line.length)) + 2
    const top = `+${'-'.repeat(width)}+`
    console.log(top)
    for (const line of content) {
      console.log(`| ${line.padEnd(width - 1, ' ')}|`)
    }
    console.log(top)
  }
}

class JsonlEventLogSink implements AgentEventSink {
  private queue: Promise<void> = Promise.resolve()

  constructor(private readonly filePath: string) {}

  onEvent(envelope: AgentEventEnvelope): void {
    const line = `${JSON.stringify(envelope)}\n`
    this.queue = this.queue.then(async () => {
      await ensureDir(path.dirname(this.filePath))
      await appendFile(this.filePath, line, 'utf8')
    })
  }

  async flush(): Promise<void> {
    await this.queue
  }
}

export interface FeedbackController {
  mode: FeedbackMode
  logPath: string
  step(label: string, status?: AgentStepStatus, details?: string): void
  info(message: string): void
  warn(message: string): void
  error(message: string): void
  assistantDelta(text: string): void
  fileChange(input: {
    path: string
    changeType: 'new' | 'edited' | 'deleted'
    addedLines?: number
    removedLines?: number
    preview?: string
  }): void
  finalSummary(title: string, lines: string[]): void
  flush(): Promise<void>
}

interface CreateFeedbackControllerInput {
  mode?: FeedbackMode
  eventsDir: string
  sessionName: string
}

export async function createFeedbackController(
  input: CreateFeedbackControllerInput
): Promise<FeedbackController> {
  const mode = input.mode ?? 'visual'
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const logPath = path.join(input.eventsDir, `${input.sessionName}-${timestamp}.jsonl`)

  const sinks: AgentEventSink[] = [new JsonlEventLogSink(logPath)]
  if (mode === 'compact') sinks.unshift(new CompactRenderer())
  if (mode === 'visual') sinks.unshift(new VisualRenderer())
  if (mode === 'plain') sinks.unshift(new CompactRenderer())

  const bus = new AgentEventBus(sinks)
  return {
    mode,
    logPath,
    step(label, status = 'in_progress', details) {
      bus.emit({ type: 'agent_step', label, status, ...(details ? { details } : {}) })
    },
    info(message) {
      bus.emit({ type: 'system_event', level: 'info', message })
    },
    warn(message) {
      bus.emit({ type: 'system_event', level: 'warning', message })
    },
    error(message) {
      bus.emit({ type: 'system_event', level: 'error', message })
    },
    assistantDelta(text) {
      bus.emit({ type: 'assistant_text_delta', text })
    },
    fileChange(change) {
      bus.emit({ type: 'file_change', ...change })
    },
    finalSummary(title, lines) {
      bus.emit({ type: 'final_summary', title, lines })
    },
    async flush() {
      await bus.flush()
    }
  }
}

function statusIcon(status: AgentStepStatus): string {
  if (status === 'completed') return '✓'
  if (status === 'blocked') return 'x'
  if (status === 'pending') return '...'
  return '→'
}

function statusLabel(status: AgentStepStatus): string {
  if (status === 'completed') return 'DONE'
  if (status === 'blocked') return 'BLOCKED'
  if (status === 'pending') return 'PENDING'
  return 'RUNNING'
}

function fileIcon(changeType: 'new' | 'edited' | 'deleted'): string {
  if (changeType === 'new') return '+'
  if (changeType === 'deleted') return '-'
  return '~'
}

function formatDelta(addedLines?: number, removedLines?: number): string {
  if (typeof addedLines !== 'number' && typeof removedLines !== 'number') return ''
  return ` (+${addedLines ?? 0} / -${removedLines ?? 0})`
}
