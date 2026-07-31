import { useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

const accents = ['#3FBF6B', '#123D0A', '#2E7D5B', '#E0A030']
const templates = ['Minimal', 'Bold', 'Editorial']

export default function ProfileCustomization() {
  const user = useSelector((s) => s.auth.user)
  const isVendor = user?.role === 'vendor'
  const [accent, setAccent] = useState(accents[0])
  const [template, setTemplate] = useState(templates[0])
  const [bio, setBio] = useState('')
  const [shopDesc, setShopDesc] = useState('')

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-16 grid md:grid-cols-[1fr_320px] gap-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-semibold mb-1">
            {isVendor ? 'Customize your shop page' : 'Customize your profile'}
          </h1>
          <p className="text-onLight/50 text-sm mb-8">
            {isVendor
              ? 'This is what customers see when they visit your shop.'
              : 'A lighter profile — avatar, bio, and accent color.'}
          </p>

          <div className="space-y-6 max-w-md">
            <Field label="Display name">
              <Input defaultValue={user?.name || ''} />
            </Field>
            <Field label={isVendor ? 'Shop description' : 'Bio'}>
              <textarea
                value={isVendor ? shopDesc : bio}
                onChange={(e) => (isVendor ? setShopDesc(e.target.value) : setBio(e.target.value))}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-onLight/15 bg-white text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf"
                placeholder={isVendor ? 'What does your shop sell, and what makes it different?' : 'A little about you'}
              />
            </Field>
            {isVendor && (
              <Field label="Social links">
                <Input placeholder="instagram.com/yourshop" />
              </Field>
            )}

            <div>
              <span className="block text-sm font-medium text-onLight/80 mb-2">Theme accent</span>
              <div className="flex gap-3">
                {accents.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAccent(c)}
                    style={{ backgroundColor: c }}
                    className={cn(
                      'size-9 rounded-full border-2',
                      accent === c ? 'border-onLight' : 'border-transparent',
                    )}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-onLight/80 mb-2">Template</span>
              <div className="flex gap-2">
                {templates.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm border',
                      template === t ? 'border-leaf text-leaf bg-leaf/5' : 'border-onLight/15 text-onLight/60',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button size="lg">Save changes</Button>
          </div>
        </motion.div>

        {/* Live preview */}
        <div className="rounded-2xl border border-onLight/10 bg-white overflow-hidden h-fit sticky top-24">
          <div className="h-24" style={{ backgroundColor: accent }} />
          <div className="p-5">
            <div className="size-14 rounded-full bg-onLight/10 -mt-12 border-4 border-white mb-3" />
            <div className="font-semibold text-sm">{user?.name || 'Your name'}</div>
            <p className="text-xs text-onLight/50 mt-1">
              {(isVendor ? shopDesc : bio) || (isVendor ? 'Your shop description will appear here.' : 'Your bio will appear here.')}
            </p>
            <span className="inline-block mt-3 text-[11px] text-onLight/35">{template} template</span>
          </div>
        </div>
      </div>
    </div>
  )
}
