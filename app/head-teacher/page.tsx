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
      // RLS allows the head teacher to see all profiles in their school.
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')

      if (error) {
        console.error('Error fetching profiles:', error)
      } else if (profiles) {
        // Separate the profiles into two lists based on their role
        setTeachers(profiles.filter(p => p.role === 'teacher' || p.role === 'head_teacher'))
        setStudents(profiles.filter(p => p.role === 'student'))
      }
      setLoading(false)
    }

    fetchProfiles()
  }, [])

  if (loading) return <div>Loading school roster...</div>

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">School Roster - Teachers</h1>
        <ul className="bg-white rounded border p-4">
          {teachers.map((teacher) => (
            <li key={teacher.id} className="border-b py-2">
              <p className="font-semibold">{teacher.full_name}</p>
              <p className="text-sm text-gray-600">{teacher.role}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-4">School Roster - Students</h1>
        <ul className="bg-white rounded border p-4">
          {students.map((student) => (
            <li key={student.id} className="border-b py-2">
              <p className="font-semibold">{student.full_name}</p>
              <p className="text-sm text-gray-600">{student.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}