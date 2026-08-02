import { createContext, useContext, useEffect, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { UserProfile } from '../api'

type AuthContextValue = {
  user: UserProfile | null
  setUser: (value: UserProfile | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [storedUser, setStoredUser] = useLocalStorage<UserProfile | null>('ecoaction_user', null)
  const [user, setUserState] = useState<UserProfile | null>(storedUser)

  useEffect(() => {
    setStoredUser(user)
  }, [user, setStoredUser])

  const setUser = (value: UserProfile | null) => {
    setUserState(value)
  }

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
