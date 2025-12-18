import React from 'react'

const ProcessRow = ({
    process: p,
    isSelected,
    onSelect,
    onKill
}) => {
    return (
        <div
            onMouseEnter={onSelect}
            onClick={() => onKill(p.pid)} // Click anywhere triggers confirm
            className={`
            group flex items-center justify-between px-3 py-3 rounded-md cursor-pointer transition-colors
            ${isSelected ? 'bg-[#2C2C2C] text-white' : 'text-gray-400 hover:bg-[#1E1E1E]'}
        `}
        >
            {/* Left: Indicator + Name */}
            <div className="flex items-center gap-4">
                <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-transparent'}`}></div>

                <div className="flex flex-col">
                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {p.processName}
                    </span>
                    <span className="text-[10px] text-gray-600 font-mono flex items-center gap-2">
                        PID {p.pid}
                    </span>
                </div>
            </div>

            {/* Right: Port + Kill Button */}
            <div className="flex items-center gap-3">
                {/* Port Badge */}
                <div className={`text-xs font-mono px-2 py-0.5 rounded ${isSelected ? 'bg-white/10 text-white' : 'bg-[#1E1E1E] text-gray-500'}`}>
                    :{p.port}
                </div>

                {/* Kill Button - ALWAYS VISIBLE as requested */}
                <button
                    onClick={(e) => {
                        e.stopPropagation() // Prevent row click
                        onKill(p.pid)
                    }}
                    className={`
                    transition-all text-xs font-bold px-3 py-1 rounded
                    ${isSelected
                            ? 'bg-red-500 text-white'
                            : 'bg-[#2C2C2C] text-red-400 hover:bg-red-500 hover:text-white'}
                `}
                    title="Kill Process"
                >
                    Kill
                </button>
            </div>
        </div>
    )
}

export default ProcessRow
