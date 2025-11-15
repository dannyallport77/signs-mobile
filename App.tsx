import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LoginScreen';
import MapScreen from './screens/MapScreen';
import BusinessInfoScreen from './screens/BusinessInfoScreen';
import ProductSelectionScreen from './screens/ProductSelectionScreen';
import NFCActionScreen from './screens/NFCActionScreen';
import SaleCreationScreen from './screens/SaleCreationScreen';
import EraseTagScreen from './screens/EraseTagScreen';
import AdminSearchScreen from './screens/AdminSearchScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

const Stack = createNativeStackNavigator();

// Global error handler
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error('Global error caught:', error, isFatal);
  console.error('Error stack:', error.stack);
  
  if (isFatal) {
    Alert.alert(
      'Unexpected error occurred',
      `
Error: ${error.name}
Message: ${error.message}
Stack: ${error.stack?.substring(0, 500)}

Please report this to support.
      `,
      [{
        text: 'OK'
      }]
    );
  }
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen 
              name="Map" 
              options={{ 
                title: 'Find Businesses',
                headerRight: () => null
              }}
            >
              {(props) => <MapScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen
              name="BusinessInfo"
              options={{ title: 'Business Review Platforms' }}
            >
              {(props) => (
                <ErrorBoundary navigation={props.navigation}>
                  <BusinessInfoScreen {...props} />
                </ErrorBoundary>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="ProductSelection"
              options={{ title: 'Choose Product' }}
            >
              {(props) => (
                <ErrorBoundary navigation={props.navigation}>
                  <ProductSelectionScreen {...props} />
                </ErrorBoundary>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="NFCAction"
              options={{ title: 'Program Sign' }}
            >
              {(props) => (
                <ErrorBoundary navigation={props.navigation}>
                  <NFCActionScreen {...props} />
                </ErrorBoundary>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="SaleCreation"
              options={{ title: 'Create Sale' }}
            >
              {(props) => (
                <ErrorBoundary navigation={props.navigation}>
                  <SaleCreationScreen {...props} />
                </ErrorBoundary>
              )}
            </Stack.Screen>
            <Stack.Screen 
              name="EraseTag" 
              component={EraseTagScreen}
              options={{ title: 'Erase NFC Tag' }}
            />
            <Stack.Screen 
              name="AdminSearch" 
              component={AdminSearchScreen}
              options={{ title: 'Admin Business Search' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4f46e5',
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  cardText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
