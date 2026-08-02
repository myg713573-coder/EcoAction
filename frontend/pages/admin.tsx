import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi } from '../src/api'
import { useAuth } from '../src/context/AuthContext'

type AdminStats = {
  users: number
  tasks: number
  pendingSubmissions: number
  pendingWithdrawals: number
  banners: number
}

type AdminUser = {
  id: string
  email: string
  username: string
  role: string
  coins: string
  cashBalance: string
}

type AdminWithdrawal = {
  id: string
  amount: string
  status: string
  adminNote?: string
  user: { id: string; email: string }
}

type AdminBanner = {
  id: string
  title: string
  description: string
  buttonText: string
  link: string
  background: string
  priority: number
  isActive: boolean
}

type AdminSubmission = {
  id: string
  proof: string
  status: string
  adminNote?: string
  createdAt: string
  user: { id: string; username: string; email: string }
  task: { id: string; title: string; rewardAmount: string }
}

type AdminTask = {
  id: string
  title: string
  description: string
  rewardAmount: string
  proofType: 'SCREENSHOT' | 'LINK' | 'TEXT' | 'VIDEO'
  maxParticipants: number
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
}

type AdminTaskForm = {
  title: string
  description: string
  rewardAmount: number
  proofType: 'SCREENSHOT' | 'LINK' | 'TEXT' | 'VIDEO'
  maxParticipants: number
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
}

export default function AdminPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([])
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([])
  const [banners, setBanners] = useState<AdminBanner[]>([])
  const [tasks, setTasks] = useState<AdminTask[]>([])
  const [bannerForm, setBannerForm] = useState<Partial<AdminBanner>>({ title: '', description: '', buttonText: '', link: '', background: '#0f172a', priority: 0, isActive: true })
  const [taskForm, setTaskForm] = useState<AdminTaskForm>({ title: '', description: '', rewardAmount: 0, proofType: 'SCREENSHOT', maxParticipants: 100, status: 'ACTIVE' })
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})
  const [withdrawalNotes, setWithdrawalNotes] = useState<Record<string, string>>({})
  const [balanceAdjustments, setBalanceAdjustments] = useState<Record<string, { coins: string; cashBalance: string }>>({})

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return

    async function loadAdmin() {
      const [statsRes, usersRes, withdrawalsRes, submissionsRes, bannersRes, tasksRes] = await Promise.all([
        adminApi.stats(),
        adminApi.users(),
        adminApi.withdrawals(),
        adminApi.taskSubmissions(),
        adminApi.banners(),
        adminApi.tasks(),
      ])

      setStats(statsRes.data)
      setUsers(usersRes.data)
      setWithdrawals(withdrawalsRes.data)
      setSubmissions(submissionsRes.data)
      setBanners(bannersRes.data)
      setTasks(tasksRes.data)

      const initialAdjustments: Record<string, { coins: string; cashBalance: string }> = {}
      usersRes.data.forEach((userItem: AdminUser) => {
        initialAdjustments[userItem.id] = {
          coins: String(userItem.coins ?? '0'),
          cashBalance: String(userItem.cashBalance ?? '0'),
        }
      })
      setBalanceAdjustments(initialAdjustments)
    }

    loadAdmin()
  }, [user])

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:px-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-slate-900/90 p-10 shadow-soft ring-1 ring-slate-800">
          <h1 className="text-3xl font-semibold text-white">Access denied</h1>
          <p className="mt-4 text-slate-400">This page is only available to admin users.</p>
          <Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  async function refreshAdminData() {
    const [statsRes, usersRes, withdrawalsRes, submissionsRes, bannersRes, tasksRes] = await Promise.all([
      adminApi.stats(),
      adminApi.users(),
      adminApi.withdrawals(),
      adminApi.taskSubmissions(),
      adminApi.banners(),
      adminApi.tasks(),
    ])
    setStats(statsRes.data)
    setUsers(usersRes.data)
    setWithdrawals(withdrawalsRes.data)
    setSubmissions(submissionsRes.data)
    setBanners(bannersRes.data)
    setTasks(tasksRes.data)
  }

  async function handleReviewSubmission(submissionId: string, status: 'APPROVED' | 'REJECTED') {
    await adminApi.reviewTaskSubmission({ submissionId, status, adminNote: reviewNotes[submissionId] })
    setSubmissions((current) => current.filter((submission) => submission.id !== submissionId))
    setStats((prev) => prev ? { ...prev, pendingSubmissions: prev.pendingSubmissions - 1 } : prev)
  }

  async function handleReviewWithdrawal(withdrawalId: string, status: 'APPROVED' | 'REJECTED') {
    await adminApi.reviewWithdrawal({ withdrawalId, status, adminNote: withdrawalNotes[withdrawalId] })
    setWithdrawals((current) => current.filter((withdrawal) => withdrawal.id !== withdrawalId))
    setStats((prev) => prev ? { ...prev, pendingWithdrawals: prev.pendingWithdrawals - 1 } : prev)
  }

  async function handleUserRoleChange(userId: string, role: 'USER' | 'ADMIN' | 'MODERATOR') {
    await adminApi.setUserRole({ userId, role })
    setUsers((current) => current.map((item) => (item.id === userId ? { ...item, role } : item)))
  }

  async function handleAdjustBalance(userId: string) {
    const adjustment = balanceAdjustments[userId]
    if (!adjustment) return
    const coins = Number(adjustment.coins) || 0
    const cashBalance = Number(adjustment.cashBalance) || 0
    await adminApi.adjustUserBalance({ userId, coins, cashBalance })
    setUsers((current) => current.map((item) => (item.id === userId ? { ...item, coins: String(coins), cashBalance: String(cashBalance) } : item)))
  }

  async function handleCreateBanner() {
    if (!bannerForm.title || !bannerForm.description || !bannerForm.buttonText || !bannerForm.link) return
    await adminApi.createBanner({
      title: bannerForm.title,
      description: bannerForm.description,
      buttonText: bannerForm.buttonText,
      link: bannerForm.link,
      background: bannerForm.background,
      priority: bannerForm.priority,
      isActive: bannerForm.isActive,
    })
    setBannerForm({ title: '', description: '', buttonText: '', link: '', background: '#0f172a', priority: 0, isActive: true })
    refreshAdminData()
  }

  async function handleUpdateBanner(bannerId: string, field: keyof AdminBanner, value: string | number | boolean) {
    const banner = banners.find((item) => item.id === bannerId)
    if (!banner) return
    const updated = { ...banner, [field]: value }
    await adminApi.updateBanner({ id: bannerId, data: updated })
    setBanners((current) => current.map((item) => (item.id === bannerId ? updated as AdminBanner : item)))
  }

  async function handleCreateTask() {
    if (!taskForm.title || !taskForm.description || !taskForm.rewardAmount) return
    await adminApi.createTask(taskForm)
    setTaskForm({ title: '', description: '', rewardAmount: 0, proofType: 'SCREENSHOT', maxParticipants: 100, status: 'ACTIVE' })
    refreshAdminData()
  }

  async function handleUpdateTask(taskId: string, field: keyof AdminTask, value: string | number) {
    const task = tasks.find((item) => item.id === taskId)
    if (!task) return
    const data: any = { [field]: field === 'rewardAmount' ? Number(value) : value }
    await adminApi.updateTask({ id: taskId, data })
    setTasks((current) => current.map((item) => (item.id === taskId ? { ...item, [field]: value } as AdminTask : item)))
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-slate-900/90 p-8 shadow-soft ring-1 ring-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Admin Panel</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Website control center</h1>
          </div>
          <Link href="/dashboard" className="inline-flex rounded-full border border-slate-700 bg-slate-950 px-5 py-3 text-sm text-slate-100 transition hover:border-cyan-400">
            Back to dashboard
          </Link>
        </header>

        {stats && (
          <section className="grid gap-6 lg:grid-cols-5">
            {[
              { label: 'Users', value: stats.users },
              { label: 'Tasks', value: stats.tasks },
              { label: 'Pending submissions', value: stats.pendingSubmissions },
              { label: 'Pending withdrawals', value: stats.pendingWithdrawals },
              { label: 'Active banners', value: stats.banners },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl bg-slate-900/80 p-6 shadow-soft ring-1 ring-slate-800">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </section>
        )}

        <section className="rounded-3xl bg-slate-900/80 p-8 shadow-soft ring-1 ring-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">Task management</h2>
            <button
              type="button"
              className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              onClick={refreshAdminData}
            >
              Refresh
            </button>
          </div>
          <div className="mt-6 grid gap-6">
            <div className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400">Title</label>
                  <input
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400">Description</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400">Reward Amount</label>
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                    value={taskForm.rewardAmount}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, rewardAmount: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400">Proof Type</label>
                  <select
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                    value={taskForm.proofType}
                    onChange={(e) => setTaskForm((prev) => ({
                      ...prev,
                      proofType: e.target.value as AdminTaskForm['proofType'],
                    }))}
                  >
                    <option value="SCREENSHOT">Screenshot</option>
                    <option value="LINK">Link</option>
                    <option value="TEXT">Text</option>
                    <option value="VIDEO">Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400">Max participants</label>
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                    value={taskForm.maxParticipants}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, maxParticipants: Number(e.target.value) }))}
                  />
                </div>
                <button
                  type="button"
                  className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                  onClick={handleCreateTask}
                >
                  Create task
                </button>
              </div>
            </div>
            {tasks.length === 0 && <p className="text-slate-400">No tasks available yet.</p>}
            {tasks.map((task) => (
              <div key={task.id} className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 lg:grid-cols-3">
                <div>
                  <p className="text-sm text-slate-400">{task.title}</p>
                  <p className="mt-2 text-white">{task.description}</p>
                </div>
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block text-sm text-slate-400">Reward</label>
                    <input
                      type="number"
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                      value={Number(task.rewardAmount)}
                      onChange={(e) => handleUpdateTask(task.id, 'rewardAmount', Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block text-sm text-slate-400">Proof type</label>
                    <select
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                      value={task.proofType}
                      onChange={(e) => handleUpdateTask(task.id, 'proofType', e.target.value)}
                    >
                      <option value="SCREENSHOT">Screenshot</option>
                      <option value="LINK">Link</option>
                      <option value="TEXT">Text</option>
                      <option value="VIDEO">Video</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block text-sm text-slate-400">Participants</label>
                    <input
                      type="number"
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                      value={task.maxParticipants}
                      onChange={(e) => handleUpdateTask(task.id, 'maxParticipants', Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block text-sm text-slate-400">Status</label>
                    <select
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                      value={task.status}
                      onChange={(e) => handleUpdateTask(task.id, 'status', e.target.value)}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PAUSED">PAUSED</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-slate-900/80 p-8 shadow-soft ring-1 ring-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">Task submissions</h2>
            <button
              type="button"
              className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              onClick={refreshAdminData}
            >
              Refresh
            </button>
          </div>
          <div className="mt-6 space-y-4">
            {submissions.length === 0 && <p className="text-slate-400">No pending submissions.</p>}
            {submissions.map((submission) => (
              <div key={submission.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div>
                    <p className="text-sm text-slate-400">Task</p>
                    <p className="text-lg font-semibold text-white">{submission.task.title}</p>
                    <p className="mt-2 text-sm text-slate-500">Reward: {Number(submission.task.rewardAmount).toLocaleString()} coins</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Submitted by</p>
                    <p className="text-lg font-semibold text-white">{submission.user.username}</p>
                    <p className="mt-2 text-sm text-slate-500">{submission.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Proof</p>
                    <pre className="mt-2 max-h-28 overflow-auto rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-200">{submission.proof}</pre>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <input
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
                    placeholder="Admin note (optional)"
                    value={reviewNotes[submission.id] || ''}
                    onChange={(e) => setReviewNotes((prev) => ({ ...prev, [submission.id]: e.target.value }))}
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                      onClick={() => handleReviewSubmission(submission.id, 'APPROVED')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-rose-400"
                      onClick={() => handleReviewSubmission(submission.id, 'REJECTED')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-slate-900/80 p-8 shadow-soft ring-1 ring-slate-800">
          <h2 className="text-2xl font-semibold text-white">User management</h2>
          <div className="mt-6 space-y-4">
            {users.map((userItem) => (
              <div key={userItem.id} className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-5 lg:grid-cols-[1.5fr_1fr_1fr]">
                <div>
                  <p className="text-sm text-slate-400">{userItem.email}</p>
                  <p className="text-lg font-semibold text-white">{userItem.username}</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm text-slate-400">Role</label>
                  <select
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                    value={userItem.role}
                    onChange={(e) => handleUserRoleChange(userItem.id, e.target.value as 'USER' | 'ADMIN' | 'MODERATOR')}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MODERATOR">MODERATOR</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block text-sm text-slate-400">Coins</label>
                    <input
                      type="number"
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                      value={balanceAdjustments[userItem.id]?.coins ?? String(userItem.coins)}
                      onChange={(e) =>
                        setBalanceAdjustments((prev) => ({
                          ...prev,
                          [userItem.id]: {
                            coins: e.target.value,
                            cashBalance: prev[userItem.id]?.cashBalance ?? String(userItem.cashBalance),
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block text-sm text-slate-400">Cash</label>
                    <input
                      type="number"
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                      value={balanceAdjustments[userItem.id]?.cashBalance ?? String(userItem.cashBalance)}
                      onChange={(e) =>
                        setBalanceAdjustments((prev) => ({
                          ...prev,
                          [userItem.id]: {
                            coins: prev[userItem.id]?.coins ?? String(userItem.coins),
                            cashBalance: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                    onClick={() => handleAdjustBalance(userItem.id)}
                  >
                    Save balance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-slate-900/80 p-8 shadow-soft ring-1 ring-slate-800">
          <h2 className="text-2xl font-semibold text-white">Withdrawals</h2>
          <div className="mt-6 space-y-4">
            {withdrawals.length === 0 && <p className="text-slate-400">No withdrawals awaiting approval.</p>}
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div>
                    <p className="text-sm text-slate-400">User</p>
                    <p className="text-lg font-semibold text-white">{withdrawal.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Amount</p>
                    <p className="text-lg font-semibold text-white">${Number(withdrawal.amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Status</p>
                    <p className="rounded-full bg-slate-800 px-4 py-2 text-sm text-cyan-300">{withdrawal.status}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <input
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                    placeholder="Admin note (optional)"
                    value={withdrawalNotes[withdrawal.id] || ''}
                    onChange={(e) => setWithdrawalNotes((prev) => ({ ...prev, [withdrawal.id]: e.target.value }))}
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                      onClick={() => handleReviewWithdrawal(withdrawal.id, 'APPROVED')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-rose-400"
                      onClick={() => handleReviewWithdrawal(withdrawal.id, 'REJECTED')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-slate-900/80 p-8 shadow-soft ring-1 ring-slate-800">
          <h2 className="text-2xl font-semibold text-white">Banners</h2>
          <div className="mt-6 grid gap-6">
            <div className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400">Title</label>
                  <input
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                    value={bannerForm.title || ''}
                    onChange={(e) => setBannerForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400">Description</label>
                  <input
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                    value={bannerForm.description || ''}
                    onChange={(e) => setBannerForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400">Button text</label>
                  <input
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                    value={bannerForm.buttonText || ''}
                    onChange={(e) => setBannerForm((prev) => ({ ...prev, buttonText: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400">Link</label>
                  <input
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                    value={bannerForm.link || ''}
                    onChange={(e) => setBannerForm((prev) => ({ ...prev, link: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400">Background</label>
                  <input
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                    value={bannerForm.background || ''}
                    onChange={(e) => setBannerForm((prev) => ({ ...prev, background: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400">Priority</label>
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                    value={bannerForm.priority ?? 0}
                    onChange={(e) => setBannerForm((prev) => ({ ...prev, priority: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="bannerActive"
                    type="checkbox"
                    checked={bannerForm.isActive ?? true}
                    onChange={(e) => setBannerForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-500"
                  />
                  <label htmlFor="bannerActive" className="text-sm text-slate-400">
                    Active
                  </label>
                </div>
                <button
                  type="button"
                  className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                  onClick={handleCreateBanner}
                >
                  Add banner
                </button>
              </div>
            </div>
            {banners.map((banner) => (
              <div key={banner.id} className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 lg:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">{banner.title}</p>
                  <p className="mt-2 text-white">{banner.description}</p>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block text-sm text-slate-400">Priority</label>
                    <input
                      type="number"
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none"
                      value={banner.priority}
                      onChange={(e) => handleUpdateBanner(banner.id, 'priority', Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id={`active-${banner.id}`}
                      type="checkbox"
                      checked={banner.isActive}
                      onChange={(e) => handleUpdateBanner(banner.id, 'isActive', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-500"
                    />
                    <label htmlFor={`active-${banner.id}`} className="text-sm text-slate-400">
                      Active
                    </label>
                  </div>
                  <button
                    type="button"
                    className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                    onClick={() => handleUpdateBanner(banner.id, 'title', banner.title)}
                  >
                    Save banner
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
