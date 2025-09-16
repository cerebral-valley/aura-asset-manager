import { useState, useEffect, createContext, useContext } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/queryKeys'
import { assetsService } from '@/services/assets'
import { transactionsService } from '@/services/transactions'
import { insuranceService } from '@/services/insurance'
import annuityService from '@/services/annuities'
import { dashboardService } from '@/services/dashboard'

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
  const queryClient = useQueryClient()

  console.log('🔐 AuthProvider: Current state - user:', !!user, 'loading:', loading, 'email:', user?.email)

  // Prefetch core data after authentication
  const prefetchUserData = async () => {
    if (!queryClient) return
    
    try {
      console.log('🔄 AuthProvider: Starting data prefetch for authenticated user')
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: queryKeys.assets.list(),
          queryFn: ({ signal }) => assetsService.getAssets({ signal })
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.transactions.list(),
          queryFn: ({ signal }) => transactionsService.getTransactions({ signal })
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.insurance.list(),
          queryFn: ({ signal }) => insuranceService.getPolicies({ signal })
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.annuities.list(),
          queryFn: ({ signal }) => annuityService.getAnnuities({}, { signal })
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.dashboard.summary(),
          queryFn: ({ signal }) => dashboardService.getSummary({ signal })
        }),
      ])
      console.log('✅ AuthProvider: Data prefetch completed successfully')
    } catch (error) {
      console.warn('⚠️ AuthProvider: Data prefetch failed (non-critical):', error)
    }
  }

  useEffect(() => {
    console.log('🔐 AuthProvider: useEffect - getting initial session')
    // Get initial session
    const getSession = async () => {
      console.log('🔐 AuthProvider: Calling supabase.auth.getSession()')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔐 AuthProvider: Session received:', !!session, 'user:', !!session?.user)
      if (session?.user) {
        console.log('🔐 User metadata:', session.user.user_metadata)
        // Prefetch data for initial session
        prefetchUserData()
      }
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
        if (session?.user) {
          console.log('🔐 User metadata:', session.user.user_metadata)
          // Prefetch data after successful authentication
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            prefetchUserData()
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear cache on logout
          console.log('🔄 AuthProvider: Clearing cache on logout')
          queryClient.clear()
        }
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

