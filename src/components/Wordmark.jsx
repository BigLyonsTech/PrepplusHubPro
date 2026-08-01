import { cn } from '@/lib/utils'

export default function Wordmark({ className = '' }) {
  return (
    <span className={cn('font-display font-semibold tracking-tight text-canopy dark:text-paper', className)}>
      Prepplus<span className="text-leaf">Hub</span>
    </span>
  )
}
