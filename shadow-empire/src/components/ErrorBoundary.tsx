import { Component, type ReactNode } from "react";

class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message || String(error) };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="animate-fade-in space-y-4">
          <div className="mafia-card rounded-xl p-6 text-center space-y-3">
            <div className="text-3xl">⚠️</div>
            <div className="text-sm font-bold text-red-400">Page Error</div>
            <div className="text-xs text-muted-foreground max-h-40 overflow-auto">{this.state.error}</div>
            <button onClick={() => { this.setState({ hasError: false, error: "" }); window.location.reload(); }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs">Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export { ErrorBoundary };
