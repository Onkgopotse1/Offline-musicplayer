import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("ErrorBoundary caught an error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          gap: "1rem",
          color: "#ff4d4f",
        }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Something went wrong.</p>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#aaa" }}>
            {this.state.error?.message}
          </p>
          <button onClick={this.handleReset} style={{
            padding: "0.4rem 1rem",
            borderRadius: "6px",
            border: "1px solid #ff4d4f",
            background: "transparent",
            color: "#ff4d4f",
            cursor: "pointer",
          }}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;