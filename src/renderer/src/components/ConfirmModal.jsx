import React from 'react'

const ConfirmModal = ({ process, pid, onConfirm, onCancel }) => {
    if (!process) return null;

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-[#1E1E1E] border border-white/10 p-6 rounded-lg shadow-2xl max-w-sm w-full mx-4">
                <h3 className="text-lg font-bold text-white mb-2">Kill Process?</h3>
                <p className="text-gray-400 text-sm mb-6">
                    Are you sure you want to terminate <span className="text-white font-mono">{process.processName}</span> (PID: {pid}) running on port <span className="text-white font-mono">{process.port}</span>?
                </p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-gray-300 hover:text-white rounded hover:bg-white/5 transition-colors"
                    >
                        Cancel (Esc)
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded font-medium transition-colors shadow-lg shadow-red-900/20"
                    >
                        Kill Process (Enter)
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal
