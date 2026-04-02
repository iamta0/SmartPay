import { z } from 'zod';

// ─── Navigation Types ─────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: undefined;
  App:  undefined;
  Pin:  {
    mode: 'set' | 'verify';
    onSuccess: () => void;
  };
};

export type AuthStackParamList = {
  Login:  undefined;
  Signup: undefined;
};

export type AppTabParamList = {
  Home:    undefined;
  Send:    undefined;
  Receive: undefined;
  History: undefined;
  Profile: undefined;
};

// ─── Service Result wrapper ───────────────────────────────────────────────────
export interface ServiceResult<T = void> {
  success: boolean;
  data?:   T;
  error?:  string;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  uid:         string;
  email:       string;
  displayName: string;
  username:    string;
  walletId:    string;
  createdAt:   Date;
}

// ─── Wallet ───────────────────────────────────────────────────────────────────
export interface Wallet {
  id:        string;
  ownerId:   string;
  balance:   number;
  currency:  string;
  updatedAt: Date;
}

// ─── Transaction ──────────────────────────────────────────────────────────────
export type TransactionType   = 'debit' | 'credit';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Transaction {
  id:               string;
  senderId:         string;
  receiverId:       string;
  senderUsername:   string;
  receiverUsername: string;
  amount:           number;
  currency:         string;
  type:             TransactionType;
  status:           TransactionStatus;
  note?:            string | null;
  createdAt:        Date;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  lastDoc:      unknown | null;
  hasMore:      boolean;
}

// ─── Transfer Payload ─────────────────────────────────────────────────────────
export interface TransferPayload {
  recipientEmail: string;
  amount:         number;
  currency:       string;
  note?:          string;
}

// ─── QR Payment ───────────────────────────────────────────────────────────────
export interface QRPaymentPayload {
  walletId:    string;
  userId:      string;
  displayName: string;
  amount?:     number;
}

// ─── Zod Schemas ──────────────────────────────────────────────────────────────
export const signupSchema = z.object({
  displayName: z.string().min(2,  'Full name must be at least 2 characters'),
  username:    z.string().min(3,  'Username must be at least 3 characters')
                .regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers, underscores only'),
  email:       z.string().email('Invalid email address'),
  password:    z.string().min(8,  'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const transferSchema = z.object({
  recipientEmail: z.string().email('Invalid email address'),
  amount:         z.number().positive('Amount must be greater than 0'),
  currency:       z.string().default('NGN'),
  note:           z.string().optional(),
});

export type SignupInput   = z.infer<typeof signupSchema>;
export type LoginInput    = z.infer<typeof loginSchema>;
export type TransferInput = z.infer<typeof transferSchema>;

// ─── Store States ─────────────────────────────────────────────────────────────
export interface AuthState {
  user:          User | null;
  isLoading:     boolean;
  isPinVerified: boolean;
}

export interface WalletState {
  wallet:    Wallet | null;
  isLoading: boolean;
  error:     string | null;
}

export interface TransactionState {
  transactions: Transaction[];
  isLoading:    boolean;
  error:        string | null;
}

export interface TransferState {
  isLoading: boolean;
  error:     string | null;
  success:   boolean;
}