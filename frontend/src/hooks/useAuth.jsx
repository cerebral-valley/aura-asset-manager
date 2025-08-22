import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  console.log('🔐 AuthProvider: Current state - user:', !!user, 'loading:', loading, 'email:', user?.email)

  useEffect(() => {
    console.log('🔐 AuthProvider: useEffect - getting initial session')
    // Get initial session
    const getSession = async () => {
      console.log('🔐 AuthProvider: Calling supabase.auth.getSession()')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔐 AuthProvider: Session received:', !!session, 'user:', !!session?.user)
      setUser(session?.user ?? null)
      setLoading(false)
      console.log('🔐 AuthProvider: Loading set to false')
    }

    getSession()

    // Listen for auth changes
    console.log('🔐 AuthProvider: Setting up auth state change listener')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 AuthProvider: Auth state changed - event:', event, 'session:', !!session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

