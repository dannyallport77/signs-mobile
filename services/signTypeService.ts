import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignType } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.110:3000/api';

export const signTypeService = {
  async getAll(): Promise<SignType[]> {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/sign-types`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch sign types');
    }

    return data.data;
  },

  async create(signType: Partial<SignType>): Promise<SignType> {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/sign-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(signType)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create sign type');
    }

    return data.data;
  },

  async update(id: string, updates: Partial<SignType>): Promise<SignType> {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/sign-types/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update sign type');
    }

    return data.data;
  },

  async delete(id: string): Promise<void> {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/sign-types/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete sign type');
    }
  }
};
