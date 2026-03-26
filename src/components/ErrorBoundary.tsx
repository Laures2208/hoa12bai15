import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Có lỗi xảy ra</h2>
          <p className="text-slate-400">Không thể tải phần này. Vui lòng thử lại sau.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
