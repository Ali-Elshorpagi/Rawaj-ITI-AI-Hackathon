export enum UserRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  RECEPTION = 'reception',
  TRAINER = 'trainer',
  MEMBER = 'member',
}

export enum MembershipStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  FROZEN = 'frozen',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

export enum PaymentStatus {
  PAID = 'paid',
  PENDING = 'pending',
  OVERDUE = 'overdue',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum AttendanceMethod {
  QR = 'qr',
  MANUAL = 'manual',
}

export enum ClassStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum NotificationType {
  SUBSCRIPTION_EXPIRY = 'subscription-expiry',
  OVERDUE_PAYMENT = 'overdue-payment',
  GENERAL = 'general',
}
