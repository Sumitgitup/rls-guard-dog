// app/head-teacher/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/lib/database.types'

type Profile = Tables<'profiles'>

export default function HeadTeacherPage() {
  const [teachers, setTeachers] = useState<Profile[]>([])
  const [students, setStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')

      if (error) {
        console.error('Error fetching profiles:', error)
      } else if (profiles) {
        setTeachers(profiles.filter(p => p.role === 'teacher' || p.role === 'head_teacher'))
        setStudents(profiles.filter(p => p.role === 'student'))
      }
      setLoading(false)
    }

    fetchProfiles()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">
          Loading school roster...
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Teachers */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          👩‍🏫 Teachers
        </h1>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {teachers.map((teacher) => (
            <li
              key={teacher.id}
              className="py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {teacher.full_name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {teacher.role}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Students */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          🎓 Students
        </h1>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {students.map((student) => (
            <li
              key={student.id}
              className="py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {student.full_name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {student.role}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
