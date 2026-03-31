import { cn } from "@/lib/utils";

interface BrowserMockupProps {
  children?: React.ReactNode;
  className?: string;
  url?: string;
}

export function BrowserMockup({
  children,
  className,
  url = "app.finex.com.br/dashboard",
}: BrowserMockupProps) {
  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden shadow-2xl border border-border/50",
        "bg-card",
        className
      )}
    >
      {/* Browser chrome bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <div className="w-3 h-3 rounded-full bg-green-400/80" />
        </div>

        {/* URL bar */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 px-3 py-1 bg-background/80 rounded-md text-xs text-muted-foreground max-w-md w-full justify-center">
            <svg
              className="w-3 h-3 text-muted-foreground/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>{url}</span>
          </div>
        </div>

        {/* Spacer to balance the traffic lights */}
        <div className="w-[52px]" />
      </div>

      {/* Content area */}
      <div className="relative aspect-[16/10] bg-background overflow-hidden">
        {children || (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground/40">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary/40">F</span>
            </div>
            <p className="text-sm">Screenshot do dashboard</p>
          </div>
        )}
      </div>
    </div>
  );
}
