const TOKEN_KEY = "bookmyvenue_token";
const USER_KEY = "bookmyvenue_user";

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${token}; path=/; samesite=strict`;
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

export function setSerializedUser(value: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, value);
}

export function getSerializedUser() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_KEY);
}
