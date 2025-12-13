import {FlatList, RefreshControl, StyleSheet, Text, TextInput, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {Ionicons} from '@expo/vector-icons'
import {useState} from 'react'
import {useColorScheme} from "@/components/useColorScheme.web";
import {Colors} from '@/constants/Colors'
import {useRestaurants} from "@/hooks/useRestaurant";
import {RestaurantCard} from '@/components/restaurant/RestaurantCard'

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const [searchInput, setSearchInput] = useState('')

  const {
    restaurants,
    loading,
    error,
    search,
    refresh,
    toggleFavorite,
    isFavorite,
  } = useRestaurants()

  const handleSearch = (text: string) => {
    setSearchInput(text)
    // Debounce search
    setTimeout(() => search(text), 300)
  }

  return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Student Menu</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Trouve ton menu etudiant
          </Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
              placeholder="Rechercher un restaurant..."
              placeholderTextColor={colors.textSecondary}
              value={searchInput}
              onChangeText={handleSearch}
              style={[styles.searchInput, { color: colors.text }]}
          />
          {searchInput.length > 0 && (
              <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textSecondary}
                  onPress={() => handleSearch('')}
              />
          )}
        </View>

        {/* Error State */}
        {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
        )}

        {/* Restaurant List */}
        <FlatList
            data={restaurants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <RestaurantCard
                    restaurant={item}
                    isFavorite={isFavorite(item.id)}
                    onToggleFavorite={() => toggleFavorite(item.id)}
                />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                  refreshing={loading}
                  onRefresh={refresh}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
              />
            }
            ListEmptyComponent={
              !loading ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      Aucun restaurant trouve
                    </Text>
                  </View>
              ) : null
            }
        />
      </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
})