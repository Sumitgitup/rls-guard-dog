'use client'
import { useState } from 'react'
import { Tables } from '@/lib/database.types'

// Define the type for a progress record
type ProgressRecord = Tables<'progress'>

// STEP 1: Create a sample array of progress data.
const hardcodedProgressData: ProgressRecord[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    student_id: 'your-student-uuid',
    classroom_id: 'class-a-uuid',
    school_id: 'school-uuid',
    subject: 'Math Test',
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
    subject: 'Science Test',
    score: 88,
    updated_at: new Date().toISOString(),
    profiles: function (profiles: any): unknown {
      throw new Error('Function not implemented.')
    }
  },
]

export default function StudentPage() {
  // STEP 2: Initialize state with hardcoded data.
  const [progress] = useState<ProgressRecord[]>(hardcodedProgressData)

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          📊 My Progress
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-xs md:text-sm">
                <th className="py-3 px-4 text-left rounded-tl-lg">Subject</th>
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
                    {record.subject}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-blue-600 dark:text-blue-400">
                    {record.score}
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
