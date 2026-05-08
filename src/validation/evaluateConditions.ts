import type { ConditionRule, BlockData } from './types'

// ─── Path resolver ────────────────────────────────────────────────────────────

/**
 * Reads a dot-notation path from a data object.
 * e.g. "hero.title" reads data.hero.title
 */
function getValueByPath(data: BlockData, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = data
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

// ─── Single-rule evaluator ────────────────────────────────────────────────────

function evaluateRule(rule: ConditionRule, formData: BlockData): boolean {
  const value = getValueByPath(formData, rule.field)

  switch (rule.operator) {
    case 'equals':
      // eslint-disable-next-line eqeqeq
      return value == rule.value

    case 'not_equals':
      // eslint-disable-next-line eqeqeq
      return value != rule.value

    case 'contains':
      if (typeof value === 'string' && typeof rule.value === 'string')
        return value.includes(rule.value)
      if (Array.isArray(value))
        return (value as unknown[]).includes(rule.value)
      return false

    case 'not_contains':
      if (typeof value === 'string' && typeof rule.value === 'string')
        return !value.includes(rule.value)
      if (Array.isArray(value))
        return !(value as unknown[]).includes(rule.value)
      return true

    case 'greater_than':
      return (
        typeof value === 'number' &&
        typeof rule.value === 'number' &&
        value > rule.value
      )

    case 'less_than':
      return (
        typeof value === 'number' &&
        typeof rule.value === 'number' &&
        value < rule.value
      )

    case 'in':
      return Array.isArray(rule.value) && (rule.value as unknown[]).includes(value)

    case 'not_in':
      return !Array.isArray(rule.value) || !(rule.value as unknown[]).includes(value)

    case 'exists':
      return (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
      )

    case 'empty':
      return (
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      )

    default:
      return true
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Evaluates a set of condition rules against the current form data.
 *
 * Returns true when the field should be VISIBLE (conditions satisfied).
 * Returns true when conditions array is empty or undefined (always show).
 *
 * @param conditions - Array of ConditionRule objects to evaluate.
 * @param conditionMode - 'AND' = all must pass, 'OR' = any must pass. Defaults to 'AND'.
 * @param formData   - The data object at the same nesting level as the field being evaluated.
 */
export function evaluateConditions(
  conditions: ConditionRule[] | undefined,
  conditionMode: 'AND' | 'OR' | undefined,
  formData: BlockData,
): boolean {
  if (!conditions || conditions.length === 0) return true

  const results = conditions.map((rule) => evaluateRule(rule, formData))

  return (conditionMode ?? 'AND') === 'OR'
    ? results.some(Boolean)
    : results.every(Boolean)
}
