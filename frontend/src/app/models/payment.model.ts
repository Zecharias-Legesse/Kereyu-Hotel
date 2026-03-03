export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'BANK_TRANSFER' | 'MOBILE_PAYMENT';
export type PaymentStatusType = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface PaymentRequest {
  reservationId: number;
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface PaymentResponse {
  id: number;
  reservationId: number;
  reservationNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  status: PaymentStatusType;
  createdAt: string;
}
