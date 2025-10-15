'use client'

import { useState } from 'react'

import { X } from 'lucide-react'

import { Button } from './ui/button'
import { LoginForm } from './login-form'
import { SignUpForm } from './sign-up-form'

interface AuthRequiredOverlayProps {
  onDismiss?: () => void
  showDismiss?: boolean
}

export function AuthRequiredOverlay({
  onDismiss,
  showDismiss = false
}: AuthRequiredOverlayProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md p-4">
      <div className="w-full max-w-md relative">
        {showDismiss && onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-10 right-0 z-10"
            onClick={onDismiss}
          >
            <X className="size-4" />
          </Button>
        )}

        <div className="flex flex-col items-center gap-4">
          <div className="text-center space-y-2 mb-4">
            <h2 className="text-2xl font-semibold">Sign in to view response</h2>
            <p className="text-sm text-muted-foreground">
              Create an account or sign in to see AI responses
            </p>
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              variant={mode === 'login' ? 'default' : 'outline'}
              onClick={() => setMode('login')}
              size="sm"
            >
              Sign In
            </Button>
            <Button
              variant={mode === 'signup' ? 'default' : 'outline'}
              onClick={() => setMode('signup')}
              size="sm"
            >
              Sign Up
            </Button>
          </div>

          <div className="w-full">
            {mode === 'login' ? <LoginForm /> : <SignUpForm />}
          </div>
        </div>
      </div>
    </div>
  )
}
