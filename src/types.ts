export enum UserRole {
  ADMIN = 'ADMIN',
  HR = 'HR',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Department {
  id: string;
  name: string;
  managerId?: string;
  description: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  joiningDate: string;
  password?: string; // Only used internally
  managerId?: string;
  leaveBalance: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approvedById?: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  rating: number; // 1-5
  feedback: string;
  date: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}
