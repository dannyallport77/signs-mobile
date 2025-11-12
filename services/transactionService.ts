import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, TransactionFilters } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.110:3000/api';

export const transactionService = {
  async create(transaction: Partial<Transaction>): Promise<Transaction> {
    const token = await AsyncStorage.getItem('authToken');
    const user = await AsyncStorage.getItem('user');
    const userData = user ? JSON.parse(user) : null;

    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...transaction,
        userId: userData?.id
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create transaction');
    }

    return data.data;
  },

  async update(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update transaction');
    }

    return data.data;
  },

  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
    const token = await AsyncStorage.getItem('authToken');
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${API_URL}/transactions?${queryParams.toString()}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch transactions');
    }

    return data.data;
  },

  async markAsSuccess(id: string, salePrice: number, notes?: string): Promise<Transaction> {
    return this.update(id, {
      status: 'success',
      salePrice,
      notes
    });
  },

  async markAsFailed(id: string, notes?: string): Promise<Transaction> {
    return this.update(id, {
      status: 'failed',
      notes
    });
  },

  async markAsErased(id: string): Promise<Transaction> {
    return this.update(id, {
      status: 'erased',
      erasedAt: new Date().toISOString()
    });
  }
};
