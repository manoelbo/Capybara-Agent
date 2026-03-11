import { runAgentSetup } from './runner/run-agent-instructions.js'
import { runCreateLead } from './runner/run-create-lead.js'
import { runDig } from './runner/run-dig.js'
import { runInit } from './runner/run-init.js'
import { runInquiry } from './runner/run-inquiry.js'
import { runDocumentProcessing } from './runner/run-document-processing.js'
import type { FeedbackMode } from './cli/renderer.js'

function parseFlags(argv: string[]): Record<string, string> {
  const flags: Record<string, string> = {}
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token || !token.startsWith('--')) continue
    const key = token.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      flags[key] = 'true'
      continue
    }
    flags[key] = next
    i += 1
  }
  return flags
}

function parseFeedbackMode(value: string | undefined): FeedbackMode | undefined {
  if (!value) return undefined
  if (value === 'plain' || value === 'compact' || value === 'visual') return value
  throw new Error(`Valor invalido para --feedback: ${value}. Use plain, compact ou visual.`)
}

function printUsage(): void {
  console.log(`
Agent Lab CLI

Comandos:
  init [--max-tokens <n>] [--model <openrouter-model>] [--feedback <plain|compact|visual>]
  agent-setup --text "<instrucao>" [--feedback <plain|compact|visual>]
  dig [--model <openrouter-model>] [--feedback <plain|compact|visual>]
  create-lead [--idea "<ideia>"] [--model <openrouter-model>] [--feedback <plain|compact|visual>]
  inquiry --lead <slug> [--model <openrouter-model>] [--feedback <plain|compact|visual>]
  doc-process <subcomando-ou-flags>
`.trim())
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2)
  const flags = parseFlags(rest)
  const feedbackMode = parseFeedbackMode(flags.feedback)

  switch (command) {
    case 'init': {
      const maxTokens = flags['max-tokens'] ? parseInt(flags['max-tokens'], 10) : undefined
      await runInit({
        ...(typeof maxTokens === 'number' && !Number.isNaN(maxTokens) ? { maxTokens } : {}),
        ...(flags.model ? { model: flags.model } : {}),
        ...(feedbackMode ? { feedbackMode } : {})
      })
      return
    }
    case 'agent-setup': {
      const text = flags.text ?? rest.find((x) => !x.startsWith('--'))
      await runAgentSetup({
        text: text ?? '',
        ...(feedbackMode ? { feedbackMode } : {})
      })
      return
    }
    case 'dig': {
      await runDig({
        ...(flags.model ? { model: flags.model } : {}),
        ...(feedbackMode ? { feedbackMode } : {})
      })
      return
    }
    case 'create-lead': {
      const idea = flags.idea
      await runCreateLead({
        ...(idea !== undefined ? { idea } : {}),
        ...(flags.model ? { model: flags.model } : {}),
        ...(feedbackMode ? { feedbackMode } : {})
      })
      return
    }
    case 'inquiry': {
      const lead = flags.lead ?? rest.find((x) => !x.startsWith('--')) ?? ''
      await runInquiry({
        lead,
        ...(flags.model ? { model: flags.model } : {}),
        ...(feedbackMode ? { feedbackMode } : {})
      })
      return
    }
    case 'doc-process': {
      await runDocumentProcessing(rest)
      return
    }
    case 'help':
    case '--help':
    case undefined: {
      printUsage()
      return
    }
    default: {
      throw new Error(`Comando desconhecido: ${command}`)
    }
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Erro no Agent Lab: ${message}`)
  process.exitCode = 1
})

