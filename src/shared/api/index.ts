import { Employee, ShuffleRequest, ShuffleResult } from '../../shared/api/types'

const BASE_URL = 'http://localhost:8000'

async function http<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${input}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  async listEmployees(): Promise<Employee[]> {
    return http<Employee[]>('/employees')
  },
  async shuffle(req: ShuffleRequest): Promise<ShuffleResult> {
    // сервер ожидает snake_case ключи
    const body = JSON.stringify({
      employee_ids: req.employeeIds,
      group_size: req.groupSize,
    })
    return http<ShuffleResult>('/shuffle', { method: 'POST', body })
  },
  async history(): Promise<ShuffleResult[]> {
    return http<ShuffleResult[]>('/shuffle/history')
  }
}

