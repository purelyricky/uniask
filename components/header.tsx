'use client'

import React from 'react'
import Link from 'next/link'

import { User } from '@supabase/supabase-js'
import { LogIn } from 'lucide-react'

import { cn } from '@/lib/utils'

import { useSidebar } from '@/components/ui/sidebar'

import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import GuestMenu from './guest-menu'
import UserMenu from './user-menu'

interface HeaderProps {
  user: User | null
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const { open } = useSidebar()
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      {/* This div can be used for a logo or title on the left if needed */}
      <div className="flex items-center"></div>

      <div className="flex items-center justify-end space-x-2">
        {user ? (
          <UserMenu user={user} />
        ) : (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/sign-in" className="size-8 sm:size-9">
                    <LogIn className="size-4 sm:size-5" />
                    <span className="sr-only">Sign In</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={10}>
                Sign in to save your chat history
              </TooltipContent>
            </Tooltip>
            <GuestMenu />
          </>
        )}
      </div>
    </header>
  )
}

export default Header