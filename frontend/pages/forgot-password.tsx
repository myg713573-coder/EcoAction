import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-16 px-6 text-slate-100 sm:px-10">
      <div className="mx-auto max-w-md rounded-3xl bg-slate-900/90 p-10 shadow-soft ring-1 ring-slate-800">
        <h1 className="text-3xl font-semibold text-white">Forgot Password</h1>
        <p className="mt-3 text-slate-400">Enter your email and we’ll send you a reset link.</p>
        <form className="mt-8 space-y-6">
          <label className="block space-y-2 text-sm text-slate-300">
            <span>Email</span>
            <input type="email" className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400" />
          </label>
          <button type="submit" className="w-full rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Send reset link
          </button>
          <p className="text-center text-sm text-slate-400">
            Back to <Link href="/login" className="text-cyan-300 hover:text-cyan-200">Login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
