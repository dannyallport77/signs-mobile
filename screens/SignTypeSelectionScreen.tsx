import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { signTypeService } from '../services/signTypeService';
import { SignType } from '../types';

interface SignTypeSelectionScreenProps {
  navigation: any;
  route: any;
}

export default function SignTypeSelectionScreen({ navigation, route }: SignTypeSelectionScreenProps) {
  const { business, onSelectSignType } = route.params;
  const [signTypes, setSignTypes] = useState<SignType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<SignType | null>(null);

  useEffect(() => {
    loadSignTypes();
  }, []);

  const loadSignTypes = async () => {
    try {
      setLoading(true);
      const types = await signTypeService.getAll();
      setSignTypes(types.filter(t => t.isActive));
    } catch (error) {
      console.error('Error loading sign types:', error);
      Alert.alert('Error', 'Failed to load sign types');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (signType: SignType) => {
    setSelectedType(signType);
  };

  const handleContinue = () => {
    if (!selectedType) {
      Alert.alert('Please Select', 'Please select a sign type to continue');
      return;
    }

    // Navigate back to BusinessDetail with the selected sign type
    navigation.navigate('BusinessDetail', {
      business,
      selectedSignType: selectedType
    });
  };

  const renderSignType = ({ item }: { item: SignType }) => {
    const isSelected = selectedType?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.signTypeCard, isSelected && styles.selectedCard]}
        onPress={() => handleSelect(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.signTypeName, isSelected && styles.selectedText]}>
            {item.name}
          </Text>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Default Price:</Text>
          <Text style={[styles.price, isSelected && styles.selectedText]}>
            £{item.defaultPrice.toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading sign types...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Sign Type</Text>
        <Text style={styles.subtitle}>
          Choose the type of sign you're programming for {business.name}
        </Text>
      </View>

      <FlatList
        data={signTypes}
        renderItem={renderSignType}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sign types available</Text>
            <Text style={styles.emptySubtext}>Contact your administrator</Text>
          </View>
        }
      />

      {selectedType && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              Continue with {selectedType.name}
            </Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  listContent: {
    padding: 16,
  },
  signTypeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCard: {
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  signTypeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  selectedText: {
    color: '#4f46e5',
  },
  checkmark: {
    fontSize: 24,
    color: '#4f46e5',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  continueButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
