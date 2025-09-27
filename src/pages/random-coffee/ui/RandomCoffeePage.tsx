import React, { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../../shared/api'
import type { Employee, ShuffleResult } from '../../../shared/api/types'
import { Modal } from '../../../shared/ui/Modal'

function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let mounted = true
    api.listEmployees()
      .then((list) => {
        if (mounted) setEmployees(list)
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])
  return { employees, loading, error }
}

function useHistory() {
  const [items, setItems] = useState<ShuffleResult[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let mounted = true
    api.history().then((h) => { if (mounted) setItems(h) }).finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])
  return { items, loading, setItems }
}

function groupByIds(ids: string[], all: Employee[], size: number): Employee[][] {
  const map = new Map(all.map(e => [e.id, e]))
  const groups: Employee[][] = []
  for (let i = 0; i < ids.length; i += size) {
    groups.push(ids.slice(i, i + size).map(id => map.get(id)!).filter(Boolean))
  }
  return groups
}

const MasterCheckbox: React.FC<{ checked: boolean; indeterminate?: boolean; onChange: () => void; label?: string }> = ({ checked, indeterminate, onChange, label }) => {
  const ref = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate && !checked
  }, [indeterminate, checked])
  return (
    <label className="row" style={{ gap: 6, alignItems: 'center' }}>
      <input ref={ref} type="checkbox" checked={checked} onChange={onChange} />
      {label && <span>{label}</span>}
    </label>
  )
}

export const RandomCoffeePage: React.FC = () => {
  const { employees, loading } = useEmployees()
  const history = useHistory()

  const [query, setQuery] = useState('')
  const [dept, setDept] = useState('')
  const [position, setPosition] = useState('')
  const [status, setStatus] = useState('')

  const [selected, setSelected] = useState<string[]>([])
  const [groupSize, setGroupSize] = useState(2)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ShuffleResult | null>(null)
  const [shuffling, setShuffling] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalPairs, setModalPairs] = useState<Employee[][]>([])
  const [previewOrder, setPreviewOrder] = useState<string[]>([])

  const depts = useMemo(() => Array.from(new Set(employees.map(e => e.dept).filter(Boolean))) as string[], [employees])
  const positions = useMemo(() => Array.from(new Set(employees.map(e => e.position).filter(Boolean))) as string[], [employees])
  const statuses = ['Активный', 'Приглашение']

  const allFilteredIds = useMemo(() => employees
    .filter(e => {
      const q = query.trim().toLowerCase()
      if (q && !(e.name.toLowerCase().includes(q) || (e.dept||'').toLowerCase().includes(q) || (e.position||'').toLowerCase().includes(q))) return false
      if (dept && e.dept !== dept) return false
      if (position && e.position !== position) return false
      if (status && e.status !== status) return false
      return true
    })
    .map(e => e.id), [employees, query, dept, position, status])
  const allSelected = useMemo(() => allFilteredIds.length > 0 && allFilteredIds.every(id => selected.includes(id)), [allFilteredIds, selected])
  const someSelected = useMemo(() => selected.length > 0 && !allSelected && allFilteredIds.some(id => selected.includes(id)), [selected, allSelected, allFilteredIds])

  const filtered = useMemo(() => {
    let list = employees
    const q = query.trim().toLowerCase()
    if (q) list = list.filter(e => (
      e.name.toLowerCase().includes(q) || (e.dept||'').toLowerCase().includes(q) || (e.position||'').toLowerCase().includes(q)
    ))
    if (dept) list = list.filter(e => e.dept === dept)
    if (position) list = list.filter(e => e.position === position)
    if (status) list = list.filter(e => e.status === status)
    return list
  }, [employees, query, dept, position, status])

  const pageSize = 10
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const start = (page - 1) * pageSize
  const pageItems = filtered.slice(start, start + pageSize)

  const valid = selected.length > 0 && groupSize > 0 && selected.length % groupSize === 0
  const errorText = !selected.length ? 'Выберите сотрудников' : (groupSize <= 0 ? 'Некорректный размер группы' : (selected.length % groupSize !== 0 ? 'Количество сотрудников должно делиться на размер группы' : ''))

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function resetFilters() {
    setQuery(''); setDept(''); setPosition(''); setStatus('')
    setPage(1)
  }

  function selectAllFiltered() {
    const allIds = filtered.map(e => e.id)
    setSelected(prev => Array.from(new Set([...prev, ...allIds])))
  }
  function clearSelection() {
    setSelected([])
  }

  function toggleAllFiltered() {
    if (allSelected) {
      clearSelection()
    } else {
      setSelected(allFilteredIds)
    }
  }

  async function onSubmit() {
    setSubmitting(true)
    setResult(null)
    try {
      setShuffling(true)
      setPreviewOrder(selected)
      const tick = () => {
        setPreviewOrder(prev => {
          const arr = [...(prev.length ? prev : selected)]
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
          }
          return arr
        })
      }
      const interval = setInterval(tick, 140)
      const start = Date.now()

      const res = await api.shuffle({ employeeIds: selected, groupSize })

      const minMs = 1000
      const elapsed = Date.now() - start
      if (elapsed < minMs) await new Promise(r => setTimeout(r, minMs - elapsed))

      clearInterval(interval)

      setResult(res)
      // перечитываем историю с сервера
      const freshHistory = await api.history()
      history.setItems(freshHistory)
      const ids = res.groups.flat()
      const size = res.groups[0]?.length || groupSize
      const pairs = groupByIds(ids, employees, size)
      setModalPairs(pairs)
      setModalOpen(true)
    } finally {
      setShuffling(false)
      setPreviewOrder([])
      setSubmitting(false)
    }
  }

  useEffect(() => { setPage(1) }, [query, dept, position, status])

  return (
    <div className="row" style={{alignItems: 'flex-start', gap: 16}}>
      <div style={{flex: 2}}>
        <div className="card" style={{marginBottom: 12}}>
          <div className="space-between" style={{marginBottom: 12}}>
            <h2 style={{margin: 0}}>Сотрудники</h2>
            <div className="row" style={{gap: 8}}>
              <input className="number" type="number" min={1} value={groupSize} onChange={(e) => setGroupSize(Math.max(1, Number(e.target.value)))} style={{width: 140}} />
              <button className="btn primary" disabled={!valid || submitting} onClick={onSubmit}>
                {submitting ? 'Перемешиваем…' : 'Создать группы'}
              </button>
            </div>
          </div>
          <div className="row" style={{gap: 8, flexWrap: 'wrap'}}>
            <MasterCheckbox checked={allSelected} indeterminate={someSelected} onChange={toggleAllFiltered} label={allSelected ? 'Снять выбор' : 'Выбрать всех'} />
            <input className="input" placeholder="Поиск по Ф.И.О, почте" value={query} onChange={(e) => setQuery(e.target.value)} style={{minWidth: 240, flex: 1}} />
            <select className="select" value={dept} onChange={(e) => setDept(e.target.value)}>
              <option value="">Отдел</option>
              {depts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="select" value={position} onChange={(e) => setPosition(e.target.value)}>
              <option value="">Должность</option>
              {positions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Статус</option>
              {['Активный', 'Приглашение'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="btn ghost" onClick={resetFilters}>Сбросить</button>
          </div>
          {!valid && <div style={{color: 'var(--danger)', marginTop: 8}}>{errorText}</div>}
          {shuffling && (
            <div className="shuffle-container">
              <div className="row" style={{gap: 8, flexWrap: 'wrap'}}>
                {(previewOrder.length ? previewOrder : selected).map(id => {
                  const emp = employees.find(e => e.id === id)
                  return (
                    <span key={id} className="pill shuffle">
                      <span className="dot" /> {emp?.name || id}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{marginBottom: 12, padding: 0}}>
          <table className="table">
            <thead>
              <tr>
                <th style={{width: 56}}>#</th>
                <th>Сотрудник</th>
                <th>Отдел</th>
                <th>Контакты</th>
                <th>Стаж работы</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="cell-muted">Загружаем сотрудников…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="cell-muted">Ничего не найдено</td></tr>
              ) : (
                pageItems.map((e, idx) => (
                  <tr key={e.id}>
                    <td>
                      <div className="row" style={{gap: 8}}>
                        <input type="checkbox" checked={selected.includes(e.id)} onChange={() => toggle(e.id)} />
                        <span className="cell-muted">{start + idx + 1}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{fontWeight: 600}}>{e.name}</div>
                      <div className="cell-muted">{e.position || ''}</div>
                    </td>
                    <td>{e.dept}</td>
                    <td>
                      <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
                        {e.phoneMasked && <span>{e.phoneMasked}</span>}
                        {e.hasWhatsApp && <span className="badge">WhatsApp</span>}
                        {e.hasTelegram && <span className="badge">Telegram</span>}
                        {e.email && <span className="cell-muted">✉︎ {e.email}</span>}
                      </div>
                    </td>
                    <td>{e.tenureMonths ?? 0} мес.</td>
                    <td>
                      <span className={`badge ${e.status === 'Активный' ? 'success' : 'warning'}`}>{e.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="row" style={{justifyContent:'space-between', marginBottom: 12}}>
          <div className="cell-muted">Показано {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + pageSize, filtered.length)} из {filtered.length}</div>
          <div className="row" style={{gap: 6}}>
            <button className="btn ghost" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Назад</button>
            <span className="cell-muted">Стр. {page} / {totalPages}</span>
            <button className="btn ghost" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Вперёд</button>
          </div>
        </div>

      </div>

      <aside style={{flex: 1}}>
        <div className="card">
          <div className="space-between">
            <h3 style={{marginTop: 0}}>История</h3>
            <button className="btn ghost" onClick={() => window.location.reload()}>Обновить</button>
          </div>
          {history.loading ? (
            <div className="cell-muted">Загружаем…</div>
          ) : history.items.length === 0 ? (
            <div className="cell-muted">Пока пусто</div>
          ) : (
            <div className="list">
              {history.items.map((h, i) => (
                <button
                  key={i}
                  className="btn ghost"
                  style={{justifyContent:'space-between', display:'flex', width:'100%'}}
                  onClick={() => {
                    const ids = h.groups.flat()
                    const size = h.groups[0]?.length || 2
                    const pairs = groupByIds(ids, employees, size)
                    setModalPairs(pairs)
                    setModalOpen(true)
                  }}
                >
                  <span>
                    <div style={{fontWeight: 600}}>Сид {h.seed}</div>
                    <div className="cell-muted">{new Date(h.at).toLocaleString()}</div>
                  </span>
                  <span className="badge">Групп: {h.groups.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Результаты шафла">
        <div className="groups">
          {modalPairs.length === 0 ? (
            <div className="cell-muted">Нет данных</div>
          ) : (
            modalPairs.map((g, idx) => (
              <div key={idx} className="group">
                <span className="badge">Группа {idx + 1}</span>
                {g.map(emp => (
                  <span key={emp.id} className="pill"><span className="dot" /> {emp.name}</span>
                ))}
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}

