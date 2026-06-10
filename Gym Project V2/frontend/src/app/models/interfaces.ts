import { UserRole, MembershipStatus, PaymentStatus, AttendanceMethod, NotificationType, SubscriptionPlanType } from './enums';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  name?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  gender?: string;
  birthDate?: string | Date;
  lastLogin?: string;
  profilePhoto?: string;
  isEmailVerified?: boolean;
  memberId?: string;
  createdAt?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface Member {
  id: string;
  _id?: string;
  memberId?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  gender?: string;
  birthDate?: string | Date;
  address?: { city?: string; country?: string; [key: string]: any };
  emergencyContact?: { name?: string; phone?: string; relationship?: string; [key: string]: any };
  notes?: string;
  membershipStatus: MembershipStatus;
  subscriptionPlanId?: string;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  photo?: string;
  profilePhoto?: string;
  totalAttendance?: number;
  qrCode?: string;
  createdAt?: string;
}

export interface SubscriptionPlan {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  type?: SubscriptionPlanType | string;
  color?: string;
  durationMonths: number;
  durationDays?: number;
  price: number;
  currency?: string;
  features?: string[];
  isActive: boolean;
  isPopular?: boolean;
  createdAt?: string;
}

export interface Subscription {
  id?: string;
  _id?: string;
  memberId: string;
  planId: string | SubscriptionPlan;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  paymentId?: string;
  createdAt?: string;
}

export interface Attendance {
  id?: string;
  _id?: string;
  memberId: string | Member;
  member?: Member;
  checkedInAt: string;
  checkedOutAt?: string | null;
  checkInTime?: string;
  checkOutTime?: string | null;
  method: AttendanceMethod;
  staffId?: string;
  createdAt?: string;
}

export interface Payment {
  id?: string;
  _id?: string;
  memberId: string | Member;
  member?: Member;
  subscriptionId?: string;
  subscriptionPlan?: SubscriptionPlan;
  invoiceNumber?: string;
  amount: number;
  currency?: string;
  method: 'cash' | 'card' | 'bank_transfer' | 'online';
  status: PaymentStatus;
  paymentDate?: string;
  paidAt?: string;
  dueDate: string;
  createdAt?: string;
}

export interface Trainer {
  id?: string;
  _id?: string;
  userId: string | User;
  specialization: string | string[];
  bio?: string;
  photo?: string;
  profilePhoto?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
}

export interface GymClass {
  id?: string;
  _id?: string;
  name: string;
  title?: string;
  status?: string;
  description?: string;
  trainerId: string | Trainer;
  trainer?: Trainer;
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  startTime?: string;
  endTime?: string;
  capacity: number;
  location: string;
  coverImage?: string;
  participants?: any[];
  tags?: string[];
  isFull?: boolean;
  availableSpots?: number;
  enrollmentCount?: number;
  isDeleted?: boolean;
  createdAt?: string;
}

export interface Notification {
  id?: string;
  _id?: string;
  user?: string;
  type: NotificationType | string;
  title?: string;
  title_en?: string;
  title_ar?: string;
  message?: string;
  message_en?: string;
  message_ar?: string;
  isRead: boolean;
  action?: string;
  data?: any;
  createdAt?: string;
}

export interface DashboardKPIs {
  totalMembers: number;
  activeMembers: number;
  todayAttendance: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  newMembersThisMonth: number;
  expiringMembers: number;
  trainerCount: number;
  classCount: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | undefined;
}
