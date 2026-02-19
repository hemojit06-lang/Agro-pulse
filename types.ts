
export interface FarmFinancials {
  revenue: {
    morningMilk: number;
    eveningMilk: number;
    miscSales: number;
  };
  expenses: {
    feed: number;
    healthcare: number;
    operations: number;
  };
  credit: {
    owed: number;
    collected: number;
  };
}

export interface WeeklyLogEntry {
  id: string;
  timestamp: number;
  rawText: string;
  parsedData: FarmFinancials;
}

export enum AnalysisPhase {
  SNAPSHOT = 'PHASE 1: FINANCIAL SNAPSHOT',
  BREAKDOWN = 'PHASE 2: EXPENSE BREAKDOWN',
  TRENDS = 'PHASE 3: SALES TRENDS'
}
