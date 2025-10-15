'use client'

import { Flag } from 'lucide-react'
import { SiGithub, SiX } from 'react-icons/si'
import Link from 'next/link'

import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

const externalLinks = [
  {
    name: 'Wrong Answers',
    href: '/wrong-answers',
    icon: <Flag className="mr-2 h-4 w-4 text-red-500" />,
    internal: true
  },
  {
    name: 'X',
    href: 'https://x.com/purelyRicky',
    icon: <SiX className="mr-2 h-4 w-4" />
  },
  {
    name: 'GitHub',
    href: 'https://github.com/purelyricky',
    icon: <SiGithub className="mr-2 h-4 w-4" />
  }
]

export function ExternalLinkItems() {
  return (
    <>
      {externalLinks.map(link => (
        <DropdownMenuItem key={link.name} asChild>
          <Link
            href={link.href}
            target={link.internal ? undefined : '_blank'}
            rel={link.internal ? undefined : 'noopener noreferrer'}
          >
            {link.icon}
            <span>{link.name}</span>
          </Link>
        </DropdownMenuItem>
      ))}
    </>
  )
}
