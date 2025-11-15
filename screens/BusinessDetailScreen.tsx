import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator
} from 'react-native';
import { Business, SocialMediaLinks } from '../types';
import { socialMediaService } from '../services/socialMediaService';

// API URL - use environment variable or default to network IP
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.110:3000/api';

export default function BusinessDetailScreen({ route, navigation }: any) {
  const [socialMedia, setSocialMedia] = useState<SocialMediaLinks>({});
  const [loadingSocialMedia, setLoadingSocialMedia] = useState(false);
  const [selectedLinkType, setSelectedLinkType] = useState<'google' | 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'tripadvisor' | 'trustpilot' | 'yell' | 'ratedpeople' | 'trustatrader' | 'checkatrade'>('google');
  const [error, setError] = useState<string | null>(null);
  
  let business;
  
  try {
    const params = route?.params || {};
    business = params.business;
    
    console.log('BusinessDetailScreen - business:', business ? 'exists' : 'missing');
    console.log('BusinessDetailScreen - params:', JSON.stringify(params));
  } catch (e) {
    console.error('Error accessing route params:', e);
    setError('Failed to load business data: ' + e.message);
  }

  // Fetch social media links when business is loaded
  useEffect(() => {
    try {
      if (business) {
        loadSocialMediaLinks();
      }
    } catch (e) {
      console.error('Error in useEffect:', e);
      setError('Error loading social media: ' + e.message);
    }
  }, [business]);

  const loadSocialMediaLinks = async () => {
    if (!business) return;
    
    setLoadingSocialMedia(true);
    try {
      const links = await socialMediaService.getSocialMediaLinks(
        business.name,
        business.address,
        business.placeId,
        false // Don't verify initially to keep it fast
      );
      setSocialMedia(links);
    } catch (error) {
      console.error('Error loading social media links:', error);
      // Don't set error state here - social media is optional
    } finally {
      setLoadingSocialMedia(false);
    }
  };

  const handleContinueToSignSelection = () => {
    if (!business) {
      Alert.alert('Error', 'Business information is missing');
      return;
    }

    // Determine which URL to write based on selected link type
    let urlToWrite = business.reviewUrl; // Default to Google review
    let linkDescription = 'Google Review';

    switch (selectedLinkType) {
      case 'facebook':
        urlToWrite = socialMedia.facebook?.reviewUrl || socialMedia.facebook?.profileUrl || business.reviewUrl;
        linkDescription = socialMedia.facebook?.reviewUrl ? 'Facebook Review' : 'Facebook Profile';
        break;
      case 'instagram':
        urlToWrite = socialMedia.instagram?.profileUrl || business.reviewUrl;
        linkDescription = 'Instagram Profile';
        break;
      case 'tiktok':
        urlToWrite = socialMedia.tiktok?.profileUrl || business.reviewUrl;
        linkDescription = 'TikTok Profile';
        break;
      case 'twitter':
        urlToWrite = socialMedia.twitter?.profileUrl || business.reviewUrl;
        linkDescription = 'Twitter/X Profile';
        break;
      case 'linkedin':
        urlToWrite = socialMedia.linkedin?.profileUrl || business.reviewUrl;
        linkDescription = 'LinkedIn Profile';
        break;
      case 'tripadvisor':
        urlToWrite = socialMedia.tripadvisor?.reviewUrl || business.reviewUrl;
        linkDescription = 'TripAdvisor Review';
        break;
      case 'trustpilot':
        urlToWrite = socialMedia.trustpilot?.reviewUrl || business.reviewUrl;
        linkDescription = 'Trustpilot Review';
        break;
      case 'yell':
        urlToWrite = socialMedia.yell?.profileUrl || business.reviewUrl;
        linkDescription = 'Yell Profile';
        break;
      case 'ratedpeople':
        urlToWrite = socialMedia.ratedpeople?.profileUrl || business.reviewUrl;
        linkDescription = 'Rated People Profile';
        break;
      case 'trustatrader':
        urlToWrite = socialMedia.trustatrader?.profileUrl || business.reviewUrl;
        linkDescription = 'TrustATrader Profile';
        break;
      case 'checkatrade':
        urlToWrite = socialMedia.checkatrade?.profileUrl || business.reviewUrl;
        linkDescription = 'Checkatrade Profile';
        break;
      default:
        urlToWrite = business.reviewUrl;
        linkDescription = 'Google Review';
    }

    // Navigate to sign type selection with the selected review platform info
    navigation.navigate('SignTypeSelection', {
      business,
      reviewUrl: urlToWrite,
      reviewPlatform: selectedLinkType,
      linkDescription
    });
  };

  const openReviewLink = () => {
    if (!business?.reviewUrl) {
      Alert.alert('Error', 'Review link is not available');
      return;
    }
    Linking.openURL(business.reviewUrl);
  };

  const openMapsLink = () => {
    if (!business?.mapsUrl) {
      Alert.alert('Error', 'Maps link is not available');
      return;
    }
    Linking.openURL(business.mapsUrl);
  };

  // Show error if any
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Error</Text>
          <Text style={styles.emptyStateText}>{error}</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => navigation.navigate('Map')}
          >
            <Text style={styles.selectButtonText}>Back to Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Don't render if we don't have business data
  if (!business) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Business Selected</Text>
          <Text style={styles.emptyStateText}>Please select a business from the map</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => navigation.navigate('Map')}
          >
            <Text style={styles.selectButtonText}>Back to Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If no sign type selected, show message to select one
  if (!signType) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Sign Type Selected</Text>
          <Text style={styles.emptyStateText}>Please select a sign type to continue</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => navigation.navigate('SignTypeSelection', { business })}
          >
            <Text style={styles.selectButtonText}>Select Sign Type</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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

      {signType && (
        <View style={styles.signTypeCard}>
          <View style={styles.signTypeHeader}>
            <Text style={styles.signTypeLabel}>Selected Sign Type</Text>
            <TouchableOpacity 
              onPress={() => navigation.push('SignTypeSelection', {
                business
              })}
            >
              <Text style={styles.changeButton}>Change</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.signTypeName}>{signType.name}</Text>
          <Text style={styles.signTypeDescription}>{signType.description}</Text>
          <Text style={styles.signTypePrice}>Default Price: £{signType.defaultPrice.toFixed(2)}</Text>
        </View>
      )}

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
          Select which link to program on the NFC tag, then write it to a tag.
        </Text>

        <View style={styles.linkTypeSelector}>
          <Text style={styles.linkTypeSelectorTitle}>Select Link Type:</Text>
          
          {/* Google Review - Always available */}
          <TouchableOpacity
            style={[styles.linkTypeOption, selectedLinkType === 'google' && styles.linkTypeOptionSelected]}
            onPress={() => setSelectedLinkType('google')}
          >
            <Text style={[styles.linkTypeEmoji, selectedLinkType === 'google' && styles.linkTypeEmojiSelected]}>⭐</Text>
            <View style={styles.linkTypeTextContainer}>
              <Text style={[styles.linkTypeLabel, selectedLinkType === 'google' && styles.linkTypeLabelSelected]}>Google Review</Text>
              <Text style={styles.linkTypeUrl} numberOfLines={1}>{business.reviewUrl}</Text>
            </View>
            {selectedLinkType === 'google' && <Text style={styles.linkTypeCheck}>✓</Text>}
          </TouchableOpacity>

          {/* Facebook */}
          <View
            style={[
              styles.linkTypeOption, 
              !socialMedia.facebook && styles.linkTypeOptionDisabled,
              selectedLinkType === 'facebook' && socialMedia.facebook && styles.linkTypeOptionSelected
            ]}
          >
            <Text style={[styles.linkTypeEmoji, selectedLinkType === 'facebook' && styles.linkTypeEmojiSelected]}>📘</Text>
            <View style={styles.linkTypeTextContainer}>
              <Text style={[styles.linkTypeLabel, selectedLinkType === 'facebook' && styles.linkTypeLabelSelected]}>
                Facebook {socialMedia.facebook?.reviewUrl ? 'Review' : 'Profile'}
              </Text>
              {socialMedia.facebook ? (
                <Text style={styles.linkTypeUrl} numberOfLines={1}>
                  {socialMedia.facebook.reviewUrl || socialMedia.facebook.profileUrl}
                </Text>
              ) : loadingSocialMedia ? (
                <Text style={styles.linkTypeUrlUnavailable}>Searching...</Text>
              ) : (
                <Text style={styles.linkTypeUrlUnavailable}>Not available for this business</Text>
              )}
            </View>
            {!loadingSocialMedia && socialMedia.facebook && selectedLinkType === 'facebook' && <Text style={styles.linkTypeCheck}>✓</Text>}
          </View>

          {/* Instagram */}
          <View
            style={[
              styles.linkTypeOption,
              !socialMedia.instagram && styles.linkTypeOptionDisabled,
              selectedLinkType === 'instagram' && socialMedia.instagram && styles.linkTypeOptionSelected
            ]}
          >
            <Text style={[styles.linkTypeEmoji, selectedLinkType === 'instagram' && styles.linkTypeEmojiSelected]}>📸</Text>
            <View style={styles.linkTypeTextContainer}>
              <Text style={[styles.linkTypeLabel, selectedLinkType === 'instagram' && styles.linkTypeLabelSelected]}>Instagram Profile</Text>
              {socialMedia.instagram ? (
                <Text style={styles.linkTypeUrl} numberOfLines={1}>{socialMedia.instagram.profileUrl}</Text>
              ) : loadingSocialMedia ? (
                <Text style={styles.linkTypeUrlUnavailable}>Searching...</Text>
              ) : (
                <Text style={styles.linkTypeUrlUnavailable}>Not available for this business</Text>
              )}
            </View>
            {!loadingSocialMedia && socialMedia.instagram && selectedLinkType === 'instagram' && <Text style={styles.linkTypeCheck}>✓</Text>}
          </View>

          {/* TikTok */}
          <View
            style={[
              styles.linkTypeOption,
              !socialMedia.tiktok && styles.linkTypeOptionDisabled,
              selectedLinkType === 'tiktok' && socialMedia.tiktok && styles.linkTypeOptionSelected
            ]}
          >
            <Text style={[styles.linkTypeEmoji, selectedLinkType === 'tiktok' && styles.linkTypeEmojiSelected]}>🎵</Text>
            <View style={styles.linkTypeTextContainer}>
              <Text style={[styles.linkTypeLabel, selectedLinkType === 'tiktok' && styles.linkTypeLabelSelected]}>TikTok Profile</Text>
              {socialMedia.tiktok ? (
                <Text style={styles.linkTypeUrl} numberOfLines={1}>{socialMedia.tiktok.profileUrl}</Text>
              ) : loadingSocialMedia ? (
                <Text style={styles.linkTypeUrlUnavailable}>Searching...</Text>
              ) : (
                <Text style={styles.linkTypeUrlUnavailable}>Not available for this business</Text>
              )}
            </View>
            {!loadingSocialMedia && socialMedia.tiktok && selectedLinkType === 'tiktok' && <Text style={styles.linkTypeCheck}>✓</Text>}
          </View>

          {/* Twitter/X */}
          <View
            style={[
              styles.linkTypeOption,
              !socialMedia.twitter && styles.linkTypeOptionDisabled,
              selectedLinkType === 'twitter' && socialMedia.twitter && styles.linkTypeOptionSelected
            ]}
          >
            <Text style={[styles.linkTypeEmoji, selectedLinkType === 'twitter' && styles.linkTypeEmojiSelected]}>🐦</Text>
            <View style={styles.linkTypeTextContainer}>
              <Text style={[styles.linkTypeLabel, selectedLinkType === 'twitter' && styles.linkTypeLabelSelected]}>Twitter/X Profile</Text>
              {socialMedia.twitter ? (
                <Text style={styles.linkTypeUrl} numberOfLines={1}>{socialMedia.twitter.profileUrl}</Text>
              ) : loadingSocialMedia ? (
                <Text style={styles.linkTypeUrlUnavailable}>Searching...</Text>
              ) : (
                <Text style={styles.linkTypeUrlUnavailable}>Not available for this business</Text>
              )}
            </View>
            {!loadingSocialMedia && socialMedia.twitter && selectedLinkType === 'twitter' && <Text style={styles.linkTypeCheck}>✓</Text>}
          </View>

          {/* LinkedIn */}
          <View
            style={[
              styles.linkTypeOption,
              !socialMedia.linkedin && styles.linkTypeOptionDisabled,
              selectedLinkType === 'linkedin' && socialMedia.linkedin && styles.linkTypeOptionSelected
            ]}
          >
            <Text style={[styles.linkTypeEmoji, selectedLinkType === 'linkedin' && styles.linkTypeEmojiSelected]}>💼</Text>
            <View style={styles.linkTypeTextContainer}>
              <Text style={[styles.linkTypeLabel, selectedLinkType === 'linkedin' && styles.linkTypeLabelSelected]}>LinkedIn Profile</Text>
              {socialMedia.linkedin ? (
                <Text style={styles.linkTypeUrl} numberOfLines={1}>{socialMedia.linkedin.profileUrl}</Text>
              ) : loadingSocialMedia ? (
                <Text style={styles.linkTypeUrlUnavailable}>Searching...</Text>
              ) : (
                <Text style={styles.linkTypeUrlUnavailable}>Not available for this business</Text>
              )}
            </View>
            {!loadingSocialMedia && socialMedia.linkedin && selectedLinkType === 'linkedin' && <Text style={styles.linkTypeCheck}>✓</Text>}
          </View>

          {/* TripAdvisor */}
          <TouchableOpacity
            style={[
              styles.linkTypeOption,
              !socialMedia.tripadvisor && styles.linkTypeOptionDisabled,
              selectedLinkType === 'tripadvisor' && socialMedia.tripadvisor && styles.linkTypeOptionSelected
            ]}
            onPress={() => socialMedia.tripadvisor && setSelectedLinkType('tripadvisor')}
            disabled={!socialMedia.tripadvisor}
          >
            <Text style={[styles.linkTypeEmoji, selectedLinkType === 'tripadvisor' && styles.linkTypeEmojiSelected]}>🦉</Text>
            <View style={styles.linkTypeTextContainer}>
              <Text style={[styles.linkTypeLabel, selectedLinkType === 'tripadvisor' && styles.linkTypeLabelSelected]}>TripAdvisor Review</Text>
              {socialMedia.tripadvisor ? (
                <Text style={styles.linkTypeUrl} numberOfLines={1}>{socialMedia.tripadvisor.reviewUrl}</Text>
              ) : loadingSocialMedia ? (
                <Text style={styles.linkTypeUrlUnavailable}>Searching...</Text>
              ) : (
                <Text style={styles.linkTypeUrlUnavailable}>Not available for this business</Text>
              )}
            </View>
            {!loadingSocialMedia && socialMedia.tripadvisor && selectedLinkType === 'tripadvisor' && <Text style={styles.linkTypeCheck}>✓</Text>}
          </TouchableOpacity>

          {/* Trustpilot */}
          <TouchableOpacity
            style={[
              styles.linkTypeOption,
              !socialMedia.trustpilot && styles.linkTypeOptionDisabled,
              selectedLinkType === 'trustpilot' && socialMedia.trustpilot && styles.linkTypeOptionSelected
            ]}
            onPress={() => socialMedia.trustpilot && setSelectedLinkType('trustpilot')}
            disabled={!socialMedia.trustpilot}
          >
            <Text style={[styles.linkTypeEmoji, selectedLinkType === 'trustpilot' && styles.linkTypeEmojiSelected]}>⭐</Text>
            <View style={styles.linkTypeTextContainer}>
              <Text style={[styles.linkTypeLabel, selectedLinkType === 'trustpilot' && styles.linkTypeLabelSelected]}>Trustpilot Review</Text>
              {socialMedia.trustpilot ? (
                <Text style={styles.linkTypeUrl} numberOfLines={1}>{socialMedia.trustpilot.reviewUrl}</Text>
              ) : loadingSocialMedia ? (
                <Text style={styles.linkTypeUrlUnavailable}>Searching...</Text>
              ) : (
                <Text style={styles.linkTypeUrlUnavailable}>Not available for this business</Text>
              )}
            </View>
            {!loadingSocialMedia && socialMedia.trustpilot && selectedLinkType === 'trustpilot' && <Text style={styles.linkTypeCheck}>✓</Text>}
          </TouchableOpacity>

          {/* Yell */}
          <TouchableOpacity
            style={[
              styles.linkTypeOption,
              !socialMedia.yell && styles.linkTypeOptionDisabled,
              selectedLinkType === 'yell' && socialMedia.yell && styles.linkTypeOptionSelected
            ]}
            onPress={() => socialMedia.yell && setSelectedLinkType('yell')}
            disabled={!socialMedia.yell}
          >
            <Text style={[styles.linkTypeEmoji, selectedLinkType === 'yell' && styles.linkTypeEmojiSelected]}>📢</Text>
            <View style={styles.linkTypeTextContainer}>
              <Text style={[styles.linkTypeLabel, selectedLinkType === 'yell' && styles.linkTypeLabelSelected]}>Yell Profile</Text>
              {socialMedia.yell ? (
                <Text style={styles.linkTypeUrl} numberOfLines={1}>{socialMedia.yell.profileUrl}</Text>
              ) : loadingSocialMedia ? (
                <Text style={styles.linkTypeUrlUnavailable}>Searching...</Text>
              ) : (
                <Text style={styles.linkTypeUrlUnavailable}>Not available for this business</Text>
              )}
            </View>
            {!loadingSocialMedia && socialMedia.yell && selectedLinkType === 'yell' && <Text style={styles.linkTypeCheck}>✓</Text>}
          </TouchableOpacity>

          {/* Checkatrade */}
          <TouchableOpacity
            style={[
              styles.linkTypeOption,
              !socialMedia.checkatrade && styles.linkTypeOptionDisabled,
              selectedLinkType === 'checkatrade' && socialMedia.checkatrade && styles.linkTypeOptionSelected
            ]}
            onPress={() => socialMedia.checkatrade && setSelectedLinkType('checkatrade')}
            disabled={!socialMedia.checkatrade}
          >
            <Text style={[styles.linkTypeEmoji, selectedLinkType === 'checkatrade' && styles.linkTypeEmojiSelected]}>✅</Text>
            <View style={styles.linkTypeTextContainer}>
              <Text style={[styles.linkTypeLabel, selectedLinkType === 'checkatrade' && styles.linkTypeLabelSelected]}>Checkatrade Profile</Text>
              {socialMedia.checkatrade ? (
                <Text style={styles.linkTypeUrl} numberOfLines={1}>{socialMedia.checkatrade.profileUrl}</Text>
              ) : loadingSocialMedia ? (
                <Text style={styles.linkTypeUrlUnavailable}>Searching...</Text>
              ) : (
                <Text style={styles.linkTypeUrlUnavailable}>Not available for this business</Text>
              )}
            </View>
            {!loadingSocialMedia && socialMedia.checkatrade && selectedLinkType === 'checkatrade' && <Text style={styles.linkTypeCheck}>✓</Text>}
          </TouchableOpacity>

          {/* Rated People */}
          <TouchableOpacity
            style={[
              styles.linkTypeOption,
              !socialMedia.ratedpeople && styles.linkTypeOptionDisabled,
              selectedLinkType === 'ratedpeople' && socialMedia.ratedpeople && styles.linkTypeOptionSelected
            ]}
            onPress={() => socialMedia.ratedpeople && setSelectedLinkType('ratedpeople')}
            disabled={!socialMedia.ratedpeople}
          >
            <Text style={[styles.linkTypeEmoji, selectedLinkType === 'ratedpeople' && styles.linkTypeEmojiSelected]}>👥</Text>
            <View style={styles.linkTypeTextContainer}>
              <Text style={[styles.linkTypeLabel, selectedLinkType === 'ratedpeople' && styles.linkTypeLabelSelected]}>Rated People Profile</Text>
              {socialMedia.ratedpeople ? (
                <Text style={styles.linkTypeUrl} numberOfLines={1}>{socialMedia.ratedpeople.profileUrl}</Text>
              ) : loadingSocialMedia ? (
                <Text style={styles.linkTypeUrlUnavailable}>Searching...</Text>
              ) : (
                <Text style={styles.linkTypeUrlUnavailable}>Not available for this business</Text>
              )}
            </View>
            {!loadingSocialMedia && socialMedia.ratedpeople && selectedLinkType === 'ratedpeople' && <Text style={styles.linkTypeCheck}>✓</Text>}
          </TouchableOpacity>

          {/* TrustATrader */}
          <TouchableOpacity
            style={[
              styles.linkTypeOption,
              !socialMedia.trustatrader && styles.linkTypeOptionDisabled,
              selectedLinkType === 'trustatrader' && socialMedia.trustatrader && styles.linkTypeOptionSelected
            ]}
            onPress={() => socialMedia.trustatrader && setSelectedLinkType('trustatrader')}
            disabled={!socialMedia.trustatrader}
          >
            <Text style={[styles.linkTypeEmoji, selectedLinkType === 'trustatrader' && styles.linkTypeEmojiSelected]}>🔧</Text>
            <View style={styles.linkTypeTextContainer}>
              <Text style={[styles.linkTypeLabel, selectedLinkType === 'trustatrader' && styles.linkTypeLabelSelected]}>TrustATrader Profile</Text>
              {socialMedia.trustatrader ? (
                <Text style={styles.linkTypeUrl} numberOfLines={1}>{socialMedia.trustatrader.profileUrl}</Text>
              ) : loadingSocialMedia ? (
                <Text style={styles.linkTypeUrlUnavailable}>Searching...</Text>
              ) : (
                <Text style={styles.linkTypeUrlUnavailable}>Not available for this business</Text>
              )}
            </View>
            {!loadingSocialMedia && socialMedia.trustatrader && selectedLinkType === 'trustatrader' && <Text style={styles.linkTypeCheck}>✓</Text>}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinueToSignSelection}
        >
          <Text style={styles.continueButtonText}>Continue to Sign Selection</Text>
        </TouchableOpacity>

        <Text style={styles.continueHint}>
          Select a review platform above, then continue to choose your sign type.
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
  linkTypeSelector: {
    marginBottom: 20,
  },
  linkTypeSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  linkTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  linkTypeOptionSelected: {
    backgroundColor: '#eef2ff',
    borderColor: '#4f46e5',
  },
  linkTypeEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  linkTypeEmojiSelected: {
    fontSize: 28,
  },
  linkTypeTextContainer: {
    flex: 1,
  },
  linkTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  linkTypeLabelSelected: {
    color: '#4f46e5',
  },
  linkTypeUrl: {
    fontSize: 11,
    color: '#9ca3af',
  },
  linkTypeUrlUnavailable: {
    fontSize: 11,
    color: '#d1d5db',
    fontStyle: 'italic',
  },
  linkTypeOptionDisabled: {
    opacity: 0.5,
    backgroundColor: '#f3f4f6',
  },
  linkTypeCheck: {
    fontSize: 20,
    color: '#4f46e5',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  continueButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  continueHint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
