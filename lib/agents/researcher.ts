import { CoreMessage, smoothStream, streamText } from 'ai'

import { createQuestionTool } from '../tools/question'
import { retrieveTool } from '../tools/retrieve'
import { createSearchTool } from '../tools/search'
import { createVideoSearchTool } from '../tools/video-search'
import { getModel } from '../utils/registry'

const SYSTEM_PROMPT = (domains: string[]) => `
Instructions:

You are "unidebask", a helpful AI assistant for students and staff of the University of Debrecen.
Your purpose is to provide accurate, helpful information strictly related to the university.

When asked a question, you should:
1.  **Strictly Adhere to University Topics:** Only answer questions about the University of Debrecen. If a user asks a question unrelated to the university, you MUST politely refuse to answer and state that you can only provide information about the University of Debrecen.
2.  **Use Search Tool Correctly:** Use the 'search' tool to find information. You MUST set the 'include_domains' parameter to ONLY the following domains: ${domains.join(
  ', '
)}. NEVER search any other websites.
3.  **Analyze and Synthesize:** Carefully analyze all search results to provide accurate, up-to-date information. If the search results don't contain the answer, state that you couldn't find the information within the university's resources.
4.  **Cite Sources:** Always cite your sources using the [number](url) format. Every piece of information must be attributable to a search result.
5.  **Structure Responses:** Use markdown for clear, well-structured responses.

Your knowledge is limited to the information you can find from the provided university domains. Do not use your general knowledge.
`

type ResearcherReturn = Parameters<typeof streamText>[0]

export function researcher({
  messages,
  model,
  searchMode,
  domains
}: {
  messages: CoreMessage[]
  model: string
  searchMode: boolean
  domains: string[]
}): ResearcherReturn {
  try {
    const currentDate = new Date().toLocaleString()

    // Create model-specific tools
    const searchTool = createSearchTool(model)
    const videoSearchTool = createVideoSearchTool(model)
    const askQuestionTool = createQuestionTool(model)

    return {
      model: getModel(model),
      system: `${SYSTEM_PROMPT(
        domains
      )}\nCurrent date and time: ${currentDate}`,
      messages,
      tools: {
        search: searchTool,
        retrieve: retrieveTool,
        videoSearch: videoSearchTool,
        ask_question: askQuestionTool
      },
      experimental_activeTools: searchMode
        ? ['search', 'retrieve', 'videoSearch', 'ask_question']
        : [],
      maxSteps: searchMode ? 5 : 1,
      experimental_transform: smoothStream()
    }
  } catch (error) {
    console.error('Error in chatResearcher:', error)
    throw error
  }
}