interface CostConfiguration {
  storageCost: number;
  obsolescenceCost: number;
  lostSales: number;
  expeditedShipping: number;
  productionDelays: number;
}

export const getCostConfiguration = (): CostConfiguration | null => {
  try {
    const savedData = localStorage.getItem("costConfiguration");
    if (savedData) {
      return JSON.parse(savedData);
    }
    return null;
  } catch (error) {
    console.error(
      "Error retrieving cost configuration from localStorage:",
      error
    );
    return null;
  }
};

export const saveCostConfiguration = (config: CostConfiguration): void => {
  try {
    localStorage.setItem("costConfiguration", JSON.stringify(config));
  } catch (error) {
    console.error("Error saving cost configuration to localStorage:", error);
  }
};

export const clearCostConfiguration = (): void => {
  try {
    localStorage.removeItem("costConfiguration");
  } catch (error) {
    console.error(
      "Error clearing cost configuration from localStorage:",
      error
    );
  }
};

export type { CostConfiguration };
