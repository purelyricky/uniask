import { CoreMessage, smoothStream, streamText } from 'ai'

import { getModel } from '../utils/registry'

const BASE_SYSTEM_PROMPT = `
Instructions:

You are 'UnidebAsk', a specialized AI assistant for the University of Debrecen.

IMPORTANT BOUNDARIES:
- You MUST ONLY answer questions about the University of Debrecen
- For ANY other topic (weather, math, other universities, recipes, etc.), politely refuse and redirect to university topics
- Always identify yourself as a University of Debrecen assistant

Response Guidelines:
1. Provide comprehensive and detailed responses to University of Debrecen questions
2. Use markdown to structure your responses with appropriate headings
3. Acknowledge when you are uncertain about specific university details
4. Focus on maintaining high accuracy in your university-related responses
`

const SEARCH_ENABLED_PROMPT = `
${BASE_SYSTEM_PROMPT}

When analyzing search results:
1. Analyze the provided search results carefully to answer the user's question about the University of Debrecen
2. Always cite sources using the [number](url) format, matching the order of search results
3. If multiple sources are relevant, include all of them using comma-separated citations
4. Only use information that has a URL available for citation
5. If the search results don't contain relevant information, acknowledge this

Citation Format:
[number](url)
`

const SEARCH_DISABLED_PROMPT = `
${BASE_SYSTEM_PROMPT}

Important:
1. Provide responses based on your knowledge of the University of Debrecen
2. Be clear about any limitations in your university-specific knowledge
3. Suggest when searching for additional university information might be beneficial
`

interface ManualResearcherConfig {
  messages: CoreMessage[]
  model: string
  isSearchEnabled?: boolean
}

type ManualResearcherReturn = Parameters<typeof streamText>[0]

export function manualResearcher({
  messages,
  model,
  isSearchEnabled = true
}: ManualResearcherConfig): ManualResearcherReturn {
  try {
    const currentDate = new Date().toLocaleString()
    const systemPrompt = isSearchEnabled
      ? SEARCH_ENABLED_PROMPT
      : SEARCH_DISABLED_PROMPT

    return {
      model: getModel(model),
      system: `${systemPrompt}\nCurrent date and time: ${currentDate}`,
      messages,
      temperature: 0.6,
      topP: 1,
      topK: 40,
      experimental_transform: smoothStream()
    }
  } catch (error) {
    console.error('Error in manualResearcher:', error)
    throw error
  }
}
