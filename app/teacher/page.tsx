'use client'
import { useState, useEffect, ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/lib/database.types'

type ProgressRecord = Tables<'progress'> & { profiles: { full_name: string } | null }

export default function TeacherPage() {
  const [progress, setProgress] = useState<ProgressRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [classroomId, setClassroomId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('classroom_id')
          .eq('id', user.id)
          .single()
        
        if (profile?.classroom_id) {
          setClassroomId(profile.classroom_id)
        }
      }

      const { data: progressData, error } = await supabase.from('progress').select(`
        *,
        profiles ( full_name )
      `)

      if (error) {
        console.error('Error fetching progress:', error)
      } else {
        setProgress(progressData as ProgressRecord[] || [])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleScoreChange = async (id: string, newScore: number) => {
    const { error } = await supabase
      .from('progress')
      .update({ score: newScore, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) alert('Error updating score: ' + error.message)
  }

  const handleCalculateAverages = async () => {
    if (!classroomId) {
      alert('Could not determine your classroom ID.')
      return
    }
    const { error } = await supabase.functions.invoke('class-average', {
      body: { classroom_id: classroomId },
    })
    if (error) alert('Error calculating average: ' + error.message)
    else alert('Successfully calculated average for your class!')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">
          Loading teacher dashboard...
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            🧑‍🏫 Teacher Dashboard
          </h1>
          <button
            onClick={handleCalculateAverages}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow transition-colors"
          >
            Calculate Class Average
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-xs md:text-sm">
                <th className="py-3 px-4 text-left rounded-tl-lg">Student Name</th>
                <th className="py-3 px-4 text-left">Subject</th>
                <th className="py-3 px-4 text-center rounded-tr-lg">Score</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((record, idx) => (
                <tr
                  key={record.id}
                  className={`${
                    idx % 2 === 0
                      ? 'bg-gray-50 dark:bg-gray-800/50'
                      : 'bg-white dark:bg-gray-900'
                  } hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                >
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                    {record.profiles?.full_name ?? 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {record.subject}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="number"
                      defaultValue={record.score}
                      onBlur={(e: ChangeEvent<HTMLInputElement>) =>
                        handleScoreChange(record.id, parseInt(e.target.value, 10))
                      }
                      className="w-20 text-center border border-gray-300 dark:border-gray-700 rounded-lg py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
