export interface OptimizationParams {
  selectedComponents: string[];
  optimizationHorizon: number;
  maxWarehouseCapacity?: number;
  budgetLimit?: number;
  minSafetyStock: number;
}
