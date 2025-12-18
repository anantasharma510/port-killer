import React, { forwardRef } from 'react'

const SearchBar = forwardRef(({ value, onChange, loading, disabled }, ref) => {
    return (
        <div className="p-4 border-b border-white/10 flex items-center gap-3 shrink-0">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
                ref={ref}
                type="text"
                className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-gray-600 focus:ring-0 disabled:opacity-50"
                placeholder="Search processes..."
                value={value}
                onChange={onChange}
                autoFocus
                disabled={disabled}
            />
            {loading && (
                <div className="w-4 h-4 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
            )}
        </div>
    )
})

export default SearchBar
