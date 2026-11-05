// Token storage abstraction.
// Native: expo-secure-store (encrypted keychain / keystore).
// Web (expo start --web): falls back to localStorage, since SecureStore is
// unavailable there.
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "betterreads_token";
const isWeb = Platform.OS === "web";

export async function getToken() {
  try {
    if (isWeb) return typeof localStorage !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token) {
  try {
    if (!token) return clearToken();
    if (isWeb) localStorage.setItem(TOKEN_KEY, token);
    else await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // ignore storage failures
  }
}

export async function clearToken() {
  try {
    if (isWeb) localStorage.removeItem(TOKEN_KEY);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ignore storage failures
  }
}
