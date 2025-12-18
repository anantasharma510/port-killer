import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center">
                    <h1 className="text-xl font-bold bg-red-600 px-4 py-2 rounded mb-4">Criticial Error</h1>
                    <p className="text-gray-400 mb-6 max-w-lg font-mono text-xs text-left bg-gray-900 p-4 rounded border border-gray-800">
                        {this.state.error?.toString()}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                    >
                        Reload App
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
