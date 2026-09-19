import type { InventoryItem, StockState } from "./types";

export const STOCK_LABELS: Record<StockState, string> = {
  apartmentClean: "Čisté v bytě",
  apartmentPrepared: "Připravené na postelích",
  apartmentInUse: "Používané",
  apartmentDirty: "Špinavé v bytě",
  homeClean: "Čisté doma",
  homeDirty: "Špinavé doma",
  inTransit: "V převozu",
  unusable: "Nepoužitelné",
  unassigned: "Nezařazené",
};

export const STOCK_STATES = Object.keys(STOCK_LABELS) as StockState[];

export function stockTotal(item: InventoryItem) {
  return STOCK_STATES.reduce((sum, state) => sum + item.stock[state], 0);
}

export function cleanTurns(item: InventoryItem) {
  if (!item.perTurn || item.perTurn <= 0) return null;
  return Math.floor(item.stock.apartmentClean / item.perTurn);
}

export function readiness(items: InventoryItem[]) {
  const required = items.filter((item) => item.perTurn && item.perTurn > 0);
  if (required.some((item) => item.stock.unassigned > 0)) {
    return { kind: "unknown" as const, turns: null, limiter: null };
  }
  const ranked = required
    .map((item) => ({ item, turns: cleanTurns(item) ?? 0 }))
    .sort((a, b) => a.turns - b.turns);
  const first = ranked[0];
  return {
    kind: first && first.turns > 0 ? ("ready" as const) : ("missing" as const),
    turns: first?.turns ?? 0,
    limiter: first?.item ?? null,
  };
}

export function deliveryForTurns(items: InventoryItem[], targetTurns: number) {
  return items
    .filter((item) => item.perTurn && item.perTurn > 0)
    .map((item) => {
      const target = (item.perTurn ?? 0) * targetTurns;
      const fromHome = item.stock.homeClean;
      const missingInApartment = Math.max(0, target - item.stock.apartmentClean);
      return {
        item,
        bring: Math.min(missingInApartment, fromHome),
        buy: Math.max(0, missingInApartment - fromHome),
      };
    })
    .filter(({ bring, buy }) => bring > 0 || buy > 0);
}

