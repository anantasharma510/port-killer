import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react'
import SearchBar from './components/SearchBar'
import ProcessRow from './components/ProcessRow'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load the modal (optimization)
const ConfirmModal = React.lazy(() => import('./components/ConfirmModal'))

// Common system processes
const SYSTEM_PROCESSES = [
  'svchost.exe', 'System', 'Idle', 'smss.exe', 'csrss.exe', 'wininit.exe',
  'services.exe', 'lsass.exe', 'winlogon.exe', 'fontdrvhost.exe', 'MsMpEng.exe',
  'NisSrv.exe', 'Memory Compression', 'Registry', 'spoolsv.exe'
]

// Known development processes
const DEV_KEYWORDS = [
  'node', 'python', 'java', 'php', 'httpd', 'apache', 'nginx', 'ruby', 'go',
  'deno', 'bun', 'postgres', 'mysql', 'mariadb', 'redis', 'docker', 'kubernet',
  'electron', 'react-scripts', 'vite', 'uvicorn', 'gunicorn', 'dart', 'flutter'
]

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

function AppContent() {
  const [ports, setPorts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 200) // 200ms debounce

  const [devOnly, setDevOnly] = useState(true)

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [confirmPid, setConfirmPid] = useState(null)

  const listRef = useRef(null)
  const inputRef = useRef(null)

  const fetchPorts = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.api.getPorts()
      setPorts(result)
    } catch (err) {
      console.error(err)
      setError('Failed to load ports')
    } finally {
      setLoading(false)
    }
  }

  const handleKill = async (pid) => {
    try {
      console.log(`[Renderer] Killing PID: ${pid}`);
      // 1. Get Parent PID first (in case we need it)
      const parentPid = await window.api.getParentPid(pid);

      const success = await window.api.killPort(pid)
      console.log(`[Renderer] Kill result: ${success}`);

      if (success) {
        setLoading(true);
        // Wait longer for respawn cycle
        setTimeout(async () => {
          // 2. Re-fetch ports
          const currentPorts = await window.api.getPorts();
          setPorts(currentPorts);
          setLoading(false);

          // 3. Check if the port is still taken (by a NEW pid)
          const originalProcess = ports.find(p => p.pid === pid);
          if (originalProcess) {
            const portNumber = originalProcess.port;
            const newOccupant = currentPorts.find(p => p.port === portNumber);

            if (newOccupant && newOccupant.pid !== pid) {
              // It respawned!
              if (parentPid && parentPid !== '0') {
                // Using a standard confirm for simplicity/reliability
                // In a real app, detecting "Watcher" loop is complex but this is a good heuristic
                if (confirm(`⚠️ The process respawned immediately (PID ${pid} -> ${newOccupant.pid}).\n\nIt is likely controlled by a Watcher (PID ${parentPid}).\n\nDo you want to kill the WATCHER to stop it?`)) {
                  handleKill(parentPid);
                }
              } else {
                setError(`Process respawned with new PID ${newOccupant.pid}.`);
              }
            }
          }
        }, 800);
      }
      setConfirmPid(null)
    } catch (err) {
      console.error(err)
      setConfirmPid(null)

      const msg = err.message || err.toString()
      if (msg.includes('Access is denied')) {
        setError('Permission Denied! You MUST Run as Administrator.')
      } else if (msg.includes('not found')) {
        setError('Process not found (already dead?). Refreshing...')
        fetchPorts()
      } else {
        // Show the real error so we can debug
        setError(`Error: ${msg.substring(0, 60)}...`)
      }

      setTimeout(() => setError(null), 5000)
    }
  }

  useEffect(() => {
    fetchPorts()
    if (inputRef.current) inputRef.current.focus()
  }, [])

  const filteredPorts = useMemo(() => {
    const list = ports.filter(p => {
      const procName = p.processName.toLowerCase()
      // Use debounced value for filtering
      const query = debouncedSearch.toLowerCase()

      if (query) {
        return procName.includes(query) ||
          p.port.toString().includes(query) ||
          p.pid.toString().includes(query)
      }

      if (devOnly) {
        return DEV_KEYWORDS.some(k => procName.includes(k))
      }

      if (SYSTEM_PROCESSES.includes(p.processName)) return false
      if (p.processName === 'Unknown' || p.processName === 'System') return false

      return true
    })
    return list
  }, [ports, debouncedSearch, devOnly])

  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredPorts.length])

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (confirmPid) {
        if (e.key === 'Enter') {
          e.preventDefault()
          handleKill(confirmPid)
        } else if (e.key === 'Escape') {
          e.preventDefault()
          setConfirmPid(null)
          if (inputRef.current) inputRef.current.focus()
        }
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev < filteredPorts.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredPorts[selectedIndex]) {
          setConfirmPid(filteredPorts[selectedIndex].pid)
        }
      } else if (e.key === 'Escape') {
        if (searchQuery) setSearchQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filteredPorts, selectedIndex, searchQuery, confirmPid])

  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex]
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const processToConfirm = ports.find(p => p.pid === confirmPid)

  return (
    <div className="h-screen flex flex-col bg-[#121212] text-gray-200 font-sans selection:bg-gray-700 relative overflow-hidden">

      <SearchBar
        ref={inputRef}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        loading={loading}
        disabled={!!confirmPid}
      />

      {/* Error Toast */}
      {error && (
        <div className="bg-red-900/50 border-l-4 border-red-500 text-red-200 px-4 py-2 mb-2 text-sm mx-2 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white">×</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2" ref={listRef}>
        {filteredPorts.length > 0 ? (
          filteredPorts.map((p, index) => (
            <ProcessRow
              key={`${p.port}-${p.protocol}`}
              process={p}
              isSelected={index === selectedIndex}
              onSelect={() => setSelectedIndex(index)}
              onKill={(pid) => setConfirmPid(pid)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
            <p>No matching processes</p>
          </div>
        )}
      </div>

      <Footer
        count={filteredPorts.length}
        loading={loading}
        devOnly={devOnly}
        onToggleDev={() => setDevOnly(!devOnly)}
        onRefresh={fetchPorts}
      />

      {/* Confirmation Modal - Lazy Loaded */}
      <Suspense fallback={null}>
        {confirmPid && processToConfirm && (
          <ConfirmModal
            process={processToConfirm}
            pid={confirmPid}
            onConfirm={() => handleKill(confirmPid)}
            onCancel={() => setConfirmPid(null)}
          />
        )}
      </Suspense>
    </div>
  )
}

// Wrapper for Error Boundary
export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}
