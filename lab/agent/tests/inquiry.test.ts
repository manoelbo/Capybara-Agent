import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInquiryResponse } from '../src/runner/run-inquiry.js'

test('parseInquiryResponse parseia findings com evidence multipla', () => {
  const raw = JSON.stringify({
    scenario: 'positive',
    conclusion: 'Conclusao da inquiry.',
    allegations: [{ id: 'allegation-cartel', statement: 'Ha indicios de cartel.' }],
    findings: [
      {
        id: 'finding-preco',
        claim: 'Preco 38% acima do segundo colocado.',
        status: 'verified',
        supportsAllegationIds: ['allegation-cartel'],
        evidence: [
          { source: 'contrato-042.pdf', page: 87, excerpt: 'valor 38% acima' },
          { source: 'edital-042.pdf', page: 4, excerpt: 'estimativa de referencia' }
        ]
      }
    ]
  })
  const parsed = parseInquiryResponse(raw)
  assert.equal(parsed.scenario, 'positive')
  assert.equal(parsed.allegations.length, 1)
  assert.equal(parsed.findings.length, 1)
  assert.equal(parsed.findings[0]?.evidence.length, 2)
  assert.equal(parsed.findings[0]?.evidence[0]?.source, 'contrato-042.pdf')
})

test('parseInquiryResponse aplica fallback para payload invalido', () => {
  const parsed = parseInquiryResponse('not-json')
  assert.equal(parsed.scenario, 'negative')
  assert.equal(parsed.allegations.length, 0)
  assert.equal(parsed.findings.length, 0)
})
