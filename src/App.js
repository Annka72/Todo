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
  const [expanded, setExpanded] = useState(false)
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
    <div className={`claude-panel${expanded ? ' claude-fullscreen' : ''}`}>
      <div className="claude-header">
        <span>Sparre med Claude</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="expand-btn" onClick={() => setExpanded(v => !v)} title={expanded ? 'Minimer' : 'Utvid'}>
            {expanded ? '⊖' : '⊕'}
          </button>
          <button className="close-btn" onClick={() => { setExpanded(false); onClose() }}>✕</button>
        </div>
      </div>
      <div className="claude-task-label">{task.text}</div>
      {!historyLoaded && <div style={{ padding: '12px 13px', fontSize: 12, color: '#6D5D4E' }}>Henter chat-historikk...</div>}
      <div className="claude-messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg msg-${m.role}`}>
            <div className="msg-label">{m.role === 'user' ? 'Deg' : 'Claude'}</div>
            <div className="msg-content">{m.content}</div>
            {m.role === 'assistant' && m.content.length > 100 && (
              <div className="download-btns">
                <button className="download-msg-btn" onClick={() => {
                  const blob = new Blob([m.content], { type: 'text/plain;charset=utf-8' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `claude-svar-${i}.txt`
                  a.click()
                  URL.revokeObjectURL(url)
                }}>Last ned .txt</button>
                <button className="download-msg-btn" onClick={() => {
                  const formatted = m.content
                    .replace(/\n/g, '<br/>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^### (.*?)(<br\/>)/gm, '<h3>$1</h3>')
                    .replace(/^## (.*?)(<br\/>)/gm, '<h2>$1</h2>')
                    .replace(/^# (.*?)(<br\/>)/gm, '<h1>$1</h1>')
                    .replace(/- (.*?)(<br\/>)/g, '<li>$1</li>')
                  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${task.text}</title>
                    <style>
                      body { font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #1A1210; line-height: 1.7; font-size: 14px; }
                      h1, h2, h3 { color: #2C1F1A; margin-top: 1.2em; }
                      h1 { font-size: 22px; border-bottom: 2px solid #C8563A; padding-bottom: 8px; }
                      h2 { font-size: 18px; }
                      h3 { font-size: 15px; }
                      li { margin-left: 20px; margin-bottom: 4px; }
                      strong { color: #2C1F1A; }
                      .header { color: #8B7355; font-size: 12px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                      .footer { color: #B8A090; font-size: 11px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; font-style: italic; }
                    </style></head><body>
                    <div class="header">Tre musketerer — ${task.text}</div>
                    ${formatted}
                    <div class="footer">En for alle — alle for en</div>
                    <script>window.onload = function() { window.print() }</script>
                  </body></html>`
                  const w = window.open('', '_blank')
                  w.document.write(html)
                  w.document.close()
                }}>Last ned PDF</button>
              </div>
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

function CommentSection({ taskId, taskName, userEmail, teamEmails }) {
  const [comments, setComments] = useState([])
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('comments').select('*').eq('task_id', taskId).order('created_at')
      setComments(data || [])
      // Mark as read
      const unread = (data || []).filter(c => c.mentions?.includes(userEmail) && !c.read_by?.includes(userEmail))
      for (const c of unread) {
        await supabase.from('comments').update({ read_by: [...(c.read_by || []), userEmail] }).eq('id', c.id)
      }
    }
    load()
  }, [taskId, userEmail])

  function handleInput(e) {
    const val = e.target.value
    setInput(val)
    const match = val.match(/@(\S*)$/)
    if (match) {
      const query = match[1].toLowerCase()
      const filtered = teamEmails.filter(em => em.toLowerCase().includes(query) && em !== userEmail)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  function selectMention(email) {
    setInput(prev => prev.replace(/@(\S*)$/, `@${email} `))
    setShowSuggestions(false)
  }

  async function addComment() {
    if (!input.trim()) return
    const mentioned = [...input.matchAll(/@([\w.@+-]+)/g)].map(m => m[1]).filter(e => teamEmails.includes(e))
    await supabase.from('comments').insert({
      task_id: taskId,
      user_email: userEmail,
      content: input.trim(),
      mentions: mentioned,
      read_by: [userEmail]
    })
    // Send e-postvarsling til nevnte personer
    for (const email of mentioned) {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          fromName: userEmail.split('@')[0],
          taskName: taskName,
          comment: input.trim()
        })
      }).catch(() => {})
    }
    setInput('')
    const { data } = await supabase.from('comments').select('*').eq('task_id', taskId).order('created_at')
    setComments(data || [])
  }

  function renderContent(text) {
    return text.split(/(@[\w.@+-]+)/g).map((part, i) =>
      part.startsWith('@') ? <span key={i} style={{ color: '#C8563A', fontWeight: 500 }}>{part}</span> : part
    )
  }

  return (
    <div style={{ marginTop: 14 }}>
      <div className="exp-section-label">Kommentarer</div>
      {comments.length === 0 && <div className="empty-hint">Ingen kommentarer ennå.</div>}
      {comments.map(c => (
        <div key={c.id} className="comment-item">
          <div className="comment-header">
            <span className="comment-author">{c.user_email.split('@')[0]}</span>
            <span className="comment-time">{new Date(c.created_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="comment-text">{renderContent(c.content)}</div>
        </div>
      ))}
      <div className="add-sub-row" style={{ position: 'relative' }}>
        <input
          value={input}
          onChange={handleInput}
          onKeyDown={e => e.key === 'Enter' && addComment()}
          placeholder="Skriv kommentar... bruk @ for å nevne"
        />
        <button onClick={addComment}>Send</button>
        {showSuggestions && (
          <div className="mention-suggestions">
            {suggestions.map(em => (
              <div key={em} className="mention-option" onClick={() => selectMention(em)}>@{em}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TaskCard({ task, onUpdate, onDelete, onDragStart, onDragOver, onDrop, isDragging, userEmail, teamEmails }) {
  const [expanded, setExpanded] = useState(false)
  const [expandedFull, setExpandedFull] = useState(false)
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
        <div className={`task-expanded${expandedFull ? ' task-fullscreen' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="exp-section-label" style={{ marginBottom: 0 }}>Underpunkter</div>
            <button className="expand-btn" onClick={() => setExpandedFull(v => !v)} title={expandedFull ? 'Minimer' : 'Utvid'}>
              {expandedFull ? '⊖' : '⊕'}
            </button>
          </div>
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

          <CommentSection taskId={task.id} taskName={task.text} userEmail={userEmail} teamEmails={teamEmails} />
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
  const [teamEmails, setTeamEmails] = useState([])
  const [unreadMentions, setUnreadMentions] = useState(0)

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

  useEffect(() => {
    async function loadTeam() {
      const { data } = await supabase.from('comments').select('user_email')
      const emails = [...new Set((data || []).map(c => c.user_email))]
      if (session?.user?.email && !emails.includes(session.user.email)) {
        emails.push(session.user.email)
      }
      setTeamEmails(emails)
    }
    if (session) loadTeam()
  }, [session])

  useEffect(() => {
    async function checkMentions() {
      if (!session?.user?.email) return
      const { data } = await supabase.from('comments').select('id, read_by, mentions')
      const unread = (data || []).filter(c =>
        c.mentions?.includes(session.user.email) && !c.read_by?.includes(session.user.email)
      )
      setUnreadMentions(unread.length)
    }
    if (session) checkMentions()
    const interval = setInterval(checkMentions, 15000)
    return () => clearInterval(interval)
  }, [session])

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
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-email">{userEmail}</span>
            <button className="icon-btn" onClick={() => setShowInvite(v => !v)}>+ Inviter</button>
            <button className="icon-btn" onClick={() => supabase.auth.signOut()}>Logg ut</button>
          </div>
          <div className="live-badge">● Live</div>
          {unreadMentions > 0 && <div className="mention-badge">@ {unreadMentions} ny(e) omtale(r)</div>}
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
                  userEmail={userEmail}
                  teamEmails={teamEmails}
                />
              ))}
            </div>
          )
        })
      )}

      <div style={{textAlign: 'center', marginTop: '1.5rem', marginBottom: '0.5rem'}}>
        <svg width="180" height="190" viewBox="0 0 680 400" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="340" cy="378" rx="80" ry="10" fill="#D4C4B0" opacity="0.4"/>
          <path d="M270 210 C250 250, 235 300, 242 360 C248 375, 290 382, 340 382 C390 382, 432 375, 438 360 C445 300, 430 250, 410 210 Z" fill="#2C1F1A"/>
          <path d="M272 216 C252 254, 238 302, 244 358" stroke="#C8563A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M408 216 C428 254, 442 302, 436 358" stroke="#C8563A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M282 222 C276 258, 274 310, 276 355 L404 355 C406 310, 404 258, 398 222 Z" fill="#3E2E26"/>
          <circle cx="340" cy="248" r="4" fill="#C8563A"/>
          <circle cx="340" cy="268" r="4" fill="#C8563A"/>
          <circle cx="340" cy="288" r="4" fill="#C8563A"/>
          <circle cx="340" cy="308" r="4" fill="#C8563A"/>
          <path d="M300 224 C316 236, 328 240, 340 240 C352 240, 364 236, 380 224 L372 212 C360 222, 350 226, 340 226 C330 226, 320 222, 308 212 Z" fill="#F2E8DC"/>
          <rect x="325" y="192" width="30" height="30" rx="8" fill="#E8C9A0"/>
          <ellipse cx="340" cy="152" rx="82" ry="86" fill="#E8C9A0"/>
          <ellipse cx="292" cy="170" rx="20" ry="13" fill="#E8896E" opacity="0.35"/>
          <ellipse cx="388" cy="170" rx="20" ry="13" fill="#E8896E" opacity="0.35"/>
          <ellipse cx="260" cy="152" rx="16" ry="20" fill="#E8C9A0"/>
          <ellipse cx="260" cy="152" rx="10" ry="13" fill="#D4A870"/>
          <ellipse cx="420" cy="152" rx="16" ry="20" fill="#E8C9A0"/>
          <ellipse cx="420" cy="152" rx="10" ry="13" fill="#D4A870"/>
          <ellipse cx="312" cy="145" rx="22" ry="24" fill="white"/>
          <ellipse cx="368" cy="145" rx="22" ry="24" fill="white"/>
          <ellipse cx="316" cy="141" rx="14" ry="16" fill="#3E2010"/>
          <ellipse cx="372" cy="141" rx="14" ry="16" fill="#3E2010"/>
          <ellipse cx="318" cy="140" rx="8" ry="9" fill="#1A0A05"/>
          <ellipse cx="374" cy="140" rx="8" ry="9" fill="#1A0A05"/>
          <circle cx="322" cy="134" r="5" fill="white" opacity="0.95"/>
          <circle cx="378" cy="134" r="5" fill="white" opacity="0.95"/>
          <circle cx="313" cy="145" r="2.5" fill="white" opacity="0.5"/>
          <circle cx="369" cy="145" r="2.5" fill="white" opacity="0.5"/>
          <path d="M290 118 C302 112, 316 113, 326 119" stroke="#5C3A1E" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <path d="M348 113 C360 104, 378 106, 388 115" stroke="#5C3A1E" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <ellipse cx="340" cy="165" rx="9" ry="6" fill="#D4A070"/>
          <circle cx="336" cy="167" r="2.5" fill="#C09060" opacity="0.5"/>
          <circle cx="344" cy="167" r="2.5" fill="#C09060" opacity="0.5"/>
          <path d="M308 184 C322 196, 355 198, 372 187" stroke="#8B4A2A" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M315 188 C325 196, 355 197, 365 189 L358 188 C350 194, 328 194, 322 188 Z" fill="white"/>
          <path d="M305 182 C300 176, 298 168, 302 164" stroke="#D4A070" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
          <path d="M374 185 C380 179, 382 170, 378 165" stroke="#D4A070" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
          <path d="M308 178 C318 174, 330 176, 336 180" stroke="#3E1A08" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M344 180 C350 176, 362 174, 372 178" stroke="#3E1A08" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <ellipse cx="343" cy="80" rx="108" ry="16" fill="#2C1F1A" transform="rotate(-4 343 80)"/>
          <path d="M255 82 C262 42, 285 18, 343 14 C401 18, 424 42, 431 82 Z" fill="#2C1F1A" transform="rotate(-4 343 80)"/>
          <path d="M258 80 C268 72, 300 68, 343 68 C386 68, 418 72, 428 80" stroke="#C8563A" strokeWidth="5" fill="none" strokeLinecap="round" transform="rotate(-4 343 80)"/>
          <path d="M415 72 C428 52, 448 28, 438 8 C434 -2, 424 0, 420 14" stroke="#C8563A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M415 72 C406 54, 410 30, 428 12" stroke="#8B3A28" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
          <path d="M418 60 C432 44, 452 32, 446 14" stroke="#C8563A" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.7"/>
          <path d="M420 50 C436 38, 454 28, 450 12" stroke="#C8563A" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.55"/>
          <path d="M416 65 C428 50, 442 36, 440 18" stroke="#C8563A" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.5"/>
          <path d="M408 68 C414 48, 418 26, 432 12" stroke="#8B3A28" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.5"/>
          <path d="M438 8 C442 2, 448 0, 446 6" stroke="#C8563A" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.5"/>
          <path d="M428 10 C434 2, 442 2, 439 9" stroke="#C8563A" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.4"/>
          <path d="M282 232 C258 218, 240 205, 228 192" stroke="#2C1F1A" strokeWidth="26" strokeLinecap="round" fill="none"/>
          <circle cx="224" cy="186" r="17" fill="#E8C9A0"/>
          <rect x="204" y="148" width="4" height="76" rx="2" fill="#B8A090" transform="rotate(10 218 180)"/>
          <rect x="196" y="156" width="18" height="5" rx="2.5" fill="#C8563A" transform="rotate(10 218 165)"/>
          <rect x="203" y="148" width="5" height="12" rx="2" fill="#8B7355" transform="rotate(10 218 160)"/>
          <path d="M398 232 C422 215, 448 205, 462 195" stroke="#2C1F1A" strokeWidth="26" strokeLinecap="round" fill="none"/>
          <circle cx="466" cy="190" r="17" fill="#E8C9A0"/>
          <rect x="462" y="165" width="9" height="22" rx="4.5" fill="#E8C9A0"/>
          <rect x="460" y="163" width="13" height="8" rx="4" fill="#E0BC92"/>
          <path d="M296 353 C292 368, 290 378, 289 390" stroke="#2C1F1A" strokeWidth="28" strokeLinecap="round" fill="none"/>
          <path d="M384 353 C388 368, 390 378, 391 390" stroke="#2C1F1A" strokeWidth="28" strokeLinecap="round" fill="none"/>
          <rect x="264" y="378" width="48" height="22" rx="8" fill="#1A1210"/>
          <ellipse cx="288" cy="399" rx="26" ry="10" fill="#1A1210"/>
          <rect x="368" y="378" width="48" height="22" rx="8" fill="#1A1210"/>
          <ellipse cx="392" cy="399" rx="26" ry="10" fill="#1A1210"/>
          <rect x="274" y="382" width="16" height="6" rx="2" fill="#C8563A"/>
          <rect x="378" y="382" width="16" height="6" rx="2" fill="#C8563A"/>
        </svg>
      </div>
      <div className="app-footer">
        <p>En for alle — alle for en</p>
      </div>

      </div>{/* end app-content */}
    </div>
  )
}
