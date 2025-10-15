'use client'

import { useEffect, useState } from 'react'

import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  CheckCircle,
  Flag,
  MessageCircle,
  Trash2
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface WrongAnswer {
  id: string
  question: string
  answer: string
  flagged_at: string
  user_id: string
}

interface Statistics {
  totalQuestions: number
  totalWrongAnswers: number
}

// Animated counter component
function AnimatedCounter({
  value,
  color
}: {
  value: number
  color: 'green' | 'red'
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const duration = 2000 // 2 seconds
    const increment = end / (duration / 16) // 60fps

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value])

  const colorClasses = {
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400'
  }

  return (
    <span className={`text-5xl font-bold ${colorClasses[color]}`}>
      {displayValue.toLocaleString()}
    </span>
  )
}

export default function WrongAnswersPage() {
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([])
  const [statistics, setStatistics] = useState<Statistics>({
    totalQuestions: 0,
    totalWrongAnswers: 0
  })
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()

    try {
      // Fetch statistics
      const { data: questionsData } = await supabase
        .from('questions')
        .select('id', { count: 'exact' })

      const { data: wrongAnswersData } = await supabase
        .from('wrong_answers')
        .select('id', { count: 'exact' })

      setStatistics({
        totalQuestions: questionsData?.length || 0,
        totalWrongAnswers: wrongAnswersData?.length || 0
      })

      // Fetch wrong answers with details
      const { data: wrongAnswersList, error } = await supabase
        .from('wrong_answers')
        .select('*')
        .order('flagged_at', { ascending: false })

      if (error) {
        console.error('Error fetching wrong answers:', error)
      } else {
        setWrongAnswers(wrongAnswersList || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('wrong_answers').delete().eq('id', id)

    if (error) {
      console.error('Error deleting wrong answer:', error)
      alert('Failed to delete. Please try again.')
    } else {
      // Refresh data
      fetchData()
    }
  }

  function toggleSort() {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
    setWrongAnswers(prev => [...prev].reverse())
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Flag className="size-10 text-red-500" />
            Wrong Answers Report
          </h1>
          <p className="text-muted-foreground">
            Track and review questions that have been flagged as having
            incorrect answers
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Questions Card */}
          <Card className="border-2 border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
                All Time Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <MessageCircle className="size-12 text-green-600/30 dark:text-green-400/30" />
                <div>
                  <AnimatedCounter
                    value={statistics.totalQuestions}
                    color="green"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Total questions asked
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wrong Answers Card */}
          <Card className="border-2 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
                Flagged Wrong Answers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Flag className="size-12 text-red-600/30 dark:text-red-400/30" />
                <div>
                  <AnimatedCounter
                    value={statistics.totalWrongAnswers}
                    color="red"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Answers flagged as incorrect
                  </p>
                </div>
              </div>
              {statistics.totalQuestions > 0 && (
                <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-900">
                  <p className="text-sm text-muted-foreground">
                    Error rate:{' '}
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {(
                        (statistics.totalWrongAnswers /
                          statistics.totalQuestions) *
                        100
                      ).toFixed(2)}
                      %
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Wrong Answers Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Flag className="size-5 text-red-500" />
                Flagged Questions & Answers
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSort}
                className="gap-2"
              >
                <Calendar className="size-4" />
                {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                <ArrowUpDown className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {wrongAnswers.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No Wrong Answers Flagged
                </h3>
                <p className="text-muted-foreground">
                  Great! All answers are accurate or no flags have been
                  submitted yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Question</TableHead>
                      <TableHead className="w-[40%]">Answer</TableHead>
                      <TableHead className="w-[20%]">Flagged Date</TableHead>
                      <TableHead className="w-[10%] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wrongAnswers.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="max-w-xs truncate" title={item.question}>
                            {item.question}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className="max-w-md line-clamp-3 text-sm text-muted-foreground"
                            title={item.answer}
                          >
                            {item.answer}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(item.flagged_at).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
