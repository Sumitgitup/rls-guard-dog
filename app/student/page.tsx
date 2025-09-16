'use client'
import { useState, useEffect } from 'react'
import { Tables } from '@/lib/database.types'

// Define the type for a progress record
type ProgressRecord = Tables<'progress'>

// STEP 1: Create a sample array of progress data.
// The structure must match the 'ProgressRecord' type.
const hardcodedProgressData: ProgressRecord[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    student_id: 'your-student-uuid', // This can be a placeholder
    classroom_id: 'class-a-uuid',
    school_id: 'school-uuid',
    subject: ' Math Test',
    score: 95,
    updated_at: new Date().toISOString(),
    profiles: function (profiles: any): unknown {
      throw new Error('Function not implemented.')
    }
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    student_id: 'your-student-uuid',
    classroom_id: 'class-a-uuid',
    school_id: 'school-uuid',
    subject: ' Science Test',
    score: 88,
    updated_at: new Date().toISOString(),
    profiles: function (profiles: any): unknown {
      throw new Error('Function not implemented.')
    }
  },
]

export default function StudentPage() {
  // STEP 2: Initialize the state directly with your hardcoded data.
  const [progress, setProgress] = useState<ProgressRecord[]>(hardcodedProgressData)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Progress (Test Data)</h1>
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-200 text-gray-600 uppercase text-sm">
          <tr>
            <th className="py-3 px-6 text-left">Subject</th>
            <th className="py-3 px-6 text-center">Score</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {progress.map((record) => (
            <tr key={record.id} className="border-b border-gray-200">
              <td className="py-3 px-6 text-left">{record.subject}</td>
              <td className="py-3 px-6 text-center">{record.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}