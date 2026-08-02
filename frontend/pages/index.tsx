import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { bannersApi } from '../src/api'

type Banner = {
  id: string
  title: string
  description: string
  buttonText: string
  link: string
}

const stats = [
  { label: 'Total Users', value: '48.2K' },
  { label: 'Tasks Completed', value: '178K' },
  { label: 'Total Withdrawals', value: '12.4K' },
  { label: 'Online Users', value: '1.2K' },
  { label: 'Total Paid', value: '$305K' },
]

const defaultBanners = [
  {
    id: 'default-1',
    title: 'Earn coins by completing premium tasks',
    description: 'Rewarded tasks with admin verification for every payout.',
    buttonText: 'Get Started',
    link: '/register',
  },
  {
    id: 'default-2',
    title: 'Admin-approved withdrawals only',
    description: 'Every reward and withdraw request is reviewed before payment.',
    buttonText: 'Learn More',
    link: '/login',
  },
]

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>(defaultBanners)

  useEffect(() => {
    async function fetchBanners() {
      try {
        const response = await bannersApi.active()
        setBanners(response.data)
      } catch {
        setBanners(defaultBanners)
      }
    }
    fetchBanners()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-semibold">EcoAction</div>
          <div className="flex items-center gap-4 text-sm text-slate-300">
            <Link href="/login" className="rounded-full border border-slate-700 px-4 py-2 transition hover:border-slate-500">
              Login
            </Link>
            <Link href="/register" className="rounded-full bg-cyan-500 px-4 py-2 text-slate-950 transition hover:bg-cyan-400">
              Register
            </Link>
          </div>
        </div>

        <main className="grid gap-12 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <section className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Earn money online</p>
              <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
                Earn Money Online by Completing Tasks and Playing Games
              </h1>
              <p className="max-w-2xl text-slate-300">
                Join thousands of users earning daily from simple online activities while every payout is protected by admin review.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                Register
              </Link>
              <Link href="/login" className="rounded-full border border-slate-700 px-6 py-3 text-sm text-slate-100 transition hover:border-slate-500">
                Login
              </Link>
            </div>
          </section>

          <section className="space-y-6 rounded-3xl bg-slate-900/70 p-8 shadow-soft ring-1 ring-slate-800">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Live platform stats</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl bg-slate-950/50 p-5">
                    <p className="text-3xl font-semibold text-white">{stat.value}</p>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-8">
            <div className="rounded-3xl bg-slate-900/80 p-8 shadow-soft ring-1 ring-slate-800">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">How it works</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">Simple steps to start earning</h2>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {['Register', 'Complete Tasks', 'Earn Coins', 'Withdraw Money'].map((step, index) => (
                  <div key={step} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
                    <p className="text-sm text-cyan-300">Step {index + 1}</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{step}</h3>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900/80 p-8 shadow-soft ring-1 ring-slate-800">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Featured games</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Play and earn rewards</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {['2048', 'Snake', 'Bubble Shooter', 'Memory Match', 'Quiz', 'Word Search'].map((game) => (
                  <div key={game} className="rounded-3xl bg-slate-950/60 p-5 text-white">
                    {game}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-slate-900/80 p-8 shadow-soft ring-1 ring-slate-800">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Banner highlights</p>
              <div className="mt-6 space-y-4">
                {banners.map((banner) => (
                  <motion.div key={banner.title} whileHover={{ y: -2 }} className="group rounded-3xl border border-slate-800 bg-slate-950/70 p-6 transition">
                    <p className="text-xl font-semibold text-white">{banner.title}</p>
                    <p className="mt-3 text-slate-400">{banner.description}</p>
                    <Link href={banner.link} className="mt-6 inline-flex rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition group-hover:bg-cyan-400">
                      {banner.buttonText}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900/80 p-8 shadow-soft ring-1 ring-slate-800">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">FAQ</p>
              <div className="mt-6 space-y-4">
                {['How do I earn?', 'How long do withdrawals take?', 'What is the minimum withdrawal?', 'How do referrals work?'].map((faq) => (
                  <div key={faq} className="rounded-3xl bg-slate-950/60 p-4 text-slate-300">
                    <p>{faq}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950/95 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-sm text-slate-500 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
          <p>© 2026 EcoAction. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="#" className="hover:text-cyan-300">Privacy Policy</Link>
            <Link href="#" className="hover:text-cyan-300">Terms</Link>
            <Link href="#" className="hover:text-cyan-300">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
