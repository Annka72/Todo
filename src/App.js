import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

function MicButton({ onResult, autoSend, className }) {
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)

  function toggle() {
    if (listening) {
      recRef.current?.stop()
      setListening(false)
      return
    }
    if (!SpeechRecognition) {
      alert('Nettleseren din støtter ikke tale-til-tekst.')
      return
    }
    const rec = new SpeechRecognition()
    rec.lang = 'nb-NO'
    rec.interimResults = false
    rec.continuous = false
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      onResult(text, autoSend)
      setListening(false)
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    recRef.current = rec
    rec.start()
    setListening(true)
  }

  return (
    <button
      type="button"
      className={`mic-btn ${listening ? 'mic-active' : ''} ${className || ''}`}
      onClick={toggle}
      title={listening ? 'Stopp opptak' : 'Tale til tekst'}
    >
      {listening ? '⏹' : '🎤'}
    </button>
  )
}

const CATS = ['investor', 'produkt', 'drift', 'marked', 'annet']
const CAT_LABELS = { investor: 'Investor', produkt: 'Produkt', drift: 'Drift', marked: 'Marked', annet: 'Annet' }
const CAT_COLORS = {
  investor: { bg: '#FDE8E3', text: '#9B3D25' },
  produkt:  { bg: '#E1F5EE', text: '#085041' },
  drift:    { bg: '#FAEEDA', text: '#633806' },
  marked:   { bg: '#F0EBF8', text: '#6B3E8E' },
  annet:    { bg: '#F1EFE8', text: '#5C4A38' },
}

const PRIORITIES = ['high', 'medium', 'low']
const PRI_CONFIG = {
  high:   { symbol: '🔴', label: 'Høy' },
  medium: { symbol: '🟡', label: 'Medium' },
  low:    { symbol: '🟢', label: 'Lav' },
}

function FeatherLogo() {
  return (
    <svg width="44" height="52" viewBox="0 0 44 52" fill="none">
      {/* Hovedkurve høyre */}
      <path d="M22 3 C26 6, 36 10, 38 18 C40 26, 34 34, 28 40 C24 44, 20 47, 17 49" stroke="#C8563A" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      {/* Ryggkurve venstre */}
      <path d="M22 3 C18 7, 10 14, 9 22 C8 30, 12 38, 17 49" stroke="#8B3A28" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      {/* Spiss */}
      <path d="M17 49 L19 43" stroke="#C8563A" strokeWidth="1.3" strokeLinecap="round"/>
      {/* Høyre ribber */}
      <path d="M26 7 C30 9,36 12,36 17" stroke="#C8563A" strokeWidth="0.9" opacity="0.8" strokeLinecap="round" fill="none"/>
      <path d="M28 11 C33 14,37 18,36 23" stroke="#C8563A" strokeWidth="0.8" opacity="0.65" strokeLinecap="round" fill="none"/>
      <path d="M29 16 C34 19,37 23,35 28" stroke="#C8563A" strokeWidth="0.8" opacity="0.55" strokeLinecap="round" fill="none"/>
      <path d="M28 21 C32 24,34 28,31 33" stroke="#C8563A" strokeWidth="0.7" opacity="0.45" strokeLinecap="round" fill="none"/>
      <path d="M25 27 C28 30,29 34,27 38" stroke="#C8563A" strokeWidth="0.7" opacity="0.35" strokeLinecap="round" fill="none"/>
      <path d="M22 33 C24 36,24 39,22 42" stroke="#C8563A" strokeWidth="0.6" opacity="0.3" strokeLinecap="round" fill="none"/>
      {/* Venstre ribber */}
      <path d="M18 7 C14 9,10 13,10 18" stroke="#8B3A28" strokeWidth="0.8" opacity="0.7" strokeLinecap="round" fill="none"/>
      <path d="M16 12 C12 15,9 19,10 24" stroke="#8B3A28" strokeWidth="0.7" opacity="0.55" strokeLinecap="round" fill="none"/>
      <path d="M15 18 C11 21,9 25,11 30" stroke="#8B3A28" strokeWidth="0.7" opacity="0.45" strokeLinecap="round" fill="none"/>
      <path d="M15 24 C12 27,11 31,13 35" stroke="#8B3A28" strokeWidth="0.6" opacity="0.35" strokeLinecap="round" fill="none"/>
      <path d="M16 30 C14 33,14 37,15 40" stroke="#8B3A28" strokeWidth="0.6" opacity="0.3" strokeLinecap="round" fill="none"/>
      {/* Bustehår toppen høyre */}
      <path d="M25 6 C27 4,30 5,29 7" stroke="#C8563A" strokeWidth="0.7" opacity="0.5" strokeLinecap="round" fill="none"/>
      <path d="M30 10 C33 8,36 9,35 12" stroke="#C8563A" strokeWidth="0.6" opacity="0.4" strokeLinecap="round" fill="none"/>
      <path d="M32 16 C35 14,38 16,37 19" stroke="#C8563A" strokeWidth="0.6" opacity="0.35" strokeLinecap="round" fill="none"/>
      {/* Bustehår toppen venstre */}
      <path d="M17 8 C15 6,12 6,12 9" stroke="#8B3A28" strokeWidth="0.6" opacity="0.4" strokeLinecap="round" fill="none"/>
      <path d="M12 14 C9 12,7 14,8 17" stroke="#8B3A28" strokeWidth="0.6" opacity="0.35" strokeLinecap="round" fill="none"/>
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
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const messagesRef = useRef([])

  const docs = task.documents || []
  const docNames = docs.map(d => d.name).join(', ')

  useEffect(() => {
    async function loadHistory() {
      const { data } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('task_id', task.id)
        .order('created_at')
      if (data && data.length > 0) {
        setMessages(data)
        messagesRef.current = data
      } else {
        const intro = docs.length > 0
          ? `Hei! Jeg ser oppgaven «${task.text}» har ${docs.length} dokument(er): ${docs.map(d => d.name).join(', ')}. Jeg har lest disse og kan diskutere innholdet. Hva vil du vite?`
          : `Hei! Jeg er klar til å hjelpe med oppgaven «${task.text}». Hva vil du tenke igjennom?`
        const initial = [{ role: 'assistant', content: intro }]
        setMessages(initial)
        messagesRef.current = initial
        await supabase.from('chat_messages').insert({ task_id: task.id, role: 'assistant', content: intro })
      }
      setHistoryLoaded(true)
    }
    loadHistory()
  }, [task.id, task.text, docNames])

  async function sendMessages(msgs) {
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
          messages: msgs,
          documents: docUrls
        })
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || 'Noe gikk galt.'
      await supabase.from('chat_messages').insert({ task_id: task.id, role: 'assistant', content: reply })
      setMessages(prev => {
        const updated = [...prev, { role: 'assistant', content: reply }]
        messagesRef.current = updated
        return updated
      })
    } catch {
      setMessages(prev => {
        const updated = [...prev, { role: 'assistant', content: 'Feil ved tilkobling til Claude.' }]
        messagesRef.current = updated
        return updated
      })
    }
    setLoading(false)
  }

  async function sendText(text) {
    await supabase.from('chat_messages').insert({ task_id: task.id, role: 'user', content: text })
    const userMsg = { role: 'user', content: text }
    const newMessages = [...messagesRef.current, userMsg]
    setMessages(newMessages)
    messagesRef.current = newMessages
    setInput('')
    sendMessages(newMessages)
  }

  async function send() {
    if (!input.trim() || loading) return
    sendText(input)
  }

  return (
    <div className="claude-panel">
      <div className="claude-header">
        <span>Sparre med Claude</span>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="claude-task-label">{task.text}</div>
      {!historyLoaded && <div style={{ padding: '12px 13px', fontSize: 12, color: '#6D5D4E' }}>Henter chat-historikk...</div>}
      <div className="claude-messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg msg-${m.role}`}>
            <div className="msg-label">{m.role === 'user' ? 'Deg' : 'Claude'}</div>
            <div className="msg-content">{m.content}</div>
            {m.role === 'assistant' && m.content.length > 100 && (
              <button className="download-msg-btn" onClick={() => {
                const blob = new Blob([m.content], { type: 'text/plain;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `claude-svar-${i}.txt`
                a.click()
                URL.revokeObjectURL(url)
              }}>Last ned som .txt</button>
            )}
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
        <MicButton autoSend onResult={(text, shouldSend) => {
          if (shouldSend) {
            sendText(text)
          } else {
            setInput(prev => prev ? prev + ' ' + text : text)
          }
        }} />
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
      <div className="task-main" onClick={(e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('select') || e.target.closest('.drag-handle')) return
        setExpanded(v => !v)
      }} style={{ cursor: 'pointer' }}>
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
            <MicButton onResult={text => setSubInput(prev => prev ? prev + ' ' + text : text)} />
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
          <h1 style={{ color: '#1A1210' }}>Tre musketerer</h1>
        </div>
        <p className="subtitle" style={{ marginBottom: '1.5rem' }}>Dynamisk Helse — felles kommando</p>
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

      <div className="app-content">

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
        <MicButton onResult={text => setNewText(prev => prev ? prev + ' ' + text : text)} />
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

      </div>{/* end app-content */}
    </div>
  )
}
