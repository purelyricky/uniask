'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

import { Spinner } from './ui/spinner'

type LoadingState = 'searching' | 'reasoning' | 'thinking' | 'processing'

const stateMessages: Record<LoadingState, string[]> = {
  searching: [
    'Researching...',
    'Searching...',
    'Gathering information...',
    'Exploring sources...',
    'Finding relevant results...'
  ],
  reasoning: [
    'Reasoning...',
    'Analyzing information...',
    'Thinking deeply...',
    'Contemplating...',
    'Synthesizing insights...'
  ],
  thinking: [
    'Thinking...',
    'Processing...',
    'Pondering...',
    'Working on it...'
  ],
  processing: [
    'Processing results...',
    'Analyzing...',
    'Organizing information...',
    'Preparing response...'
  ]
}

export function LoadingIndicator({
  className,
  state = 'thinking'
}: {
  className?: string
  state?: LoadingState
}) {
  const messages = stateMessages[state]
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    // Rotate through messages every 2 seconds
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/30 border border-border/50 w-fit',
        className
      )}
    >
      <Spinner className="size-4" />
      <span className="text-sm text-muted-foreground animate-pulse">
        {messages[messageIndex]}
      </span>
    </div>
  )
}
