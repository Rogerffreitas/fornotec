import { Role } from '../types';

/** Payload do JWT retornado pela API de autenticação, após decodificado. */
export interface DecodedToken {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    role: Role;
    enterpriseId: string;
    profilePic?: string;
  };
  enterprise: {
    name: string;
  };
  iat: number;
  exp: number;
}
