import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

// A small CSS-3D "coin" — two gradient faces spinning on the Y axis, backface-
// hidden so only one is ever visible, plus a soft pulsing glow underneath.
// No WebGL: perspective + rotateY is plenty for an icon this size and stays
// instant to paint (the project's other 3D work uses react-three-fiber, but
// that's for hero-scale centerpieces, not a small banner badge).
export default function FlashSaleIcon() {
  return (
    <div className="relative shrink-0 size-14" style={{ perspective: 600 }}>
      <motion.div
        className="absolute inset-0 rounded-full bg-amber blur-lg"
        animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.85, 1.1, 0.85] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="relative size-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: 360, y: [0, -5, 0, 5, 0] }}
        transition={{
          rotateY: { duration: 3.4, repeat: Infinity, ease: 'linear' },
          y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center bg-gradient-to-br from-amber to-coral shadow-lg"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Zap size={26} className="text-white" strokeWidth={2} fill="currentColor" />
        </div>
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center bg-gradient-to-br from-coral to-amber shadow-lg"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <Zap size={26} className="text-white" strokeWidth={2} fill="currentColor" />
        </div>
      </motion.div>
    </div>
  )
}
