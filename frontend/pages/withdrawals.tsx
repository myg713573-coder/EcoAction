import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../src/context/AuthContext'
import { withdrawalsApi } from '../src/api'

export default function WithdrawalsPage() {
  const { user } = useAuth()
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('Bank Transfer')
  const [details, setDetails] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return
    try {
      await withdrawalsApi.request({
        userId: user.id,
        amount: Number(amount),
        paymentMethod: method,
        paymentDetails: details,
      })
      setMessage('Withdrawal request sent. Admin review pending.')
    } catch {
      setMessage('Unable to submit withdrawal request.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-slate-900/90 p-8 shadow-soft ring-1 ring-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Withdrawals</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Request a payout</h1>
          </div>
          <Link href="/dashboard" className="inline-flex rounded-full border border-slate-700 bg-slate-950 px-5 py-3 text-sm text-slate-100 transition hover:border-cyan-400">
            Back to dashboard
          </Link>
        </header>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-slate-900/90 p-8 shadow-soft ring-1 ring-slate-800">
          {message ? <p className="mb-6 text-slate-300">{message}</p> : null}
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm text-slate-300">
              <span>Amount (coins)</span>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                type="number"
                min="0"
                className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              />
            </label>
            <label className="block text-sm text-slate-300">
              <span>Payment method</span>
              <select
                value={method}
                onChange={(event) => setMethod(event.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              >
                <option>Bank Transfer</option>
                <option>Mobile Money</option>
                <option>Cryptocurrency</option>
              </select>
            </label>
          </div>

          <label className="mt-6 block text-sm text-slate-300">
            <span>Payment details</span>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
          </label>

          <button type="submit" className="mt-8 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Submit withdrawal request
          </button>
        </form>
      </div>
    </div>
  )
}
