import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { productService } from '../services/productService';
import { Product, ProductVariant } from '../types';

interface ProductSelectionScreenProps {
  navigation: any;
  route: any;
}

export default function ProductSelectionScreen({ navigation, route }: ProductSelectionScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { business, platformKey, platformLabel, reviewUrl, linkDescription } = route?.params || {};

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const catalog = await productService.fetchProducts();
      setProducts(catalog);
      if (catalog.length > 0) {
        setSelectedProduct(catalog[0]);
        setSelectedVariant(catalog[0].variants[0]);
      } else {
        setError('No products are currently available. Please add products in the admin panel.');
      }
    } catch (err: any) {
      console.error('Product loading error:', err);
      setError(err.message || 'Unable to load products. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSelectedVariant(product.variants[0]);
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  const handleContinue = () => {
    if (!selectedProduct || !selectedVariant) {
      Alert.alert('Select product', 'Choose a product and variant to continue');
      return;
    }

    navigation.navigate('NFCAction', {
      business,
      platformKey,
      platformLabel,
      reviewUrl,
      linkDescription,
      product: selectedProduct,
      variant: selectedVariant,
    });
  };

  const renderVariant = (variant: ProductVariant) => {
    const isSelected = selectedVariant?.id === variant.id;
    return (
      <TouchableOpacity
        key={variant.id}
        style={[styles.variantChip, isSelected && styles.variantChipSelected]}
        onPress={() => handleVariantSelect(variant)}
      >
        <Text style={[styles.variantLabel, isSelected && styles.variantLabelSelected]}>
          {variant.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const isSelected = selectedProduct?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.productCard, isSelected && styles.productCardSelected]}
        onPress={() => handleProductSelect(item)}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        ) : (
          <View style={styles.productImagePlaceholder} />
        )}
        <View style={styles.productText}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.productPrice}>From £{item.basePrice.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading sign catalog...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadProducts}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.arrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Choose a product</Text>
          <Text style={styles.subtitle}>{platformLabel} • {linkDescription}</Text>
        </View>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      {selectedProduct && (
        <View style={styles.variantContainer}>
          <Text style={styles.variantTitle}>Variants</Text>
          <View style={styles.variantRow}>{selectedProduct.variants.map(renderVariant)}</View>
        </View>
      )}

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Program {selectedProduct?.name || 'a sign'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  arrow: {
    fontSize: 20,
    marginRight: 12,
    color: '#4f46e5',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  productCardSelected: {
    borderColor: '#4f46e5',
  },
  productImage: {
    width: 100,
    height: 100,
  },
  productImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#f3f4f6',
  },
  productText: {
    flex: 1,
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  productDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
    marginTop: 8,
  },
  variantContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  variantTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  variantRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  variantChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    marginBottom: 8,
  },
  variantChipSelected: {
    backgroundColor: '#4f46e5',
  },
  variantLabel: {
    fontSize: 12,
    color: '#1f2937',
  },
  variantLabelSelected: {
    color: '#fff',
  },
  continueButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
