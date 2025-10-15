'use client'

import { useEffect, useRef, useState } from 'react'
import Textarea from 'react-textarea-autosize'
import { useRouter } from 'next/navigation'

import { Message } from 'ai'
import { ArrowUp, ChevronDown, MessageCirclePlus, Sparkles,Square } from 'lucide-react'

import { Model } from '@/lib/types/models'
import { cn } from '@/lib/utils'

import { useArtifact } from './artifact/artifact-context'
import { Button } from './ui/button'
import { IconLogo } from './ui/icons'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { EmptyScreen } from './empty-screen'
import { ModelSelector } from './model-selector'
import { TopicSelector } from './topic-selector'

interface ChatPanelProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  messages: Message[]
  setMessages: (messages: Message[]) => void
  query?: string
  stop: () => void
  append: (message: any) => void
  models?: Model[]
  /** Whether to show the scroll to bottom button */
  showScrollToBottomButton: boolean
  /** Reference to the scroll container */
  scrollContainerRef: React.RefObject<HTMLDivElement>
}

export function ChatPanel({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  messages,
  setMessages,
  query,
  stop,
  append,
  models,
  showScrollToBottomButton,
  scrollContainerRef
}: ChatPanelProps) {
  const [showEmptyScreen, setShowEmptyScreen] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isFirstRender = useRef(true)
  const [isComposing, setIsComposing] = useState(false) // Composition state
  const [enterDisabled, setEnterDisabled] = useState(false) // Disable Enter after composition ends
  const { close: closeArtifact } = useArtifact()

  const handleCompositionStart = () => setIsComposing(true)

  const handleCompositionEnd = () => {
    setIsComposing(false)
    setEnterDisabled(true)
    setTimeout(() => {
      setEnterDisabled(false)
    }, 300)
  }

  const handleNewChat = () => {
    setMessages([])
    closeArtifact()
    router.push('/')
  }

  const isToolInvocationInProgress = () => {
    if (!messages.length) return false

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== 'assistant' || !lastMessage.parts) return false

    const parts = lastMessage.parts
    const lastPart = parts[parts.length - 1]

    return (
      lastPart?.type === 'tool-invocation' &&
      lastPart?.toolInvocation?.state === 'call'
    )
  }

  // if query is not empty, submit the query
  useEffect(() => {
    if (isFirstRender.current && query && query.trim().length > 0) {
      append({
        role: 'user',
        content: query
      })
      isFirstRender.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Scroll to the bottom of the container
  const handleScrollToBottom = () => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          'w-full bg-background group/form-container shrink-0',
          messages.length > 0 ? 'sticky bottom-0 px-2 sm:px-4 pb-4' : 'px-4 sm:px-6'
        )}
      >
        {messages.length === 0 && (
          <div className="mb-8 sm:mb-10 flex flex-col items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-2 sm:gap-3">
              <IconLogo className="size-10 sm:size-12 text-foreground" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-foreground">
                UnidebAsk
              </h1>
            </div>
            <p className="text-center text-sm text-muted-foreground max-w-md px-4">
              Your AI assistant for University of Debrecen
            </p>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className={cn('max-w-3xl w-full mx-auto relative')}
          suppressHydrationWarning
        >
          {/* Scroll to bottom button - only shown when showScrollToBottomButton is true */}
          {showScrollToBottomButton && messages.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute -top-12 right-4 z-20 size-9 rounded-full shadow-lg border-border/50 backdrop-blur-sm bg-background/80 hover:bg-background"
                  onClick={handleScrollToBottom}
                >
                  <ChevronDown size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Scroll to bottom</p>
              </TooltipContent>
            </Tooltip>
          )}

          <div className="relative flex flex-col w-full gap-0 bg-background rounded-2xl border border-border/50 shadow-sm hover:border-border transition-all" suppressHydrationWarning>
            <Textarea
              ref={inputRef}
              name="input"
              rows={1}
              maxRows={6}
              tabIndex={0}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder="Ask a question about the University of Debrecen..."
              spellCheck={false}
              value={input}
              disabled={isLoading || isToolInvocationInProgress()}
              className="resize-none w-full min-h-[50px] sm:min-h-[52px] bg-transparent border-0 px-4 pt-3.5 pb-2.5 text-sm sm:text-base placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              onChange={e => {
                handleInputChange(e)
                setShowEmptyScreen(e.target.value.length === 0)
              }}
              onKeyDown={e => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  !isComposing &&
                  !enterDisabled
                ) {
                  if (input.trim().length === 0) {
                    e.preventDefault()
                    return
                  }
                  e.preventDefault()
                  const textarea = e.target as HTMLTextAreaElement
                  textarea.form?.requestSubmit()
                }
              }}
              onFocus={() => setShowEmptyScreen(true)}
              onBlur={() => setShowEmptyScreen(false)}
              suppressHydrationWarning
            />

            {/* Bottom control bar */}
            <div className="flex items-center justify-between px-2.5 pb-2.5 gap-2">
              <div className="flex items-center gap-1 flex-1 min-w-0">
                {models && models.length > 0 && <ModelSelector models={models} />}
                <TopicSelector />
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {messages.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNewChat}
                        className="size-8 rounded-full hover:bg-accent transition-all"
                        type="button"
                        disabled={isLoading || isToolInvocationInProgress()}
                      >
                        <MessageCirclePlus className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>New chat</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type={isLoading ? 'button' : 'submit'}
                      size="icon"
                      variant={input.trim().length > 0 ? 'default' : 'ghost'}
                      className={cn(
                        'size-8 rounded-full transition-all',
                        isLoading && 'animate-pulse',
                        input.trim().length > 0 && 'bg-primary text-primary-foreground hover:bg-primary/90'
                      )}
                      disabled={
                        (input.length === 0 && !isLoading) ||
                        isToolInvocationInProgress()
                      }
                      onClick={isLoading ? stop : undefined}
                    >
                      {isLoading ? (
                        <Square className="size-4" />
                      ) : (
                        <ArrowUp className="size-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isLoading ? 'Stop generating' : 'Send message'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {messages.length === 0 && (
            <EmptyScreen
              submitMessage={message => {
                handleInputChange({
                  target: { value: message }
                } as React.ChangeEvent<HTMLTextAreaElement>)
              }}
              className={cn(showEmptyScreen ? 'visible' : 'invisible')}
            />
          )}
        </form>
        {messages.length === 0 && (
          <p className="text-center text-[10px] sm:text-xs text-muted-foreground/50 mt-3 px-4">
            This is not an official University of Debrecen service. AI can make mistakes.
          </p>
        )}
      </div>
    </TooltipProvider>
  )
}