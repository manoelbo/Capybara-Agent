import path from 'node:path'
import dotenv from 'dotenv'
import { resolveLabPaths, type LabPaths } from '../core/paths.js'

export interface RuntimeConfig {
  paths: LabPaths
  apiKey: string
  model: string
}

export async function resolveRuntimeConfig(opts?: { model?: string }): Promise<RuntimeConfig> {
  const paths = await resolveLabPaths(process.cwd())
  dotenv.config({ path: path.join(paths.projectRoot, '.env.local') })
  dotenv.config({ path: path.join(paths.projectRoot, '.env') })

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY nao encontrado em .env.local/.env.')
  }

  const model = opts?.model ?? process.env.AGENT_LAB_MODEL ?? 'google/gemini-2.5-flash'
  return { paths, apiKey, model }
}

