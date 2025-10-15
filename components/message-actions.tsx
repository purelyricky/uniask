'use client'

import { useState } from 'react'

import { useChat } from '@ai-sdk/react'
import { Copy, Flag } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import { useUser } from '@/hooks/use-user'

import { Button } from './ui/button'
import { ChatShare } from './chat-share'
import { RetryButton } from './retry-button'

interface MessageActionsProps {
  message: string
  messageId: string
  reload?: () => Promise<string | null | undefined>
  chatId: string
  enableShare?: boolean
  className?: string
  userQuestion?: string
}

export function MessageActions({
  message,
  messageId,
  reload,
  chatId,
  enableShare,
  className,
  userQuestion
}: MessageActionsProps) {
  const { status } = useChat({
    id: chatId
  })
  const { user } = useUser()
  const isLoading = status === 'submitted' || status === 'streaming'
  const [isFlagging, setIsFlagging] = useState(false)
  const [isFlagged, setIsFlagged] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(message)
    toast.success('Message copied to clipboard')
  }

  async function handleFlagWrongAnswer() {
    if (!user) {
      toast.error('Please sign in to flag answers')
      return
    }

    if (isFlagged) {
      toast.info('This answer has already been flagged')
      return
    }

    setIsFlagging(true)

    try {
      const response = await fetch('/api/flag-wrong-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatId,
          messageId,
          question: userQuestion || 'Question not available',
          answer: message
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to flag answer')
      }

      setIsFlagged(true)
      toast.success('Answer flagged successfully. Thank you for your feedback!')
    } catch (error) {
      console.error('Error flagging answer:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to flag answer'
      )
    } finally {
      setIsFlagging(false)
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 self-end transition-opacity duration-200',
        isLoading ? 'opacity-0' : 'opacity-100',
        className
      )}
    >
      {reload && <RetryButton reload={reload} messageId={messageId} />}
      <Button
        variant="ghost"
        onClick={handleFlagWrongAnswer}
        disabled={isFlagging || isFlagged}
        className={cn(
          'rounded-full gap-1.5 h-8 px-3',
          'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
          'text-white'
        )}
      >
        <Flag
          size={14}
          className="fill-white text-white"
          strokeWidth={isFlagging ? 1.5 : 2}
        />
        <span className="text-xs font-medium text-white">
          {isFlagged ? 'Flagged' : 'Wrong'}
        </span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="rounded-full"
      >
        <Copy size={14} />
      </Button>
      {enableShare && chatId && <ChatShare chatId={chatId} />}
    </div>
  )
}
