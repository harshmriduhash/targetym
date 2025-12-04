'use client'

/**
 * AI Chat Component
 *
 * Conversational AI interface with streaming responses
 * Uses Vercel AI SDK's useChat hook for real-time streaming
 *
 * Features:
 * - Real-time streaming responses
 * - Message history
 * - Loading states
 * - Error handling
 * - Auto-scroll
 */

import { useChat } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Send, Bot, User } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

interface AIChatProps {
  /**
   * Conversation topic (goals, performance, recruitment, general)
   */
  topic?: 'goals' | 'performance' | 'recruitment' | 'general'

  /**
   * Initial system context
   */
  initialContext?: string

  /**
   * Custom placeholder text
   */
  placeholder?: string

  /**
   * Maximum height of chat area
   */
  maxHeight?: string
}

export function AIChat({
  topic = 'general',
  initialContext,
  placeholder = 'Ask me anything about HR, goals, performance, or recruitment...',
  maxHeight = '600px',
}: AIChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Vercel AI SDK useChat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
  } = useChat({
    api: '/api/ai/chat',
    body: {
      context: {
        conversationTopic: topic,
        initialContext,
      },
    },
    onError: (error) => {
      toast.error('AI Error', {
        description: error.message || 'Failed to get AI response',
      })
    },
    onFinish: () => {
      toast.success('Response complete')
    },
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Card className="flex flex-col w-full">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Assistant</h3>
          {topic !== 'general' && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              {topic}
            </span>
          )}
        </div>
        {initialContext && (
          <p className="text-sm text-muted-foreground mt-2">{initialContext}</p>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea
        ref={scrollRef}
        className="flex-1 p-4"
        style={{ maxHeight }}
      >
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start a conversation with the AI assistant</p>
              <p className="text-sm mt-2">
                Ask questions about HR management, goals, performance reviews, or recruitment
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                </div>
              )}

              <div
                className={`rounded-lg px-4 py-3 max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="rounded-lg px-4 py-3 bg-muted">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}

          {error && (
            <div className="flex gap-3 justify-start">
              <div className="rounded-lg px-4 py-3 bg-destructive/10 text-destructive max-w-[80%]">
                <p className="text-sm font-medium">Error</p>
                <p className="text-sm mt-1">{error.message}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => reload()}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Form */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {isLoading ? (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={stop}
            >
              <span className="text-xs">Stop</span>
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>

        <p className="text-xs text-muted-foreground mt-2">
          Powered by{' '}
          {process.env.NEXT_PUBLIC_AI_PROVIDER === 'openai'
            ? 'OpenAI GPT-4o'
            : 'Anthropic Claude 3.5 Sonnet'}
        </p>
      </div>
    </Card>
  )
}
