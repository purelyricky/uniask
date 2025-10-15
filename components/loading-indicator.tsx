'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

import { Spinner } from './ui/spinner'

const loadingMessages = [
  'Thinking...',
  'Searching...',
  'Analyzing...',
  'Processing...',
  'Gathering information...',
  'Skiddaddling...',
  'Pondering...',
  'Contemplating...',
  'Investigating...',
  'Exploring...'
]

export function LoadingIndicator({ className }: { className?: string }) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    // Rotate through messages every 2 seconds
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % loadingMessages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/30 border border-border/50 w-fit',
        className
      )}
    >
      <Spinner className="size-4" />
      <span className="text-sm text-muted-foreground animate-pulse">
        {loadingMessages[messageIndex]}
      </span>
    </div>
  )
}
