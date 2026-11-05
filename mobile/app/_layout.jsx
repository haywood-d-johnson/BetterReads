// Root layout: wires providers and a navigation gate that keeps unauthenticated
// users on /login and authenticated users inside the (tabs) group.
// Replaces the web app's ProtectedRoute (client/src/components/layout/ProtectedRoute.jsx).
import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import { useAuth } from "../src/hooks/useAuth.js";
import LoadingSpinner from "../src/components/LoadingSpinner.jsx";
import { colors } from "../src/theme.js";

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(tabs)" || segments[0] === "book";
    if (!user && inAuthGroup) {
      router.replace("/login");
    } else if (user && segments[0] === "login") {
      router.replace("/");
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <LoadingSpinner text="Loading BetterReads..." />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="book/[id]" options={{ headerShown: true, title: "", headerBackTitle: "Back", headerTintColor: colors.primary }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.bg },
});
