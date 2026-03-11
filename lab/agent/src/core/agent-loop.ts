import type { ToolContext } from '../tools/investigative/context.js'
import { executeToolCall, type ToolCall, type ToolResult } from './tool-registry.js'

export interface AgentLoopStep {
  step: number
  selectedTool: string
  observation: string
  reflectedNextAction: string
  result: ToolResult
}

export interface AgentLoopRun {
  steps: AgentLoopStep[]
  failures: number
}

export async function runAgentLoop(args: {
  actions: ToolCall[]
  ctx: ToolContext
  maxSteps?: number
}): Promise<AgentLoopRun> {
  const maxSteps = args.maxSteps ?? 40
  const steps: AgentLoopStep[] = []
  const limitedActions = args.actions.slice(0, maxSteps)

  for (const [index, action] of limitedActions.entries()) {
    const result = await executeToolCall(action, args.ctx)
    const observation = result.ok ? 'execucao_ok' : `erro: ${result.error ?? 'desconhecido'}`
    const reflectedNextAction =
      index === limitedActions.length - 1
        ? 'encerrar_loop'
        : result.ok
          ? 'seguir_proxima_tool'
          : 'seguir_com_resiliencia'

    steps.push({
      step: index + 1,
      selectedTool: action.tool,
      observation,
      reflectedNextAction,
      result
    })
  }

  return {
    steps,
    failures: steps.filter((step) => !step.result.ok).length
  }
}

