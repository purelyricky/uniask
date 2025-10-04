'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface IconLogoProps {
  className?: string
}

function IconLogo({ className }: IconLogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="UnidebAsk Logo"
      width={16}
      height={16}
      className={cn('h-4 w-4', className)}
      priority
    />
  )
}

export { IconLogo }
