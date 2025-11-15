import AsyncStorage from '@react-native-async-storage/async-storage';

type StockRecord = Record<string, number>;
const STOCK_STORAGE_KEY = 'sign_stock_levels';

export const stockService = {
  async getStockLevels(): Promise<StockRecord> {
    const data = await AsyncStorage.getItem(STOCK_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  async adjust(productId: string, delta: number): Promise<number> {
    const current = await this.getStockLevels();
    const existing = current[productId] ?? 20;
    const updated = Math.max(0, existing + delta);
    current[productId] = updated;
    await AsyncStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(current));
    return updated;
  },
};
