import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { THEME_COLOR } from '../strings';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: '1', label: '🥗 Pure Veg' },
  { id: '2', label: '🍕 Pizza' },
  { id: '3', label: '🍔 Burgers' },
  { id: '4', label: '🍜 Chinese' },
  { id: '5', label: '🍣 Sushi' },
  { id: '6', label: '🍦 Desserts' },
  { id: '7', label: '🥤 Drinks' },
];

const FOOD_ITEMS = [
  { id: '1', emoji: '🍕', name: 'Pizza' },
  { id: '2', emoji: '🍔', name: 'Burger' },
  { id: '3', emoji: '🍜', name: 'Noodles' },
  { id: '4', emoji: '🍛', name: 'Biryani' },
  { id: '5', emoji: '🥗', name: 'Salads' },
  { id: '6', emoji: '🍣', name: 'Sushi' },
  { id: '7', emoji: '🍩', name: 'Donuts' },
  { id: '8', emoji: '🥤', name: 'Shakes' },
];

const RESTAURANTS = [
  {
    id: '1',
    name: 'Biryani Blues',
    tags: 'Biryani · Mughlai · North Indian',
    rating: 4.5,
    time: '25–35 min',
    price: '₹250 for one',
    discount: '60% OFF up to ₹120',
    color: '#FFF3E0',
    emojiCover: '🍛',
  },
  {
    id: '2',
    name: 'Burger King',
    tags: 'Burgers · Fast Food · American',
    rating: 4.3,
    time: '20–30 min',
    price: '₹300 for one',
    discount: '50% OFF up to ₹100',
    color: '#FFF8E1',
    emojiCover: '🍔',
  },
  {
    id: '3',
    name: 'Pizza Hut',
    tags: 'Pizzas · Italian · Pastas',
    rating: 4.1,
    time: '30–40 min',
    price: '₹400 for one',
    discount: '40% OFF up to ₹80',
    color: '#FCE4EC',
    emojiCover: '🍕',
  },
  {
    id: '4',
    name: 'Chinese Wok',
    tags: 'Chinese · Asian · Noodles',
    rating: 4.4,
    time: '15–25 min',
    price: '₹200 for one',
    discount: '30% OFF up to ₹60',
    color: '#E8F5E9',
    emojiCover: '🍜',
  },
  {
    id: '5',
    name: 'Prem Dhaba',
    tags: 'North Indian · Punjabi · Desi',
    rating: 4.6,
    time: '35–45 min',
    price: '₹180 for one',
    discount: '₹125 OFF above ₹299',
    color: '#E3F2FD',
    emojiCover: '🫕',
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

const StarRating = ({ rating }: { rating: number }) => (
  <View style={styles.ratingRow}>
    <View style={styles.ratingBadge}>
      <Text style={styles.ratingText}>★ {rating}</Text>
    </View>
  </View>
);

const RestaurantCard = ({ item }: { item: (typeof RESTAURANTS)[0] }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={onPressIn}
      onPressOut={onPressOut}>
      <Animated.View style={[styles.restaurantCard, { transform: [{ scale }] }]}>
        {/* Cover */}
        <View style={[styles.cardCover, { backgroundColor: item.color }]}>
          <Text style={styles.cardEmoji}>{item.emojiCover}</Text>
          {item.discount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount}</Text>
            </View>
          ) : null}
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.restaurantTags} numberOfLines={1}>
            {item.tags}
          </Text>
          <View style={styles.cardMeta}>
            <StarRating rating={item.rating} />
            <Text style={styles.metaDot}> · </Text>
            <Text style={styles.metaText}>{item.time}</Text>
            <Text style={styles.metaDot}> · </Text>
            <Text style={styles.metaText}>{item.price}</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const MainScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [searchText, setSearchText] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerBg = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: ['transparent', '#ffffff'],
    extrapolate: 'clamp',
  });

  const headerShadow = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 4],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Sticky Header ── */}
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: headerBg,
            shadowOpacity: headerShadow,
          },
        ]}>
        {/* Location Row */}
        <View style={styles.locationRow}>
          <View style={styles.locationLeft}>
            <Text style={styles.locationLabel}>Delivering to</Text>
            <TouchableOpacity style={styles.locationPicker}>
              <Text style={styles.locationName} numberOfLines={1}>
                Koramangala, Bengaluru
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.avatarBtn}>
            <Text style={styles.avatarText}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for restaurants and food"
            placeholderTextColor="#aaa"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </Animated.View>

      {/* ── Scrollable Content ── */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContainer}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                selectedCategory === cat.id && styles.chipSelected,
              ]}
              onPress={() => setSelectedCategory(cat.id)}>
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === cat.id && styles.chipTextSelected,
                ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoLeft}>
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>🎉 LIMITED TIME</Text>
            </View>
            <Text style={styles.promoHeading}>70% OFF</Text>
            <Text style={styles.promoSub}>with free delivery</Text>
            <Text style={styles.promoCode}>Use code: TOMATO70</Text>
            <TouchableOpacity style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>Order Now →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.promoRight}>
            <Text style={styles.promoEmoji}>🍔</Text>
            <Text style={styles.promoEmoji2}>🍕</Text>
            <Text style={styles.promoEmoji3}>🍜</Text>
          </View>
        </View>

        {/* What makes you happy */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>What makes you happy? 😊</Text>
        </View>

        <View style={styles.foodGrid}>
          {FOOD_ITEMS.map(item => (
            <TouchableOpacity key={item.id} style={styles.foodItem}>
              <View style={styles.foodEmojiContainer}>
                <Text style={styles.foodEmoji}>{item.emoji}</Text>
              </View>
              <Text style={styles.foodName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Restaurants Near You */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🍽 Restaurants near you</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.restaurantCount}>
          1,40,000+ restaurants around you
        </Text>

        {/* Restaurant List */}
        {RESTAURANTS.map(restaurant => (
          <RestaurantCard key={restaurant.id} item={restaurant} />
        ))}

        <View style={{ height: responsiveHeight(3) }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default MainScreen;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // Header
  header: {
    paddingHorizontal: responsiveWidth(4),
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  locationLeft: {
    flex: 1,
  },

  locationLabel: {
    fontSize: responsiveFontSize(1.5),
    color: '#888',
    fontWeight: '500',
  },

  locationPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  locationName: {
    fontSize: responsiveFontSize(2),
    fontWeight: '800',
    color: '#1a1a1a',
    maxWidth: responsiveWidth(65),
  },

  chevron: {
    fontSize: responsiveFontSize(2),
    color: THEME_COLOR,
    marginLeft: 4,
    fontWeight: '700',
  },

  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: responsiveFontSize(2.2),
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#ebebeb',
  },

  searchIcon: {
    fontSize: responsiveFontSize(2),
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: responsiveFontSize(1.8),
    color: '#333',
  },

  scrollContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },

  // Chips
  chipsScroll: {
    flexGrow: 0,
    backgroundColor: '#fff',
  },

  chipsContainer: {
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: 12,
    gap: 8,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },

  chipSelected: {
    backgroundColor: THEME_COLOR,
    borderColor: THEME_COLOR,
  },

  chipText: {
    fontSize: responsiveFontSize(1.6),
    color: '#555',
    fontWeight: '600',
  },

  chipTextSelected: {
    color: '#fff',
  },

  // Promo Banner
  promoBanner: {
    margin: responsiveWidth(4),
    borderRadius: 18,
    backgroundColor: THEME_COLOR,
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: responsiveHeight(16),
    elevation: 6,
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },

  promoLeft: {
    flex: 1,
    padding: 18,
    justifyContent: 'center',
  },

  promoBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },

  promoBadgeText: {
    color: '#fff',
    fontSize: responsiveFontSize(1.3),
    fontWeight: '700',
  },

  promoHeading: {
    fontSize: responsiveFontSize(4.5),
    fontWeight: '900',
    color: '#fff',
    lineHeight: responsiveFontSize(5),
  },

  promoSub: {
    fontSize: responsiveFontSize(1.8),
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  promoCode: {
    marginTop: 6,
    fontSize: responsiveFontSize(1.5),
    color: 'rgba(255,255,255,0.75)',
    fontStyle: 'italic',
  },

  promoBtn: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },

  promoBtnText: {
    color: THEME_COLOR,
    fontSize: responsiveFontSize(1.6),
    fontWeight: '800',
  },

  promoRight: {
    width: responsiveWidth(28),
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 10,
  },

  promoEmoji: {
    fontSize: 42,
    marginBottom: -10,
    transform: [{ rotate: '-10deg' }],
  },

  promoEmoji2: {
    fontSize: 36,
    transform: [{ rotate: '8deg' }],
  },

  promoEmoji3: {
    fontSize: 30,
    marginTop: -4,
    transform: [{ rotate: '-5deg' }],
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4),
    marginTop: 16,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: '800',
    color: '#1a1a1a',
  },

  seeAll: {
    fontSize: responsiveFontSize(1.7),
    color: THEME_COLOR,
    fontWeight: '700',
  },

  // Food Grid
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: responsiveWidth(4),
    gap: 12,
    justifyContent: 'space-between',
  },

  foodItem: {
    width: (responsiveWidth(100) - responsiveWidth(8) - 12 * 3) / 4,
    alignItems: 'center',
    marginBottom: 4,
  },

  foodEmojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 6,
  },

  foodEmoji: {
    fontSize: 30,
  },

  foodName: {
    fontSize: responsiveFontSize(1.5),
    color: '#444',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Divider
  sectionDivider: {
    height: 8,
    backgroundColor: '#ebebeb',
    marginTop: 20,
  },

  // Restaurant count
  restaurantCount: {
    paddingHorizontal: responsiveWidth(4),
    fontSize: responsiveFontSize(1.5),
    color: '#888',
    marginTop: -6,
    marginBottom: 12,
  },

  // Restaurant Card
  restaurantCard: {
    backgroundColor: '#fff',
    marginHorizontal: responsiveWidth(4),
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  cardCover: {
    height: responsiveHeight(18),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  cardEmoji: {
    fontSize: 72,
  },

  discountBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME_COLOR,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },

  discountText: {
    color: '#fff',
    fontSize: responsiveFontSize(1.6),
    fontWeight: '800',
  },

  cardInfo: {
    padding: 14,
  },

  restaurantName: {
    fontSize: responsiveFontSize(2.1),
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 3,
  },

  restaurantTags: {
    fontSize: responsiveFontSize(1.6),
    color: '#777',
    marginBottom: 8,
  },

  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingBadge: {
    backgroundColor: '#48c479',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },

  ratingText: {
    color: '#fff',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '700',
  },

  metaDot: {
    color: '#ccc',
    fontSize: responsiveFontSize(1.8),
  },

  metaText: {
    fontSize: responsiveFontSize(1.5),
    color: '#666',
  },
});
