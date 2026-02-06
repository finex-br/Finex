import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { useVendingMachineMetrics } from "./useVendingMachineMetrics";
import { vendingMachineService } from "@/services/vendingMachineService";

vi.mock("@/services/vendingMachineService", () => ({
  vendingMachineService: {
    getVendingMachineMetrics: vi.fn(),
  },
}));

describe("useVendingMachineMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve iniciar com estado vazio", () => {
    const { result } = renderHook(() => useVendingMachineMetrics());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("deve buscar metricas com sucesso", async () => {
    const mockData = {
      salesByMachine: [],
      productMix: [],
      hardwareHealth: [],
      averageTicketTrend: [],
      summary: {
        totalMachines: 0,
        totalSales: 0,
        totalRevenue: 0,
        averageTicket: 0,
        healthyMachines: 0,
        warningMachines: 0,
        criticalMachines: 0,
      },
    };

    vi.mocked(vendingMachineService.getVendingMachineMetrics).mockResolvedValue(mockData);
    const { result } = renderHook(() => useVendingMachineMetrics());

    await act(async () => {
      await result.current.fetchVendingMetrics();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
