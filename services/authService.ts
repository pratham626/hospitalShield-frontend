import { apiRequest, ApiError, setBackendStatus } from "@/lib/apiClient";
import { LocalStore } from "@/lib/localStore";
import { User, AuthResponse } from "@/types";

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await apiRequest<AuthResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res.isFallback && res.data?.token) {
        LocalStore.setAuthToken(res.data.token);
        if (res.data.user) {
          LocalStore.setCurrentUser(res.data.user);
        }
        return res.data;
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err; // e.g. 401 Invalid credentials from real backend
      }
      // If network unreachable, check local store
    }

    // Local fallback authentication
    const user = LocalStore.getUserByEmail(email);
    if (!user) {
      // Allow demo login with any role if standard test password used
      if (password === "Hospital@123" || password === "password" || password === "demo123") {
        const defaultUser = LocalStore.getCurrentUser();
        const demoToken = `hs_jwt_sim_${Date.now()}_${defaultUser.role}`;
        LocalStore.setAuthToken(demoToken);
        return { token: demoToken, user: defaultUser };
      }
      throw new ApiError("Invalid user credentials or account does not exist.", 401);
    }

    if (!user.isActive) {
      throw new ApiError("This account has been deactivated by the Security Administrator.", 403);
    }

    const demoToken = `hs_jwt_sim_${Date.now()}_${user.role}`;
    LocalStore.setAuthToken(demoToken);
    LocalStore.setCurrentUser(user);
    return { token: demoToken, user };
  },

  async getMe(): Promise<User> {
    try {
      const res = await apiRequest<User>("/api/v1/auth/me", {
        method: "GET",
      });
      if (!res.isFallback && res.data) {
        LocalStore.setCurrentUser(res.data);
        return res.data;
      }
    } catch (err) {
      // Backend error or offline
    }
    return LocalStore.getCurrentUser();
  },

  switchUserForDemo(targetUserId: string): User {
    const user = LocalStore.getUserById(targetUserId);
    if (!user) throw new Error("User not found");
    LocalStore.setCurrentUser(user);
    const demoToken = `hs_jwt_sim_${Date.now()}_${user.role}`;
    LocalStore.setAuthToken(demoToken);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth-user-switched", { detail: { user } }));
    }
    return user;
  },

  logout(): void {
    LocalStore.setAuthToken(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth-logged-out"));
    }
  },

  getCurrentUser(): User {
    return LocalStore.getCurrentUser();
  },
};
