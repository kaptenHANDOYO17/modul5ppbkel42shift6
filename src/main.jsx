import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, persister, CACHE_TIME } from './lib/queryClient'
import { attachCacheDebugger, cacheLog } from './lib/cacheDebug'
import './index.css'
import App from './App.jsx'

attachCacheDebugger(queryClient)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: CACHE_TIME, buster: 'bore-barrel-v1' }}
      onSuccess={() => {
        const n = queryClient.getQueryCache().getAll().filter((q) => q.state.data !== undefined).length
        if (n) cacheLog('RESTORED', 'localStorage', `${n} query dipulihkan dari cache tersimpan`)
      }}
    >
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
)
