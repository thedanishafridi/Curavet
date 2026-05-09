import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Navbar } from './Navbar';
import { AlertCircle, Home, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 border border-gray-100 p-12 max-w-md w-full text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-red-50/50">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Something went wrong</h1>
              <p className="text-gray-500 font-medium leading-relaxed mb-10">
                We encountered an unexpected error. Don't worry, your data is safe. Try refreshing the page or going back home.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white font-black px-8 py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200/50"
                >
                  <RefreshCcw size={18} />
                  Refresh Page
                </button>
                <a
                  href="/"
                  className="flex items-center justify-center gap-2 w-full bg-gray-50 text-gray-600 font-black px-8 py-4 rounded-2xl hover:bg-gray-100 transition-all border border-gray-200"
                >
                  <Home size={18} />
                  Back to Home
                </a>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 pt-8 border-t border-gray-100 text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Error Details</p>
                  <div className="bg-gray-50 rounded-xl p-4 overflow-auto max-h-32">
                    <code className="text-[10px] text-red-500 font-mono">
                      {this.state.error?.toString()}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
