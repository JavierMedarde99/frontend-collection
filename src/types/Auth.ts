export interface RegisterRequest {
  username: string
  email: string
  password: string
  displayName?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface UpdateProfileRequest {
  displayName?: string
  avatarUrl?: string
  bio?: string
}

export interface UserResponse {
  id: string
  username: string
  email: string
  displayName?: string
  avatarUrl?: string
  bio?: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserResponse
}
