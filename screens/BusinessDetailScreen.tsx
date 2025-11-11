import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Platform,
  AppState
} from 'react-native';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL - use environment variable or default to network IP
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.110:3000/api';

export default function BusinessDetailScreen({ route, navigation }: any) {
  const { business } = route.params;
  const [writing, setWriting] = useState(false);

  const writeNFC = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'NFC is not supported on web');
      return;
    }

    try {
      // Check if NFC is supported
      const supported = await NfcManager.isSupported();
      if (!supported) {
        Alert.alert('NFC Not Supported', 'Your device does not support NFC');
        return;
      }

      // Check if NFC is enabled
      const enabled = await NfcManager.isEnabled();
      if (!enabled) {
        Alert.alert(
          'NFC Disabled', 
          'Please enable NFC in your device settings',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => NfcManager.goToNfcSetting() }
          ]
        );
        return;
      }

      setWriting(true);

      // Initialize NFC
      await NfcManager.start();

      Alert.alert(
        'Ready to Write',
        'Hold your phone near an NFC tag to write the review link',
        [
          { 
            text: 'Cancel', 
            onPress: async () => {
              await NfcManager.cancelTechnologyRequest();
              setWriting(false);
            },
            style: 'cancel' 
          },
          { 
            text: 'Continue', 
            onPress: async () => {
              try {
                // Request NFC technology
                await NfcManager.requestTechnology(NfcTech.Ndef);

                // Create NDEF message with the review URL
                const bytes = Ndef.encodeMessage([
                  Ndef.uriRecord(business.reviewUrl)
                ]);

                if (bytes) {
                  await NfcManager.ndefHandler.writeNdefMessage(bytes);
                  
                  // Log the NFC tag write
                  await logNFCTag();
                  
                  // Cancel NFC request before showing alert
                  await NfcManager.cancelTechnologyRequest();
                  setWriting(false);
                  
                  // Show success message with test instructions
                  Alert.alert(
                    'Success! 🎉',
                    `NFC tag has been written with review link for ${business.name}\n\nNow tap OK to minimize the app and test the NFC tag by touching it with your phone.`,
                    [
                      {
                        text: 'OK',
                        onPress: () => {
                          // Minimize the app by going to background
                          if (Platform.OS === 'android') {
                            // On Android, we can send the app to background
                            AppState.currentState = 'background';
                          }
                          // Show a secondary alert with instructions
                          setTimeout(() => {
                            Alert.alert(
                              'Test Your NFC Tag',
                              'Touch the NFC tag you just wrote with your phone to test if it opens the review link correctly.\n\nDid the NFC tag work correctly?',
                              [
                                {
                                  text: 'No, it failed',
                                  style: 'cancel',
                                  onPress: () => {
                                    Alert.alert(
                                      'Tag Test Failed',
                                      'Please try writing the tag again or use a different NFC tag.'
                                    );
                                  }
                                },
                                {
                                  text: 'Yes, it works!',
                                  onPress: async () => {
                                    await verifyNFCTag();
                                    Alert.alert(
                                      'Success! ✅',
                                      'Your NFC tag has been verified and recorded in the system.'
                                    );
                                  }
                                }
                              ]
                            );
                          }, 500);
                        }
                      }
                    ]
                  );
                } else {
                  throw new Error('Failed to encode NDEF message');
                }
              } catch (ex) {
                console.error('NFC write error:', ex);
                Alert.alert('Write Failed', 'Failed to write to NFC tag. Please try again.');
                await NfcManager.cancelTechnologyRequest();
                setWriting(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('NFC error:', error);
      Alert.alert('Error', 'Failed to initialize NFC');
      setWriting(false);
    }
  };

  const logNFCTag = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const user = await AsyncStorage.getItem('user');
      const userData = user ? JSON.parse(user) : null;

      await fetch(`${API_URL}/nfc-tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          businessName: business.name,
          businessAddress: business.address,
          placeId: business.placeId,
          reviewUrl: business.reviewUrl,
          latitude: business.location.lat,
          longitude: business.location.lng,
          writtenBy: userData?.email || 'unknown',
          userId: userData?.id  // Add user ID for franchise tracking
        })
      });
    } catch (error) {
      console.error('Failed to log NFC tag:', error);
      // Don't show error to user, just log it
    }
  };

  const verifyNFCTag = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const response = await fetch(`${API_URL}/nfc-tags/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          placeId: business.placeId,
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Failed to verify NFC tag:', data.error);
      }
    } catch (error) {
      console.error('Failed to verify NFC tag:', error);
      // Don't show error to user, just log it
    }
  };

  const openReviewLink = () => {
    Linking.openURL(business.reviewUrl);
  };

  const openMapsLink = () => {
    Linking.openURL(business.mapsUrl);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.businessName}>{business.name}</Text>
        <Text style={styles.address}>{business.address}</Text>
        {business.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {business.rating.toFixed(1)}</Text>
            {business.userRatingsTotal && (
              <Text style={styles.ratingsCount}>({business.userRatingsTotal} reviews)</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📍 Location</Text>
        <Text style={styles.cardText}>
          Lat: {business.location.lat.toFixed(6)}{'\n'}
          Lng: {business.location.lng.toFixed(6)}
        </Text>
        <TouchableOpacity style={styles.linkButton} onPress={openMapsLink}>
          <Text style={styles.linkButtonText}>Open in Google Maps</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⭐ Review Link</Text>
        <Text style={styles.cardText} numberOfLines={2}>
          {business.reviewUrl}
        </Text>
        <TouchableOpacity style={styles.linkButton} onPress={openReviewLink}>
          <Text style={styles.linkButtonText}>Open Review Page</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.nfcSection}>
        <Text style={styles.nfcTitle}>📱 Write to NFC Tag</Text>
        <Text style={styles.nfcDescription}>
          Write the review link to an NFC tag so customers can easily leave reviews.
        </Text>
        
        <TouchableOpacity
          style={[styles.nfcButton, writing && styles.nfcButtonDisabled]}
          onPress={writeNFC}
          disabled={writing}
        >
          <Text style={styles.nfcButtonText}>
            {writing ? 'Ready to write...' : 'Write NFC Tag'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.nfcHint}>
          Tap the button above, then hold your phone near an NFC tag to write the review link.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  ratingsCount: {
    fontSize: 14,
    color: '#9ca3af',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  linkButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  nfcSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nfcTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  nfcDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  nfcButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  nfcButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  nfcButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nfcHint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
