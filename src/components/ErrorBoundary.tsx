import { Component, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="text-xl font-semibold">Xatolik yuz berdi</h1>
          <p className="text-muted-foreground text-sm">Sahifani yangilab ko'ring.</p>
          <button
            onClick={() => window.location.reload()}
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            Yangilash
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}