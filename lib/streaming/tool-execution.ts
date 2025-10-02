import {
  CoreMessage,
  DataStreamWriter,
  generateId,
  generateText,
  JSONValue
} from 'ai'
import { z } from 'zod'

import { searchSchema } from '../schema/search'
import { search } from '../tools/search'
import { ExtendedCoreMessage } from '../types'
import { getModel } from '../utils/registry'

import { parseToolCallXml } from './parse-tool-call'

interface ToolExecutionResult {
  toolCallDataAnnotation: ExtendedCoreMessage | null
  toolCallMessages: CoreMessage[]
}

export async function executeToolCall(
  coreMessages: CoreMessage[],
  dataStream: DataStreamWriter,
  model: string,
  searchMode: boolean,
  domains: string[]
): Promise<ToolExecutionResult> {
  // If search mode is disabled, return empty tool call
  if (!searchMode) {
    return { toolCallDataAnnotation: null, toolCallMessages: [] }
  }

  // Convert Zod schema to string representation
  const searchSchemaString = Object.entries(searchSchema.shape)
    .map(([key, value]) => {
      const description = value.description
      const isOptional = value instanceof z.ZodOptional
      return `- ${key}${isOptional ? ' (optional)' : ''}: ${description}`
    })
    .join('\n')
  const defaultMaxResults = model?.includes('ollama') ? 5 : 20

  // Generate tool selection using XML format
  const toolSelectionResponse = await generateText({
    model: getModel(model),
    system: `You are an intelligent assistant that analyzes conversations to select the most appropriate tools and their parameters.
            You excel at understanding context to determine when and how to use available tools, including crafting effective search queries.
            Current date: ${new Date().toISOString().split('T')[0]}

            Do not include any other text in your response.
            Respond in XML format with the following structure:
            <tool_call>
              <tool>tool_name</tool>
              <parameters>
                <query>search query text</query>
                <max_results>number - ${defaultMaxResults} by default</max_results>
                <search_depth>basic or advanced</search_depth>
                </parameters>
            </tool_call>

            Available tools: search

            Search parameters:
            ${searchSchemaString}

            If you don't need a tool, respond with <tool_call><tool></tool></tool_call>`,
    messages: coreMessages
  })

  // Parse the tool selection XML using the search schema
  const toolCall = parseToolCallXml(toolSelectionResponse.text, searchSchema)

  if (!toolCall || toolCall.tool === '') {
    return { toolCallDataAnnotation: null, toolCallMessages: [] }
  }
  
  // Enforce the university domains, overriding anything the LLM might have generated
  const finalParameters = {
    ...toolCall.parameters,
    include_domains: domains,
    exclude_domains: []
  };


  const toolCallAnnotation = {
    type: 'tool_call',
    data: {
      state: 'call',
      toolCallId: `call_${generateId()}`,
      toolName: toolCall.tool,
      args: JSON.stringify(finalParameters)
    }
  }
  dataStream.writeData(toolCallAnnotation)

  // Support for search tool only for now
  const searchResults = await search(
    finalParameters.query ?? '',
    finalParameters.max_results,
    finalParameters.search_depth as 'basic' | 'advanced',
    finalParameters.include_domains ?? [],
    finalParameters.exclude_domains ?? []
  )

  const updatedToolCallAnnotation = {
    ...toolCallAnnotation,
    data: {
      ...toolCallAnnotation.data,
      result: JSON.stringify(searchResults),
      state: 'result'
    }
  }
  dataStream.writeMessageAnnotation(updatedToolCallAnnotation)

  const toolCallDataAnnotation: ExtendedCoreMessage = {
    role: 'data',
    content: {
      type: 'tool_call',
      data: updatedToolCallAnnotation.data
    } as JSONValue
  }

  const toolCallMessages: CoreMessage[] = [
    {
      role: 'assistant',
      content: `Tool call result: ${JSON.stringify(searchResults)}`
    },
    {
      role: 'user',
      content: 'Now answer the user question.'
    }
  ]

  return { toolCallDataAnnotation, toolCallMessages }
}