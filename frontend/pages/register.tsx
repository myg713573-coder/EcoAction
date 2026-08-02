import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { authApi } from '../src/api'
import { useAuth } from '../src/context/AuthContext'
import { FormField } from '../src/components/FormField'

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const response = await authApi.register({ email, username, password })
      setUser(response.data)
      router.push('/dashboard')
    } catch (err) {
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 py-16 px-6 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-md rounded-3xl bg-slate-900/90 p-10 shadow-soft ring-1 ring-slate-800">
        <h1 className="text-3xl font-semibold text-white">Register</h1>
        <p className="mt-3 text-slate-400">Create your account to start completing tasks, earning coins, and requesting withdrawals.</p>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <FormField label="Username" name="username" value={username} onChange={setUsername} placeholder="your username" />
          <FormField label="Email" name="email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <FormField label="Password" name="password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button type="submit" className="w-full rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Create account
          </button>
          <p className="text-center text-sm text-slate-400">
            Already have an account? <Link href="/login" className="text-cyan-300 hover:text-cyan-200">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
