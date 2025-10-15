'use client'

import { SiLinkedin, SiX } from 'react-icons/si'
import Link from 'next/link'

import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

const externalLinks = [
  {
    name: 'X',
    href: 'https://x.com/purelyRicky',
    icon: <SiX className="mr-2 h-4 w-4" />
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/purelyricky/',
    icon: <SiLinkedin className="mr-2 h-4 w-4" />
  }
]

export function ExternalLinkItems() {
  return (
    <>
      {externalLinks.map(link => (
        <DropdownMenuItem key={link.name} asChild>
          <Link href={link.href} target="_blank" rel="noopener noreferrer">
            {link.icon}
            <span>{link.name}</span>
          </Link>
        </DropdownMenuItem>
      ))}
    </>
  )
}
