'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { User } from '@supabase/supabase-js'
import { Github } from 'lucide-react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

import { useSidebar } from '@/components/ui/sidebar'

import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import GuestMenu from './guest-menu'
import UserMenu from './user-menu'
import { SidebarTrigger } from './ui/sidebar'

interface HeaderProps {
  user: User | null
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const { open } = useSidebar()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-14 px-3 shrink-0 backdrop-blur-lg bg-background/80">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-9" asChild>
              <Link href="https://github.com/purelyricky/uniask" target="_blank" rel="noopener noreferrer">
                <Github className="size-4" />
                <span className="sr-only">GitHub</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            View on GitHub
          </TooltipContent>
        </Tooltip>

        <GuestMenu />

        {user ? (
          <>
            <UserMenu user={user} />
            <Button
              size="sm"
              onClick={handleLogout}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium h-9 px-4"
            >
              Sign Out
            </Button>
          </>
        ) : (
          <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium h-9 px-4">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        )}
      </div>
    </header>
  )
}

export default Header