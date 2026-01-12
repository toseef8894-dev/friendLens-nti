'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QUESTIONS } from '@/lib/nti-config'
import { UserResponse } from '@/lib/nti-scoring'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

type AnswerMap = Record<string, string[]> // question_id -> ranked option_ids

export default function AssessmentFlow() {
    const router = useRouter()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<AnswerMap>({})
    const [submitting, setSubmitting] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setIsAuthenticated(!!user)
        }
        checkAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setIsAuthenticated(!!session?.user)
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    const questions = QUESTIONS
    const total = questions.length
    const currentQuestion = questions[currentIndex]
    const progress = Math.round(((currentIndex + 1) / total) * 100)
    const isLast = currentIndex === total - 1

    const currentAnswers = answers[currentQuestion.id] || []

    function handleChoiceToggle(optionId: string) {
        const currentList = answers[currentQuestion.id] || []

        if (currentList.includes(optionId)) {
            setAnswers({
                ...answers,
                [currentQuestion.id]: currentList.filter(id => id !== optionId)
            })
        } else {
            setAnswers({
                ...answers,
                [currentQuestion.id]: [...currentList, optionId]
            })
        }
    }

    function handleNext() {
        if (currentAnswers.length === 0) {
            toast.error('Please select at least one option')
            return
        }
        if (currentIndex < total - 1) {
            setCurrentIndex(i => i + 1)
        }
    }

    function handleBack() {
        if (currentIndex > 0) {
            setCurrentIndex(i => i - 1)
        }
    }

    async function handleSubmit() {
        if (currentAnswers.length === 0) {
            toast.error('Please select at least one option')
            return
        }

        setSubmitting(true)

        try {
            const responses: UserResponse[] = Object.entries(answers).map(
                ([question_id, ranked_option_ids]) => ({
                    question_id,
                    ranked_option_ids
                })
            )

            const { data: { user } } = await supabase.auth.getUser()
            const isAuth = !!user

            const endpoint = isAuth ? '/api/nti/v1/submit' : '/api/nti/v1/submit-anonymous'
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responses })
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || 'Failed to submit assessment')
                setSubmitting(false)
                return
            }

            if (isAuth) {
                toast.success('Assessment complete!')
                router.push('/results?redirected=true')
            } else {
                const anonymousData = {
                    result: data.result,
                    responses: responses 
                }
                sessionStorage.setItem('anonymousResults', JSON.stringify(anonymousData))
                router.push('/results?anonymous=true')
            }
        } catch (err: any) {
            toast.error('Something went wrong. Please try again.')
            setSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center px-4 py-10">
            <div className="w-full max-w-xl space-y-6">
                {/* Progress bar */}
                <div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        Question {currentIndex + 1} of {total}
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h1 className="text-xl font-semibold text-gray-900 mb-4">
                        {currentQuestion.text}
                    </h1>
                    <p className="text-sm text-gray-500 mb-4">
                        Select all that apply, in order of importance (first = strongest)
                    </p>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option) => {
                            const isSelected = currentAnswers.includes(option.id)
                            const rankPosition = currentAnswers.indexOf(option.id)

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleChoiceToggle(option.id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 flex items-center gap-3 ${isSelected
                                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                        : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                                        }`}
                                >
                                    {isSelected && (
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-sm font-semibold flex items-center justify-center">
                                            {rankPosition + 1}
                                        </span>
                                    )}
                                    <span className={isSelected ? 'text-indigo-900 font-medium' : 'text-gray-700'}>
                                        {option.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {currentAnswers.length > 0 && (
                        <p className="mt-4 text-xs text-gray-500">
                            Selected order: {currentAnswers.map((id, i) => {
                                const opt = currentQuestion.options.find(o => o.id === id)
                                return `${i + 1}. ${opt?.label}`
                            }).join(' → ')}
                        </p>
                    )}
                </div>

                <div className="flex justify-between items-center pt-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={currentIndex === 0 || submitting}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        ← Back
                    </button>

                    {!isLast ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={submitting}
                            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            {submitting ? 'Analyzing...' : 'See my type →'}
                        </button>
                    )}
                </div>
            </div>
        </main>
    )
}
