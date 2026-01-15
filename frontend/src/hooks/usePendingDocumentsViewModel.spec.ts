/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { usePendingDocumentsViewModel } from './usePendingDocumentsViewModel';
import { pendingDocumentsService } from '@/services/pendingDocumentsService';

vi.mock('@/services/pendingDocumentsService', () => ({
  pendingDocumentsService: {
    list: vi.fn(),
  },
}));

describe('usePendingDocumentsViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve iniciar com estado vazio', () => {
    const { result } = renderHook(() => usePendingDocumentsViewModel());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.documents).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('deve buscar lista com sucesso', async () => {
    vi.mocked(pendingDocumentsService.list).mockResolvedValueOnce({
      success: true,
      total: 1,
      documents: [
        {
          id: 'doc-1',
          fileName: 'file.xlsx',
          fileSize: 123,
          status: 'UPLOADED',
          totalRows: 10,
          hasMapping: false,
          hasValidation: false,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          uploadedBy: 'user-1',
        },
      ],
    });

    const { result } = renderHook(() => usePendingDocumentsViewModel());

    await act(async () => {
      await result.current.fetchPendingDocuments();
    });

    expect(pendingDocumentsService.list).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.total).toBe(1);
      expect(result.current.documents).toHaveLength(1);
    });
  });

  it('deve capturar erro e manter lista vazia', async () => {
    vi.mocked(pendingDocumentsService.list).mockRejectedValueOnce({
      response: { data: { message: 'Erro ao listar' } },
    });

    const { result } = renderHook(() => usePendingDocumentsViewModel());

    await act(async () => {
      await result.current.fetchPendingDocuments();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toContain('Erro ao listar');
      expect(result.current.documents).toEqual([]);
      expect(result.current.total).toBe(0);
    });
  });
});
