// app/teacher/page.tsx
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
      // First, get the current user to find their classroom_id
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Fetch the teacher's profile to get their assigned classroom
        const { data: profile } = await supabase
          .from('profiles')
          .select('classroom_id')
          .eq('id', user.id)
          .single()
        
        if (profile?.classroom_id) {
          setClassroomId(profile.classroom_id)
        }
      }

      // Fetch the progress records for the teacher's class (RLS handles this)
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

  // --- FUNCTION MOVED HERE ---
  const handleCalculateAverages = async () => {
    if (!classroomId) {
      alert('Could not determine your classroom ID.')
      return
    }
    const { data, error } = await supabase.functions.invoke('class-average', {
      body: { classroom_id: classroomId },
    })
    if (error) alert('Error calculating average: ' + error.message)
    else alert('Successfully calculated average for your class!')
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        {/* --- BUTTON MOVED HERE --- */}
        <button
          onClick={handleCalculateAverages}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Calculate Class Average
        </button>
      </div>
      <div className="overflow-x-auto">
        {/* The rest of your table JSX remains the same */}
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-200 text-gray-600 uppercase text-sm">
            <tr>
              <th className="py-3 px-6 text-left">Student Name</th>
              <th className="py-3 px-6 text-left">Subject</th>
              <th className="py-3 px-6 text-center">Score</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {progress.map((record) => (
              <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left">
                  {record.profiles?.full_name ?? 'N/A'}
                </td>
                <td className="py-3 px-6 text-left">{record.subject}</td>
                <td className="py-3 px-6 text-center">
                  <input
                    type="number"
                    defaultValue={record.score}
                    onBlur={(e: ChangeEvent<HTMLInputElement>) =>
                      handleScoreChange(record.id, parseInt(e.target.value, 10))
                    }
                    className="w-20 text-center border rounded py-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}