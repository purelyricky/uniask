import { ArrowRight, FileText, GraduationCap, HelpCircle,Home } from 'lucide-react'

import { Button } from '@/components/ui/button'

const exampleMessages = [
  {
    heading: 'How do I apply to the University of Debrecen?',
    message: 'How do I apply to the University of Debrecen?',
    icon: FileText
  },
  {
    heading: 'What are the tuition fees and payment options?',
    message: 'What are the tuition fees and payment options?',
    icon: HelpCircle
  },
  {
    heading: 'Tell me about the entrance examination process',
    message: 'Tell me about the entrance examination process',
    icon: GraduationCap
  },
  {
    heading: 'What accommodation options are available for students?',
    message: 'What accommodation options are available for students?',
    icon: Home
  }
]

export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  return (
    <div className={`mx-auto w-full transition-all duration-200 ${className}`}>
      <div className="p-2 sm:p-4">
        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {exampleMessages.map((example, index) => {
            const Icon = example.icon
            return (
              <button
                key={index}
                onClick={() => submitMessage(example.message)}
                className="group relative flex items-start gap-3 p-3 sm:p-4 text-left rounded-xl border border-border/50 bg-card/50 hover:bg-accent/50 hover:border-border transition-all duration-200 hover:shadow-md"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="size-3.5 sm:size-4 text-primary group-hover:text-primary transition-colors" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors line-clamp-2">
                    {example.heading}
                  </p>
                </div>
                <ArrowRight className="flex-shrink-0 size-3.5 sm:size-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-0.5" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
