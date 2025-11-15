import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { ReviewStats, Business, PlatformSelection, SocialMediaLinks } from '../types';
import { socialMediaService } from '../services/socialMediaService';

const reviewPlatforms: PlatformSelection[] = [
  { key: 'google', label: 'Google Review', description: 'Official Google Business reviews', emoji: '⭐' },
  { key: 'facebook', label: 'Facebook', description: 'Customers on Facebook', emoji: '📘' },
  { key: 'instagram', label: 'Instagram', description: 'Followers and stories', emoji: '📸' },
  { key: 'tripadvisor', label: 'TripAdvisor', description: 'Travel and hospitality', emoji: '🦉' },
  { key: 'trustpilot', label: 'Trustpilot', description: 'Independent reviews', emoji: '🛡️' },
  { key: 'yell', label: 'Yell', description: 'Local UK directory', emoji: '📢' },
  { key: 'ratedpeople', label: 'Rated People', description: 'Tradespeople reviews', emoji: '👥' },
  { key: 'trustatrader', label: 'TrustATrader', description: 'Verified trades', emoji: '🛠️' },
  { key: 'checkatrade', label: 'Checkatrade', description: 'Member reviews', emoji: '✅' },
];

interface BusinessInfoScreenProps {
  navigation: any;
  route: any;
}

export default function BusinessInfoScreen({ navigation, route }: BusinessInfoScreenProps) {
  const [socialMedia, setSocialMedia] = useState<SocialMediaLinks>({});
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformSelection | null>(null);
  const [error, setError] = useState<string | null>(null);

  let business: Business | undefined;
  try {
    business = route?.params?.business;
  } catch (err) {
    console.error(err);
    setError('Unable to read business data');
  }

  useEffect(() => {
    if (business) {
      loadSocialMedia();
    }
  }, [business]);

  const loadSocialMedia = async () => {
    if (!business) return;
    setLoadingSocial(true);
    try {
      const links = await socialMediaService.getSocialMediaLinks(
        business.name,
        business.address,
        business.placeId
      );
      setSocialMedia(links);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSocial(false);
    }
  };

  const deriveStats = (): ReviewStats => {
    const total = business?.userRatingsTotal ?? 0;
    return {
      total,
      lastWeek: Math.round(total * 0.1),
      lastMonth: Math.round(total * 0.25),
      lastYear: total,
    };
  };

  const getPlatformUrl = (key: string) => {
    if (!business) return undefined;
    switch (key) {
      case 'facebook':
        return socialMedia.facebook?.reviewUrl || socialMedia.facebook?.profileUrl;
      case 'instagram':
        return socialMedia.instagram?.profileUrl;
      case 'tripadvisor':
        return socialMedia.tripadvisor?.reviewUrl;
      case 'trustpilot':
        return socialMedia.trustpilot?.reviewUrl;
      case 'yell':
        return socialMedia.yell?.profileUrl;
      case 'ratedpeople':
        return socialMedia.ratedpeople?.profileUrl;
      case 'trustatrader':
        return socialMedia.trustatrader?.profileUrl;
      case 'checkatrade':
        return socialMedia.checkatrade?.profileUrl;
      default:
        return business.reviewUrl;
    }
  };

  const handleContinue = () => {
    if (!business) {
      Alert.alert('Missing business');
      return;
    }
    if (!selectedPlatform) {
      Alert.alert('Select platform', 'Choose a review platform to continue');
      return;
    }

    const url = getPlatformUrl(selectedPlatform.key) || business.reviewUrl;

    const payload = {
      business,
      platformKey: selectedPlatform.key,
      platformLabel: selectedPlatform.label,
      linkDescription: selectedPlatform.description,
      reviewUrl: url,
    };

    navigation.navigate('ProductSelection', payload);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Select a business on the map first.</Text>
      </View>
    );
  }

  const stats = deriveStats();

  const renderCard = (platform: PlatformSelection) => {
    const isSelected = selectedPlatform?.key === platform.key;
    return (
      <TouchableOpacity
        key={platform.key}
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => setSelectedPlatform(platform)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardEmoji}>{platform.emoji}</Text>
          <Text style={styles.cardTitle}>{platform.label}</Text>
        </View>
        <Text style={styles.cardDescription}>{platform.description}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Rating:</Text>
          <Text style={styles.statsValue}>{business.rating?.toFixed(1) ?? 'N/A'}</Text>
        </View>
        <View style={styles.statsList}>
          <Text style={styles.statsValue}>Total reviews: {stats.total}</Text>
          <Text style={styles.statsValue}>Last week: {stats.lastWeek}</Text>
          <Text style={styles.statsValue}>Last month: {stats.lastMonth}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrow}>
          <Text style={styles.arrow}>←</Text>
          <Text style={styles.arrowLabel}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review platforms for {business.name}</Text>
        <Text style={styles.headerSubtitle}>{business.address}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {loadingSocial && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#4f46e5" />
            <Text style={styles.loadingText}>Looking for profiles…</Text>
          </View>
        )}
        {reviewPlatforms.map(renderCard)}
      </ScrollView>
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue to sign types</Text>
      </TouchableOpacity>
    </View>
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
  backArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  arrow: {
    fontSize: 20,
  },
  arrowLabel: {
    marginLeft: 6,
    color: '#4f46e5',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardsContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardSelected: {
    borderColor: '#4f46e5',
    shadowColor: '#4f46e5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginRight: 4,
  },
  statsValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  statsList: {
    marginTop: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  loadingText: {
    marginLeft: 12,
    color: '#6b7280',
  },
  continueButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#4f46e5',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#dc2626',
  },
});
