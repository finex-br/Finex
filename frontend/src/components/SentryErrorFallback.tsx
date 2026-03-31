interface ErrorFallbackProps {
  error: unknown;
  componentStack: string;
  eventId: string;
  resetError: () => void;
}

export function SentryErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Algo deu errado
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ocorreu um erro inesperado. Nossa equipe foi notificada automaticamente.
        </p>
        <pre className="mt-4 max-h-32 overflow-auto rounded bg-muted p-3 text-left text-xs text-muted-foreground">
          {message}
        </pre>
        <button
          onClick={resetError}
          className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
