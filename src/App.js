import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

const CATS = ['investor', 'produkt', 'drift', 'marked', 'annet']
const CAT_LABELS = { investor: 'Investor', produkt: 'Produkt', drift: 'Drift', marked: 'Marked', annet: 'Annet' }
const CAT_COLORS = {
  investor: { bg: 'rgba(200,86,58,0.18)', text: '#E8896E' },
  produkt:  { bg: 'rgba(29,158,117,0.18)', text: '#5DCAA5' },
  drift:    { bg: 'rgba(186,117,23,0.18)', text: '#EF9F27' },
  marked:   { bg: 'rgba(180,155,210,0.18)', text: '#B49BD2' },
  annet:    { bg: 'rgba(255,255,255,0.08)', text: '#A08E7A' },
}

const PRIORITIES = ['high', 'medium', 'low']
const PRI_CONFIG = {
  high:   { symbol: '🔴', label: 'Høy' },
  medium: { symbol: '🟡', label: 'Medium' },
  low:    { symbol: '🟢', label: 'Lav' },
}

function FeatherLogo() {
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
      {/* Hovedkurve venstre */}
      <path d="M24 44C24 44 10 34 7 20C5.5 13 8 6 16 3" stroke="#C8563A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Hovedkurve høyre */}
      <path d="M24 44C24 44 38 34 41 20C42.5 13 40 6 32 3" stroke="#C8563A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Rygg/midtstamme */}
      <path d="M24 4C24 4 23 14 23.5 24C23.8 30 24 38 24 44" stroke="#8B3A28" strokeWidth="1" strokeLinecap="round" fill="none"/>
      {/* Venstre ribber - bustete, ujevne */}
      <path d="M9 7L18 10" stroke="#8B3A28" strokeWidth="0.8" opacity="0.3" strokeLinecap="round"/>
      <path d="M7 11L17 13" stroke="#8B3A28" strokeWidth="0.8" opacity="0.35" strokeLinecap="round"/>
      <path d="M6 15L19 16" stroke="#8B3A28" strokeWidth="0.8" opacity="0.4" strokeLinecap="round"/>
      <path d="M6.5 19L20 19.5" stroke="#8B3A28" strokeWidth="0.8" opacity="0.45" strokeLinecap="round"/>
      <path d="M7 23L21 22" stroke="#8B3A28" strokeWidth="0.8" opacity="0.5" strokeLinecap="round"/>
      <path d="M8.5 27L22 25" stroke="#8B3A28" strokeWidth="0.8" opacity="0.55" strokeLinecap="round"/>
      <path d="M10 30.5L22.5 28" stroke="#8B3A28" strokeWidth="0.8" opacity="0.6" strokeLinecap="round"/>
      <path d="M12 34L23 31" stroke="#8B3A28" strokeWidth="0.8" opacity="0.65" strokeLinecap="round"/>
      <path d="M15 37L23.5 34.5" stroke="#8B3A28" strokeWidth="0.8" opacity="0.7" strokeLinecap="round"/>
      {/* Høyre ribber - bustete, ujevne */}
      <path d="M39 7L30 10" stroke="#8B3A28" strokeWidth="0.8" opacity="0.3" strokeLinecap="round"/>
      <path d="M41 11L31 13" stroke="#8B3A28" strokeWidth="0.8" opacity="0.35" strokeLinecap="round"/>
      <path d="M42 15L29 16" stroke="#8B3A28" strokeWidth="0.8" opacity="0.4" strokeLinecap="round"/>
      <path d="M41.5 19L28 19.5" stroke="#8B3A28" strokeWidth="0.8" opacity="0.45" strokeLinecap="round"/>
      <path d="M41 23L27 22" stroke="#8B3A28" strokeWidth="0.8" opacity="0.5" strokeLinecap="round"/>
      <path d="M39.5 27L26 25" stroke="#8B3A28" strokeWidth="0.8" opacity="0.55" strokeLinecap="round"/>
      <path d="M38 30.5L25.5 28" stroke="#8B3A28" strokeWidth="0.8" opacity="0.6" strokeLinecap="round"/>
      <path d="M36 34L25 31" stroke="#8B3A28" strokeWidth="0.8" opacity="0.65" strokeLinecap="round"/>
      <path d="M33 37L24.5 34.5" stroke="#8B3A28" strokeWidth="0.8" opacity="0.7" strokeLinecap="round"/>
      {/* Ekstra bust-tråder venstre */}
      <path d="M8 9L14 8" stroke="#C8563A" strokeWidth="0.6" opacity="0.25" strokeLinecap="round"/>
      <path d="M5.5 17L12 15.5" stroke="#C8563A" strokeWidth="0.6" opacity="0.3" strokeLinecap="round"/>
      <path d="M6 21L13 20" stroke="#C8563A" strokeWidth="0.6" opacity="0.25" strokeLinecap="round"/>
      <path d="M9 25L15 23.5" stroke="#C8563A" strokeWidth="0.6" opacity="0.3" strokeLinecap="round"/>
      {/* Ekstra bust-tråder høyre */}
      <path d="M40 9L34 8" stroke="#C8563A" strokeWidth="0.6" opacity="0.25" strokeLinecap="round"/>
      <path d="M42.5 17L36 15.5" stroke="#C8563A" strokeWidth="0.6" opacity="0.3" strokeLinecap="round"/>
      <path d="M42 21L35 20" stroke="#C8563A" strokeWidth="0.6" opacity="0.25" strokeLinecap="round"/>
      <path d="M39 25L33 23.5" stroke="#C8563A" strokeWidth="0.6" opacity="0.3" strokeLinecap="round"/>
      {/* Spiss */}
      <path d="M24 44L24 41" stroke="#C8563A" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
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

  const [uploadStatus, setUploadStatus] = useState('')
  const [uploading, setUploading] = useState(false)

  async function handleFileUpload(e) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadStatus('')
    setUploading(true)
    let success = 0
    let failed = 0
    for (const f of files) {
      try {
        setUploadStatus(`Laster opp ${f.name}...`)
        const filePath = `${task.id}/${Date.now()}_${f.name}`
        const { error: storageError } = await supabase.storage.from('documents').upload(filePath, f)
        if (storageError) {
          setUploadStatus(`Feil: ${storageError.message}`)
          failed++
          continue
        }
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)
        const { error: dbError } = await supabase.from('documents').insert({
          task_id: task.id,
          name: f.name,
          size: Math.round(f.size / 1024) + 'KB',
          url: urlData.publicUrl
        })
        if (dbError) {
          setUploadStatus(`DB-feil: ${dbError.message}`)
          failed++
        } else {
          success++
        }
      } catch (err) {
        setUploadStatus(`Uventet feil: ${err.message}`)
        failed++
      }
    }
    setUploading(false)
    if (failed > 0 && success === 0) {
      setUploadStatus(`Opplasting feilet. Sjekk Storage-policyer i Supabase.`)
    } else if (failed > 0) {
      setUploadStatus(`${success} lastet opp, ${failed} feilet.`)
    } else {
      setUploadStatus(`${success} dokument(er) lagret i Storage!`)
      setTimeout(() => setUploadStatus(''), 3000)
    }
    onUpdate()
  }

  async function reuploadDoc(doc) {
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = async (e) => {
      const f = e.target.files[0]
      if (!f) return
      setUploadStatus(`Laster opp ${f.name} til Storage...`)
      setUploading(true)
      const filePath = `${task.id}/${Date.now()}_${f.name}`
      const { error: storageError } = await supabase.storage.from('documents').upload(filePath, f)
      if (storageError) {
        setUploadStatus(`Feil: ${storageError.message}`)
        setUploading(false)
        return
      }
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)
      await supabase.from('documents').update({ url: urlData.publicUrl }).eq('id', doc.id)
      setUploadStatus('Lagret i Storage!')
      setUploading(false)
      setTimeout(() => setUploadStatus(''), 3000)
      onUpdate()
    }
    input.click()
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
              {d.url ? (
                <span style={{ color: '#1D9E75', fontSize: 11, flexShrink: 0 }}>Lagret</span>
              ) : (
                <button
                  className="icon-btn"
                  style={{ fontSize: 11, color: '#E24B4A', borderColor: '#E24B4A' }}
                  onClick={() => reuploadDoc(d)}
                >
                  Last opp fil
                </button>
              )}
              <button className="del-x" onClick={() => deleteDoc(d.id)}>✕</button>
            </div>
          ))}
          <label className="file-upload-area">
            <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
            {uploading ? 'Laster opp...' : 'Klikk for å laste opp dokument'}
          </label>
          {uploadStatus && (
            <div style={{
              color: uploadStatus.includes('Feil') || uploadStatus.includes('feilet') ? '#E24B4A' : '#1D9E75',
              fontSize: 12,
              marginTop: 6,
              fontWeight: 500
            }}>{uploadStatus}</div>
          )}
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
        <div className="app-title-row" style={{ justifyContent: 'center', marginBottom: 4 }}>
          <FeatherLogo />
          <h1>Tre musketerer</h1>
        </div>
        <p className="subtitle">Dynamisk Helse — felles kommando</p>
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
          <div className="app-title-row">
            <FeatherLogo />
            <h1>Tre musketerer</h1>
          </div>
          <p className="subtitle">Dynamisk Helse — felles kommando</p>
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

      <div className="app-footer">
        <p>En for alle — alle for en</p>
      </div>
    </div>
  )
}
