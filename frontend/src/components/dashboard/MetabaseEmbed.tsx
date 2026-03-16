import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardService } from '@/services/dashboardService';

interface MetabaseEmbedProps {
  finexDashboardId: string;
  companyId: string;
}

export function MetabaseEmbed({
  finexDashboardId,
  companyId,
}: MetabaseEmbedProps): React.ReactElement {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEmbed() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await dashboardService.getMetabaseToken(
          finexDashboardId,
          companyId,
        );
        if (cancelled) return;

        const url = `${result.siteUrl}/embed/dashboard/${result.token}#bordered=false&titled=false`;
        setIframeUrl(url);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || 'Erro ao carregar dashboard');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadEmbed();
    return () => { cancelled = true; };
  }, [finexDashboardId, companyId]);

  if (isLoading) {
    return (
      <Skeleton
        style={{ width: '100%', height: 'calc(100vh - 180px)', minHeight: 600 }}
        className="rounded-lg"
      />
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center gap-3 pt-6 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100vh - 180px)',
        minHeight: 600,
      }}
    >
      <iframe
        src={iframeUrl ?? ''}
        frameBorder={0}
        width="100%"
        height="100%"
        allowTransparency
        title="Metabase Dashboard"
      />
    </div>
  );
}
