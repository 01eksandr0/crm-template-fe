export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  roleDisplayName: string;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

/** Параметры сессии от бэка (source of truth). */
export interface SessionInfo {
  accessTokenTtlMs: number;
  idleTimeoutMs: number;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  session: SessionInfo;
}
