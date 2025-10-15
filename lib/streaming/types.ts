import { Message } from 'ai'

import { Model } from '../types/models'

export interface BaseStreamConfig {
  messages: Message[]
  model: Model
  chatId: string
  searchMode: boolean
  userId: string | null
  domains: string[] // Added this line
}