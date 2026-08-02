import { useEffect, useState } from 'react'
import Link from 'next/link'
import { tasksApi } from '../src/api'
import { useAuth } from '../src/context/AuthContext'

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<{ id: string; title: string; description: string; rewardAmount: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await tasksApi.list()
        setTasks(response.data)
      } catch {
        setError('Unable to load tasks right now.')
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-slate-900/90 p-8 shadow-soft ring-1 ring-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Tasks</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Complete tasks for coins</h1>
          </div>
          <Link href="/dashboard" className="inline-flex rounded-full border border-slate-700 bg-slate-950 px-5 py-3 text-sm text-slate-100 transition hover:border-cyan-400">
            Back to dashboard
          </Link>
        </header>

        {error ? <p className="text-slate-400">{error}</p> : null}
        {loading ? (
          <p className="text-slate-400">Loading tasks...</p>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{task.title}</h2>
                    <p className="mt-2 text-slate-400">{task.description}</p>
                  </div>
                  <span className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">{Number(task.rewardAmount).toLocaleString()} coins</span>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={async () => {
                      if (!user) return
                      await tasksApi.submit({ userId: user.id, taskId: task.id, proof: 'Submitted via website' })
                      alert('Task submitted for admin review.')
                    }}
                    className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    Submit proof
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
