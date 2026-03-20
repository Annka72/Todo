import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

const CATS = ['investor', 'produkt', 'drift', 'marked', 'annet']
const CAT_LABELS = { investor: 'Investor', produkt: 'Produkt', drift: 'Drift', marked: 'Marked', annet: 'Annet' }
const CAT_COLORS = {
  investor: { bg: '#E6F1FB', text: '#0C447C' },
  produkt:  { bg: '#E1F5EE', text: '#085041' },
  drift:    { bg: '#FAEEDA', text: '#633806' },
  marked:   { bg: '#FBEAF0', text: '#72243E' },
  annet:    { bg: '#F1EFE8', text: '#444441' },
}

const PRIORITIES = ['high', 'medium', 'low']
const PRI_CONFIG = {
  high:   { symbol: '🔴', label: 'Høy' },
  medium: { symbol: '🟡', label: 'Medium' },
  low:    { symbol: '🟢', label: 'Lav' },
}

function Tag({ cat }) {
  const c = CAT_COLORS[cat] || CAT_COLORS.annet
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 11, padding: '2px 9px', borderRadius: 20, fontWeight: 500, flexShrink: 0 }}>
      {CAT_LABELS[cat]}
    </span>
  )
}

function fileExt(name) {
  const parts = name.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : 'fil'
}

function FileIcon({ ext }) {
  const colors = { pdf: '#E24B4A', docx: '#185FA5', xlsx: '#3B6D11', pptx: '#D85A30' }
  const col = colors[ext] || '#888780'
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="9" height="13" rx="1.5" fill={col} opacity="0.15"/>
      <path d="M2 3.5C2 2.67 2.67 2 3.5 2H9L13 6v7.5A1.5 1.5 0 0111.5 15h-8A1.5 1.5 0 012 13.5V3.5z" stroke={col} strokeWidth="1"/>
      <path d="M9 2v4h4" stroke={col} strokeWidth="1"/>
      <text x="4" y="12.5" fontSize="3.5" fill={col} fontWeight="600">{ext.toUpperCase().slice(0, 4)}</text>
    </svg>
  )
}

function ClaudePanel({ task, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const docs = task.documents || []
  const docNames = docs.map(d => d.name).join(', ')

  useEffect(() => {
    const intro = docs.length > 0
      ? `Hei! Jeg ser oppgaven «${task.text}» har ${docs.length} dokument(er): ${docs.map(d => d.name).join(', ')}. Jeg har lest disse og kan diskutere innholdet. Hva vil du vite?`
      : `Hei! Jeg er klar til å hjelpe med oppgaven «${task.text}». Hva vil du tenke igjennom?`
    setMessages([{ role: 'assistant', content: intro }])
  }, [task.text, docNames])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const docUrls = docs.filter(d => d.url).map(d => ({ name: d.name, url: d.url }))
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: `Du er en strategisk sparringspartner for Ann-Kristin og Henrik i Dynamisk Helse. De jobber med fire produkter: SkillAid+ (kompetanseplattform for helsearbeidere), Teknotassen (AI-assistent for velferdsteknologi), Veilederen (compliance-verktøy), og SkillAid Bygg (onboarding for helsebygg). De er i en aktiv investorfase (Drops Health-plattformen). Svar konsist og strategisk på norsk. Referer til dokumentinnhold når det er relevant.`,
          messages: newMessages,
          documents: docUrls
        })
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || 'Noe gikk galt.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Feil ved tilkobling til Claude.' }])
    }
    setLoading(false)
  }

  return (
    <div className="claude-panel">
      <div className="claude-header">
        <span>Sparre med Claude</span>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="claude-task-label">{task.text}</div>
      <div className="claude-messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg msg-${m.role}`}>
            <div className="msg-label">{m.role === 'user' ? 'Deg' : 'Claude'}</div>
            <div className="msg-content">{m.content}</div>
          </div>
        ))}
        {loading && <div className="msg msg-assistant"><div className="msg-label">Claude</div><div className="msg-content typing">...</div></div>}
      </div>
      <div className="claude-input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Still et spørsmål..."
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input.trim()}>Send</button>
      </div>
    </div>
  )
}

function PrioritySelect({ value, onChange }) {
  return (
    <select
      className="priority-select"
      value={value || 'medium'}
      onChange={e => onChange(e.target.value)}
      title="Prioritet"
    >
      {PRIORITIES.map(p => (
        <option key={p} value={p}>{PRI_CONFIG[p].symbol} {PRI_CONFIG[p].label}</option>
      ))}
    </select>
  )
}

function TaskCard({ task, onUpdate, onDelete, onDragStart, onDragOver, onDrop, isDragging }) {
  const [expanded, setExpanded] = useState(false)
  const [subInput, setSubInput] = useState('')
  const [showClaude, setShowClaude] = useState(false)

  async function changePriority(priority) {
    await supabase.from('tasks').update({ priority }).eq('id', task.id)
    onUpdate()
  }

  async function toggleTask() {
    const { error } = await supabase.from('tasks').update({ done: !task.done }).eq('id', task.id)
    if (!error) onUpdate()
  }

  async function deleteTask() {
    await supabase.from('tasks').delete().eq('id', task.id)
    onDelete()
  }

  async function addSub() {
    if (!subInput.trim()) return
    await supabase.from('subtasks').insert({ task_id: task.id, text: subInput.trim(), position: task.subtasks?.length || 0 })
    setSubInput('')
    onUpdate()
  }

  async function toggleSub(sub) {
    await supabase.from('subtasks').update({ done: !sub.done }).eq('id', sub.id)
    onUpdate()
  }

  async function deleteSub(subId) {
    await supabase.from('subtasks').delete().eq('id', subId)
    onUpdate()
  }

  async function handleFileUpload(e) {
    const files = e.target.files
    if (!files) return
    for (const f of files) {
      const filePath = `${task.id}/${Date.now()}_${f.name}`
      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, f)
      if (uploadError) { console.error('Upload feil:', uploadError); continue }
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)
      await supabase.from('documents').insert({
        task_id: task.id,
        name: f.name,
        size: Math.round(f.size / 1024) + 'KB',
        url: urlData.publicUrl
      })
    }
    onUpdate()
  }

  async function deleteDoc(docId) {
    await supabase.from('documents').delete().eq('id', docId)
    onUpdate()
  }

  const subs = task.subtasks || []
  const docs = task.documents || []
  const subDone = subs.filter(s => s.done).length

  return (
    <div
      className={`task-card${task.done ? ' done' : ''}${isDragging ? ' dragging' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="task-main">
        <span className="drag-handle" title="Dra for å sortere">⠿</span>
        <input type="checkbox" checked={task.done} onChange={toggleTask} />
        <div className="task-body">
          <span className="task-text">{task.text}</span>
          {subs.length > 0 && <span className="sub-count">{subDone}/{subs.length}</span>}
          {docs.length > 0 && <span className="sub-count">{docs.length} dok.</span>}
        </div>
        <PrioritySelect value={task.priority} onChange={changePriority} />
        <Tag cat={task.category} />
        <div className="task-actions">
          <button className={`icon-btn${expanded ? ' active' : ''}`} onClick={() => setExpanded(v => !v)}>
            {expanded ? 'Lukk' : 'Detaljer'}
          </button>
          <button className="icon-btn ask" onClick={() => setShowClaude(v => !v)}>Spør ↗</button>
          <button className="del-x" onClick={deleteTask}>✕</button>
        </div>
      </div>

      {expanded && (
        <div className="task-expanded">
          <div className="exp-section-label">Underpunkter</div>
          {subs.length === 0 && <div className="empty-hint">Ingen underpunkter ennå.</div>}
          {subs.map(s => (
            <div key={s.id} className={`sub-item${s.done ? ' done' : ''}`}>
              <input type="checkbox" checked={s.done} onChange={() => toggleSub(s)} />
              <span className="sub-text">{s.text}</span>
              <button className="del-x" onClick={() => deleteSub(s.id)}>✕</button>
            </div>
          ))}
          <div className="add-sub-row">
            <input
              value={subInput}
              onChange={e => setSubInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSub()}
              placeholder="Legg til underpunkt..."
            />
            <button onClick={addSub}>+ Legg til</button>
          </div>

          <div className="exp-section-label" style={{ marginTop: 14 }}>Dokumenter</div>
          {docs.length === 0 && <div className="empty-hint">Ingen dokumenter lagt til.</div>}
          {docs.map(d => (
            <div key={d.id} className="doc-item">
              <FileIcon ext={fileExt(d.name)} />
              <span className="doc-name">{d.name}</span>
              <span className="doc-size">{d.size}</span>
              <button className="del-x" onClick={() => deleteDoc(d.id)}>✕</button>
            </div>
          ))}
          <label className="file-upload-area">
            <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
            Klikk for å laste opp dokument
          </label>
        </div>
      )}

      {showClaude && <ClaudePanel task={task} onClose={() => setShowClaude(false)} />}
    </div>
  )
}

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Dynamisk Helse</h1>
        <p className="subtitle">Logg inn for å se oppgavelisten</p>
        {sent ? (
          <div className="login-sent">
            Sjekk e-posten din! Vi har sendt en innloggingslenke til <strong>{email}</strong>.
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Din e-postadresse..."
              required
            />
            <button type="submit" className="add-btn">Send innloggingslenke</button>
            {error && <div className="login-error">{error}</div>}
          </form>
        )}
      </div>
    </div>
  )
}

function InvitePanel({ onClose }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleInvite(e) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
      setTimeout(() => { setSent(false); setEmail(''); onClose() }, 3000)
    }
  }

  return (
    <div className="invite-panel">
      <div className="invite-header">
        <span>Inviter medlem</span>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      {sent ? (
        <div className="login-sent" style={{ margin: '12px' }}>Invitasjon sendt!</div>
      ) : (
        <form onSubmit={handleInvite} className="invite-form">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="E-postadresse..."
            required
          />
          <button type="submit" className="add-btn">Send invitasjon</button>
          {error && <div className="login-error">{error}</div>}
        </form>
      )}
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [newText, setNewText] = useState('')
  const [newCat, setNewCat] = useState('annet')
  const [newPri, setNewPri] = useState('medium')
  const [dragId, setDragId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchTasks = useCallback(async () => {
    const { data: taskData } = await supabase.from('tasks').select('*').order('position')
    const { data: subData } = await supabase.from('subtasks').select('*').order('position')
    const { data: docData } = await supabase.from('documents').select('*').order('created_at')

    const enriched = (taskData || []).map(t => ({
      ...t,
      subtasks: (subData || []).filter(s => s.task_id === t.id),
      documents: (docData || []).filter(d => d.task_id === t.id),
    }))
    setTasks(enriched)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()

    const channel = supabase
      .channel('realtime-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subtasks' }, fetchTasks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, fetchTasks)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchTasks])

  async function addTask() {
    if (!newText.trim()) return
    await supabase.from('tasks').insert({ text: newText.trim(), category: newCat, priority: newPri, position: tasks.length })
    setNewText('')
    fetchTasks()
  }

  async function handleDrop(draggedId, targetId) {
    if (draggedId === targetId) return
    const oldIndex = tasks.findIndex(t => t.id === draggedId)
    const newIndex = tasks.findIndex(t => t.id === targetId)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...tasks]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    const updates = reordered.map((t, i) =>
      supabase.from('tasks').update({ position: i }).eq('id', t.id)
    )
    await Promise.all(updates)
    setDragId(null)
    fetchTasks()
  }

  const total = tasks.length
  const done = tasks.filter(t => t.done).length
  const pct = total ? Math.round(done / total * 100) : 0

  if (authLoading) return <div className="loading" style={{ marginTop: '40vh' }}>Laster...</div>
  if (!session) return <LoginScreen />

  const userEmail = session.user.email

  return (
    <div className="app">
      <div className="app-header">
        <div>
          <h1>Dynamisk Helse</h1>
          <p className="subtitle">Ann-Kristin &amp; Henrik — delt oppgaveliste</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-email">{userEmail}</span>
            <button className="icon-btn" onClick={() => setShowInvite(v => !v)}>+ Inviter</button>
            <button className="icon-btn" onClick={() => supabase.auth.signOut()}>Logg ut</button>
          </div>
          <div className="live-badge">● Live</div>
        </div>
      </div>

      {showInvite && <InvitePanel onClose={() => setShowInvite(false)} />}

      <div className="stats-row">
        {[['Totalt', total], ['Ferdig', done], ['Gjenstår', total - done], ['Fremgang', pct + '%']].map(([l, v]) => (
          <div key={l} className="stat-card">
            <div className="stat-n">{v}</div>
            <div className="stat-l">{l}</div>
          </div>
        ))}
      </div>

      <div className="progress-bar"><div className="progress-fill" style={{ width: pct + '%' }} /></div>

      <div className="add-row">
        <input
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="Ny oppgave..."
        />
        <select value={newCat} onChange={e => setNewCat(e.target.value)}>
          {CATS.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
        </select>
        <select value={newPri} onChange={e => setNewPri(e.target.value)} className="priority-add-select">
          {PRIORITIES.map(p => <option key={p} value={p}>{PRI_CONFIG[p].symbol} {PRI_CONFIG[p].label}</option>)}
        </select>
        <button className="add-btn" onClick={addTask}>+ Legg til</button>
      </div>

      {loading ? (
        <div className="loading">Henter oppgaver...</div>
      ) : (
        CATS.map(cat => {
          const catTasks = tasks.filter(t => t.category === cat)
          if (!catTasks.length) return null
          return (
            <div key={cat} className="section">
              <div className="section-label">{CAT_LABELS[cat]}</div>
              {catTasks.map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onUpdate={fetchTasks}
                  onDelete={fetchTasks}
                  isDragging={dragId === t.id}
                  onDragStart={e => { setDragId(t.id); e.dataTransfer.effectAllowed = 'move' }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleDrop(dragId, t.id) }}
                />
              ))}
            </div>
          )
        })
      )}
    </div>
  )
}
