import React from 'react'

const Footer = ({ count, loading, devOnly, onToggleDev, onRefresh }) => {
    return (
        <div className="border-t border-white/5 bg-[#141414] px-4 py-2 flex items-center justify-between text-[10px] text-gray-500 font-medium select-none shrink-0">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                    {loading ? 'Scanning...' : `${count} Processes`}

                    <button
                        onClick={onRefresh}
                        className="ml-2 hover:text-white transition-colors"
                        title="Refresh Ports (F5)"
                    >
                        🔄
                    </button>
                </div>

                {/* Branding */}
                <div className="h-3 w-px bg-white/10"></div>
                <div className="flex gap-2">
                    <a href="https://www.anantasharma.com.np/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                        anantasharma.com.np
                    </a>
                    <span className="text-gray-700">|</span>
                    <a href="https://github.com/anantasharma510" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                        GitHub
                    </a>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Shortcuts */}
                <div className="flex items-center gap-1">
                    <span className="bg-[#2C2C2C] px-1 rounded text-gray-300">↑</span>
                    <span className="bg-[#2C2C2C] px-1 rounded text-gray-300">↓</span>
                    <span className="hidden sm:inline">Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="bg-[#2C2C2C] px-1 rounded text-gray-300">↵</span>
                    <span className="hidden sm:inline">Select</span>
                </div>
                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-300" onClick={onToggleDev}>
                    <span className={`bg-[#2C2C2C] px-1 rounded ${devOnly ? 'text-blue-400' : 'text-gray-500'}`}>D</span>
                    <span>Dev: {devOnly ? 'ON' : 'OFF'}</span>
                </div>

                {/* Restart Admin */}
                <div className="h-3 w-px bg-white/10 mx-1"></div>
                <div className="flex items-center gap-1 cursor-pointer text-red-500 hover:text-red-400 transition-colors" title="Restart as Administrator" onClick={() => window.api.restartAsAdmin?.()}>
                    <span className="bg-red-500/10 px-1 rounded text-[9px]">⚡</span>
                    <span className="hidden sm:inline">Admin</span>
                </div>
            </div>
        </div>
    )
}

export default Footer
