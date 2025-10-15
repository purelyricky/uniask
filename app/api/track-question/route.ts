import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user (optional - we track both authenticated and anonymous)
    const {
      data: { user }
    } = await supabase.auth.getUser()

    // Parse request body
    const body = await request.json()
    const { chatId, messageId, question, answer } = body

    // Validate required fields
    if (!chatId || !messageId || !question || !answer) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if question already exists (to avoid duplicates)
    const { data: existingQuestion } = await supabase
      .from('questions')
      .select('id')
      .eq('message_id', messageId)
      .single()

    if (existingQuestion) {
      return NextResponse.json(
        {
          success: true,
          message: 'Question already tracked',
          data: existingQuestion
        },
        { status: 200 }
      )
    }

    // Insert into questions table
    const { data: newQuestion, error: insertError } = await supabase
      .from('questions')
      .insert({
        user_id: user?.id || null,
        chat_id: chatId,
        message_id: messageId,
        question: question,
        answer: answer
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting question:', insertError)
      return NextResponse.json(
        {
          error: 'Database Error',
          message: 'Failed to track question'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Question tracked successfully',
        data: newQuestion
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in track-question API:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}
