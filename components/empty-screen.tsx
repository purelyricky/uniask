import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

const exampleMessages = [
  {
    heading: 'How do I apply to the University of Debrecen?',
    message: 'How do I apply to the University of Debrecen?'
  },
  {
    heading: 'What are the tuition fees and payment options?',
    message: 'What are the tuition fees and payment options?'
  },
  {
    heading: 'Tell me about the entrance examination process',
    message: 'Tell me about the entrance examination process'
  },
  {
    heading: 'What accommodation options are available for students?',
    message: 'What accommodation options are available for students?'
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
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-2">
        <div className="mt-2 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              name={message.message}
              onClick={async () => {
                submitMessage(message.message)
              }}
            >
              <ArrowRight size={16} className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
