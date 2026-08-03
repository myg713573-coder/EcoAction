import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '../src/context/AuthContext'
import { tasksApi, userApi } from '../src/api'

export default function DashboardPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<{ id: string; title: string; description: string; rewardAmount: string }[]>([])
  const [profile, setProfile] = useState(user)
  const [referrals, setReferrals] = useState<{ id: string; referred: { username: string; email: string; createdAt: string } }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const [taskRes, profileRes, referralRes] = await Promise.all([
          tasksApi.list(),
          userApi.profile(user.id),
          userApi.referrals(user.id),
        ])
        setTasks(taskRes.data)
        setProfile(profileRes.data)
        setReferrals(referralRes.data)
      } catch {
        // ignore for now
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-slate-900/90 p-8 shadow-soft ring-1 ring-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Welcome back, {profile?.username ?? 'user'}</h1>
          </div>
          <Link href="/" className="inline-flex rounded-full border border-slate-700 bg-slate-950 px-5 py-3 text-sm text-slate-100 transition hover:border-cyan-400">
            Back to landing
          </Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-slate-900/80 p-8 shadow-soft ring-1 ring-slate-800">
            <p className="text-sm text-slate-400">Current Coins</p>
            <p className="mt-4 text-3xl font-semibold text-white">{profile ? Number(profile.coins).toLocaleString() : '—'}</p>
          </div>
          <div className="rounded-3xl bg-slate-900/80 p-8 shadow-soft ring-1 ring-slate-800">
            <p className="text-sm text-slate-400">Cash Balance</p>
            <p className="mt-4 text-3xl font-semibold text-white">${profile ? (Number(profile.cashBalance) / 10000).toFixed(2) : '—'}</p>
          </div>
          <div className="rounded-3xl bg-slate-900/80 p-8 shadow-soft ring-1 ring-slate-800">
            <p className="text-sm text-slate-400">Referral Code</p>
            <p className="mt-4 text-3xl font-semibold text-white">{profile?.referralCode ?? '—'}</p>
          </div>
        </section>

        <section className="rounded-3xl bg-slate-900/80 p-8 shadow-soft ring-1 ring-slate-800">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Referral system</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Invite friends and grow your earnings</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <p className="text-sm text-slate-400">Your referral code</p>
              <p className="mt-3 text-2xl font-semibold text-white">{profile?.referralCode ?? '—'}</p>
              <p className="mt-3 text-sm text-slate-400">Referral count: {profile?.referralCount ?? 0}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <p className="text-sm text-slate-400">What happens</p>
              <p className="mt-3 text-slate-300">When a new user signs up with your code, you receive a bonus and the new account receives a welcome reward.</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {referrals.length === 0 ? (
              <p className="text-slate-400">No referrals yet. Share your code with friends to get started.</p>
            ) : (
              referrals.map((referral) => (
                <div key={referral.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                  <p className="text-white">{referral.referred.username}</p>
                  <p className="text-sm text-slate-400">{referral.referred.email}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-slate-900/80 p-8 shadow-soft ring-1 ring-slate-800">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Today's tasks</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Available tasks</h2>
            </div>
            <Link href="/tasks" className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              View all tasks
            </Link>
          </div>
          {loading ? (
            <p className="text-slate-400">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-slate-400">No tasks available right now.</p>
          ) : (
            <div className="grid gap-4">
              {tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{task.title}</h3>
                      <p className="mt-2 text-slate-400">{task.description}</p>
                    </div>
                    <span className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">{Number(task.rewardAmount).toLocaleString()} coins</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
