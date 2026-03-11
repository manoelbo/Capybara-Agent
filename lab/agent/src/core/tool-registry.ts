import type { ToolContext } from '../tools/investigative/context.js'
import {
  createDossierEntity,
  createTimelineEvent,
  linkEntities
} from '../tools/investigative/index.js'
import { processSourceTool } from '../tools/document-processing/process-source-tool.js'

export type ToolName =
  | 'createDossierEntity'
  | 'createTimelineEvent'
  | 'linkEntities'
  | 'processSourceTool'

export interface ToolCall<T = unknown> {
  tool: ToolName
  input: T
}

export interface ToolResult {
  tool: ToolName
  ok: boolean
  output?: unknown
  error?: string
}

type ToolExecutor = (input: any, ctx: ToolContext) => Promise<unknown>

const registry: Record<ToolName, ToolExecutor> = {
  createDossierEntity,
  createTimelineEvent,
  linkEntities,
  processSourceTool
}

export async function executeToolCall(call: ToolCall, ctx: ToolContext): Promise<ToolResult> {
  const executor = registry[call.tool]
  try {
    const output = await executor(call.input, ctx)
    return { tool: call.tool, ok: true, output }
  } catch (error) {
    return {
      tool: call.tool,
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

