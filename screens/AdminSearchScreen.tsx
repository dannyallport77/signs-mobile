import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  FlatList,
  Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.110:3000/api';

interface Business {
  placeId: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  userRatingsTotal?: number;
  reviewUrl: string;
  mapsUrl: string;
}

export default function AdminSearchScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search Required', 'Please enter a business name or location to search');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      const url = `${API_URL}/places/text-search?query=${encodeURIComponent(searchQuery)}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`Admin search found ${data.data.length} businesses:`, data.data.map((b: Business) => b.name));
        setBusinesses(data.data);
        
        if (data.data.length === 0) {
          Alert.alert('No Results', 'No businesses found. Try a different search term.');
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to search businesses');
      }
    } catch (error) {
      console.error('Admin search error:', error);
      Alert.alert('Error', 'Failed to search businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBusiness = (business: Business) => {
    navigation.navigate('BusinessInfo', { business });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Business Search</Text>
        <Text style={styles.headerSubtitle}>Search any business worldwide</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search business name or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          blurOnSubmit={true}
          autoCorrect={false}
        />
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {businesses.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsCount}>
            {businesses.length} business{businesses.length !== 1 ? 'es' : ''} found
          </Text>
          <FlatList
            data={businesses}
            keyExtractor={(item) => item.placeId}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.businessItem}
                onPress={() => handleSelectBusiness(item)}
              >
                <View style={styles.businessContent}>
                  <Text style={styles.businessName}>{item.name}</Text>
                  <Text style={styles.businessAddress} numberOfLines={2}>
                    {item.address}
                  </Text>
                  {item.rating && (
                    <Text style={styles.businessRating}>
                      ⭐ {item.rating} ({item.userRatingsTotal || 0} reviews)
                    </Text>
                  )}
                </View>
                <Text style={styles.selectButton}>Select →</Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={true}
          />
        </View>
      )}

      {!loading && businesses.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔍</Text>
          <Text style={styles.emptyStateTitle}>Global Business Search</Text>
          <Text style={styles.emptyStateText}>
            Enter a business name or location to search anywhere in the world.
            Perfect for programming tags for online orders.
          </Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Searching businesses...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4f46e5',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resultsCount: {
    padding: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  businessItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  businessContent: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  businessAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  businessRating: {
    fontSize: 12,
    color: '#9ca3af',
  },
  selectButton: {
    fontSize: 16,
    color: '#4f46e5',
    fontWeight: '600',
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
});
