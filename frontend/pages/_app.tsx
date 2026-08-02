import type { AppProps } from 'next/app'
import '../src/styles/globals.css'
import { AuthProvider } from '../src/context/AuthContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
