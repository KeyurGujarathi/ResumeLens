import API_BASE from "../utils/api.js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ACTIVE_USER_ID_KEY,
  AUTH_TOKEN_KEY,
  clearActiveUser,
  clearLegacyUserData,
  migrateLegacyUserData,
  hydrateUserData,
  pushLocalData,
  startAutoSync,
} from "../utils/userStorage.js";


const AuthContext = createContext(null);

async function getErrorMessage(response, fallback) {
  try {
    const data = await response.json();

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data?.detail)) {
      return data.detail
        .map((item) => item?.msg)
        .filter(Boolean)
        .join(" ");
    }
  } catch {
    // Ignore JSON parsing errors.
  }

  return fallback;
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    () => localStorage.getItem(AUTH_TOKEN_KEY)
  );

  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    clearActiveUser();
    clearLegacyUserData();

    setToken(null);
    setUser(null);
  };

  const activateUser = (currentUser) => {
    if (
      !currentUser ||
      currentUser.id === undefined ||
      currentUser.id === null
    ) {
      throw new Error(
        "Unable to identify your account. Please sign in again."
      );
    }

    const userId = String(currentUser.id);

    migrateLegacyUserData(userId);

    localStorage.setItem(
      ACTIVE_USER_ID_KEY,
      userId
    );

    setUser(currentUser);
  };

  const fetchCurrentUser = async (currentToken) => {
    const response = await fetch(
      `${API_BASE}/api/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Your session has expired."
        )
      );
    }

    return response.json();
  };

  useEffect(() => {
    let cancelled = false;
    let stopAutoSync = null;

    async function restoreSession() {
      if (!token) {
        clearActiveUser();

        if (!cancelled) {
          setLoading(false);
        }

        return;
      }

      try {
        const currentUser =
          await fetchCurrentUser(token);

        if (!cancelled) {
          activateUser(currentUser);
          await pushLocalData(token, currentUser.id);
          await hydrateUserData(token, currentUser.id);
          stopAutoSync = startAutoSync(token, currentUser.id);
        }
      } catch (error) {
        console.error(
          "Session restore failed:",
          error
        );

        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
      if (stopAutoSync) stopAutoSync();
    };
  }, [token]);

  const login = async (email, password) => {
    const response = await fetch(
      `${API_BASE}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Login failed."
        )
      );
    }

    const data = await response.json();

    if (
      data.id === undefined ||
      data.id === null ||
      !data.token
    ) {
      throw new Error(
        "The server did not return the required account information. Please check the login API response."
      );
    }

    localStorage.setItem(
      AUTH_TOKEN_KEY,
      data.token
    );

    migrateLegacyUserData(String(data.id));

    localStorage.setItem(
      ACTIVE_USER_ID_KEY,
      String(data.id)
    );

    setToken(data.token);

    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      is_admin: Boolean(data.is_admin),
    });

    return data;
  };

  const register = async (
    name,
    email,
    password
  ) => {
    const response = await fetch(
      `${API_BASE}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Registration failed."
        )
      );
    }

    return response.json();
  };

  const logout = () => {
    const activeToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (activeToken) {
      fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${activeToken}` },
      }).catch(() => {});
    }
    clearSession();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
    }),
    [user, token, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}

export {
  AuthProvider,
  useAuth,
};