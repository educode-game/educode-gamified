// server/utils/validate.ts
import { createError } from 'h3'

export function requireString(val: any, name = 'value') {
  if (typeof val !== 'string' || val.trim() === '') {
    throw createError({ statusCode: 400, message: `${name} is required and must be a non-empty string` })
  }
  return val.trim()
}

export function requireNumber(val: any, name = 'value') {
  const n = Number(val)
  if (!Number.isFinite(n) || isNaN(n)) {
    throw createError({ statusCode: 400, message: `${name} is required and must be a number` })
  }
  return n
}

export function requireOneOf(val: any, allowed: any[], name = 'value') {
  if (!allowed.includes(val)) throw createError({ statusCode: 400, message: `${name} must be one of ${allowed.join(', ')}` })
  return val
}
