import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocialMediaLinks } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.110:3000/api';

export const socialMediaService = {
  async getSocialMediaLinks(
    businessName: string, 
    address: string, 
    placeId?: string,
    verify: boolean = false
  ): Promise<SocialMediaLinks> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const params = new URLSearchParams({
        businessName,
        address,
        verify: verify.toString()
      });
      
      if (placeId) {
        params.append('placeId', placeId);
      }
      
      const response = await fetch(`${API_URL}/places/social-media?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch social media links');
      }

      console.log('Social media API response:', data);
      return data.data || {};
    } catch (error) {
      console.error('Social media fetch error:', error);
      return {};
    }
  }
};
