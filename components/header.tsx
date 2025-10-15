'use client'

import React from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { LogIn } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSidebar } from '@/components/ui/sidebar'

import { Button } from './ui/button'
import GuestMenu from './guest-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import UserMenu from './user-menu'

interface HeaderProps {
  user: User | null
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const { open } = useSidebar()
  return (
    <header
      className={cn(
        'absolute top-0 right-0 p-2 flex justify-between items-center z-10 backdrop-blur lg:backdrop-blur-none bg-background/80 lg:bg-transparent transition-[width] duration-200 ease-linear',
        open ? 'md:w-[calc(100%-var(--sidebar-width))]' : 'md:w-full',
        'w-full'
      )}
    >
      {/* This div can be used for a logo or title on the left if needed */}
      <div></div>

      <div className="flex items-center gap-2">
        {user ? (
          <UserMenu user={user} />
        ) : (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className={cn(
                    'h-7 px-2.5 text-xs rounded-md shadow-sm',
                    'hover:scale-[1.02] active:scale-[0.98] transition-transform'
                  )}
                  asChild
                >
                  <Link href="/auth/login">
                    <LogIn className="size-3.5 mr-1.5" />
                    <span>Sign In</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4}>
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
