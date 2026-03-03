export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface FirebaseTokenRequest {
  idToken: string;
}

export interface MessageResponse {
  message: string;
}

export interface UserSummary {
  id: number;
  username: string;
  fullName: string;
  email: string;
}
