// app/login/page.tsx
'use client'
import { createClient } from '@/lib/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  // Use useEffect to set up the listener once
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          // 1. Get the user's ID from the session
          const userId = session?.user?.id
          if (!userId) return

          // 2. Fetch the user's profile to find their role
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()

          if (error || !profile) {
            // If there's an error or no profile, redirect to a safe default
            router.push('/')
            return
          }

          // 3. Redirect based on the role
          switch (profile.role) {
            case 'student':
              router.push('/student')
              break
            case 'teacher':
              router.push('/teacher')
              break
            case 'head_teacher':
              router.push('/head-teacher')
              break
            default:
              router.push('/') // Fallback for any other case
              break
          }
        }
      }
    )

    // Cleanup the listener when the component unmounts
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '320px' }}>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']}
        />
      </div>
    </div>
  )
}