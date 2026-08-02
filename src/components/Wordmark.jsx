import { cn } from '@/lib/utils'

export default function Wordmark({ className = '' }) {
  return (
    <span className={cn('inline-block [perspective:500px]', className)}>
      <span
        className={cn(
          'inline-block font-display font-semibold tracking-tight text-canopy dark:text-onDark',
          '[transform-style:preserve-3d] dark:animate-wordmark-spin',
          'dark:[filter:drop-shadow(0_0_10px_rgba(63,191,107,0.45))]',
        )}
      >
        <span className="inline-block [transform:translateZ(4px)]">Prepplus</span>
        <span className="inline-block text-leaf [transform:translateZ(16px)]">Hub</span>
      </span>
    </span>
  )
}
