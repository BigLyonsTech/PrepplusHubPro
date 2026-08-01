import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'
import { streamChat } from '@/lib/chat'

const WELCOME = "Hi! I'm the PrepplusHub shopping assistant. Ask me about products, categories, or what might suit what you're looking for."

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages([...nextMessages, { role: 'assistant', content: '' }])
    setInput('')
    setSending(true)
    setError('')

    try {
      await streamChat(nextMessages, {
        onDelta: (chunk) => {
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            updated[updated.length - 1] = { ...last, content: last.content + chunk }
            return updated
          })
        },
      })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm h-[70vh] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-onLight/10 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-canopy text-white shrink-0">
              <div>
                <div className="font-display font-semibold text-sm">PrepplusHub assistant</div>
                <div className="text-[11px] text-white/60">Ask about products and get recommendations</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white" aria-label="Close chat">
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-leaf text-white rounded-br-sm'
                        : 'bg-paper text-onLight rounded-bl-sm'
                    }`}
                  >
                    {m.content || (sending && i === messages.length - 1 ? '...' : '')}
                  </div>
                </div>
              ))}
              {error && <p className="text-xs text-coral">{error}</p>}
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-onLight/8 shrink-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a product"
                disabled={sending}
                className="flex-1 text-sm px-3 py-2 rounded-full border border-onLight/15 bg-paper outline-none focus:border-leaf disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="size-9 rounded-full bg-leaf text-white flex items-center justify-center disabled:opacity-40 shrink-0"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 z-50 size-14 rounded-full bg-canopy text-white shadow-xl flex items-center justify-center"
        aria-label="Open shopping assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>
    </>
  )
}
