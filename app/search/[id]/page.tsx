import { notFound, redirect } from 'next/navigation'

import { getChat } from '@/lib/actions/chat'
import { getCurrentUserId } from '@/lib/auth/get-current-user'
import { getModels } from '@/lib/config/models'
import { ExtendedCoreMessage, SearchResults } from '@/lib/types' // Added SearchResults
import { convertToUIMessages } from '@/lib/utils'

import { Chat } from '@/components/chat'

export const maxDuration = 60

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const userId = await getCurrentUserId()
  const chat = await getChat(id, userId || 'anonymous') // Ensure fallback for userId

  let metadata: {
    title: string
    openGraph?: { images?: { url: string; width?: number; height?: number }[] }
  } = {
    title: chat?.title?.toString().slice(0, 50) || 'Search'
  }

  if (chat && chat.messages) {
    const dataMessage = chat.messages.find(
      (msg: ExtendedCoreMessage) => msg.role === 'data'
    )

    if (dataMessage && dataMessage.content) {
      // Assuming dataMessage.content is of type SearchResults or a compatible structure
      const searchData = dataMessage.content as SearchResults
      if (searchData.images && searchData.images.length > 0) {
        const firstImage = searchData.images[0]
        let imageUrl: string | undefined = undefined

        if (typeof firstImage === 'string') {
          imageUrl = firstImage
        } else if (typeof firstImage === 'object' && firstImage.url) {
          imageUrl = firstImage.url
        }

        if (imageUrl) {
          metadata.openGraph = {
            images: [{ url: imageUrl, width: 1200, height: 630 }] // Standard OG image dimensions
          }
        }
      }
    }
  }
  // If no image is found, metadata.openGraph.images will remain undefined,
  // allowing fallback to parent or global OG image settings.
  return metadata
}

// ... rest of the file (default export SearchPage) remains the same
export default async function SearchPage(props: {
  params: Promise<{ id: string }>
}) {
  const userId = await getCurrentUserId()
  const { id } = await props.params

  const chat = await getChat(id, userId || 'anonymous')
  // convertToUIMessages for useChat hook
  const messages = convertToUIMessages(chat?.messages || [])

  if (!chat) {
    redirect('/')
  }

  // Only allow access if:
  // 1. User is authenticated AND owns the chat
  // 2. OR chat is anonymous AND user is not trying to access someone else's chat
  if (chat.userId && chat.userId !== 'anonymous') {
    // Chat has an owner - only that owner can access it
    if (!userId || chat.userId !== userId) {
      notFound()
    }
  } else {
    // Anonymous chat - anyone can view (for backward compatibility)
    // But if user is authenticated, they shouldn't see anonymous chats
    if (userId) {
      notFound()
    }
  }

  const models = await getModels()
  return <Chat key={id} id={id} savedMessages={messages} models={models} />
}
