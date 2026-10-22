import React, { Suspense } from "react";
import type { AppId } from "../../lib/os-state";
import { LAZY_APPS } from "./app-components";
import type { AppRuntime } from "./app-types";

interface AppHostProps extends AppRuntime {
  id: AppId;
  name: string;
}

class AppErrorBoundary extends React.Component<
  { appName: string; children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[RadjaOS] app crashed:", this.props.appName, error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-3 text-center p-8">
          <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-400/40 flex items-center justify-center text-red-300 text-lg">
            !
          </div>
          <p className="text-sm text-neutral-200">
            {this.props.appName} stopped unexpectedly.
          </p>
          <p className="text-[11px] text-neutral-500 max-w-sm font-mono break-all">
            {this.state.error.message}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-1 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white transition-colors"
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppSkeleton: React.FC = () => (
  <div className="h-full w-full flex flex-col gap-3 p-4 animate-pulse">
    <div className="h-6 w-40 rounded bg-white/10" />
    <div className="h-24 w-full rounded-lg bg-white/[0.06]" />
    <div className="flex gap-2">
      <div className="h-8 w-24 rounded bg-white/[0.06]" />
      <div className="h-8 w-24 rounded bg-white/[0.06]" />
      <div className="h-8 w-24 rounded bg-white/[0.06]" />
    </div>
    <div className="h-32 w-full rounded-lg bg-white/[0.04]" />
  </div>
);

export const AppHost: React.FC<AppHostProps> = ({ id, name, ...runtime }) => {
  const Lazy = LAZY_APPS[id];
  if (!Lazy) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-neutral-400">
        Application unavailable.
      </div>
    );
  }

  return (
    <AppErrorBoundary appName={name}>
      <Suspense fallback={<AppSkeleton />}>
        <Lazy {...runtime} />
      </Suspense>
    </AppErrorBoundary>
  );
};
