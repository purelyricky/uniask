import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be signed in to flag answers' },
        { status: 401 }
      )
    }

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

    // Check if this answer has already been flagged by this user
    const { data: existingFlag, error: checkError } = await supabase
      .from('wrong_answers')
      .select('id')
      .eq('user_id', user.id)
      .eq('message_id', messageId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected
      console.error('Error checking existing flag:', checkError)
      return NextResponse.json(
        {
          error: 'Database Error',
          message: 'Failed to check existing flags'
        },
        { status: 500 }
      )
    }

    if (existingFlag) {
      return NextResponse.json(
        {
          error: 'Already Flagged',
          message: 'You have already flagged this answer'
        },
        { status: 409 }
      )
    }

    // Insert into wrong_answers table
    const { data: wrongAnswer, error: insertWrongError } = await supabase
      .from('wrong_answers')
      .insert({
        user_id: user.id,
        chat_id: chatId,
        message_id: messageId,
        question: question,
        answer: answer,
        flagged_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertWrongError) {
      console.error('Error inserting wrong answer:', insertWrongError)
      return NextResponse.json(
        {
          error: 'Database Error',
          message: 'Failed to flag answer'
        },
        { status: 500 }
      )
    }

    // Also insert/update in questions table for tracking
    // First check if question already exists
    const { data: existingQuestion } = await supabase
      .from('questions')
      .select('id')
      .eq('message_id', messageId)
      .single()

    if (!existingQuestion) {
      // Insert new question
      const { error: insertQuestionError } = await supabase
        .from('questions')
        .insert({
          user_id: user.id,
          chat_id: chatId,
          message_id: messageId,
          question: question,
          answer: answer
        })

      if (insertQuestionError) {
        console.error('Error inserting question:', insertQuestionError)
        // Not critical, so we don't fail the request
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Answer flagged successfully',
        data: wrongAnswer
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in flag-wrong-answer API:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}
