import bcrypt from 'bcryptjs';
import { 
  Employee, Department, LeaveRequest, PerformanceReview, AuditLog, 
  UserRole, LeaveStatus 
} from '../../types';

// In-memory "Production" Database Simulation
class DataStore {
  private employees: Employee[] = [];
  private departments: Department[] = [];
  private leaveRequests: LeaveRequest[] = [];
  private performanceReviews: PerformanceReview[] = [];
  private auditLogs: AuditLog[] = [];
  private initialized = false;

  constructor() {
    // Start seeding but we'll check initialized flag
    this.seed();
  }

  async ensureInitialized() {
    if (this.initialized) return;
    while (!this.initialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async seed() {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      // Seed Departments
      this.departments = [
        { id: 'dept-1', name: 'Engineering', description: 'Software and systems engineering' },
        { id: 'dept-2', name: 'Human Resources', description: 'People and culture' },
        { id: 'dept-3', name: 'Management', description: 'Executive leadership' },
      ];

      // Seed Employees
      this.employees = [
        {
          id: 'emp-admin',
          name: 'System Admin',
          email: 'admin@enterprise.com',
          role: UserRole.ADMIN,
          departmentId: 'dept-3',
          joiningDate: '2020-01-01',
          password: hashedPassword,
          leaveBalance: 20
        },
        {
          id: 'emp-hr',
          name: 'Jane HR',
          email: 'hr@enterprise.com',
          role: UserRole.HR,
          departmentId: 'dept-2',
          joiningDate: '2021-06-15',
          password: hashedPassword,
          leaveBalance: 25
        },
        {
          id: 'emp-manager',
          name: 'Manager Bob',
          email: 'manager@enterprise.com',
          role: UserRole.MANAGER,
          departmentId: 'dept-1',
          joiningDate: '2019-03-20',
          password: hashedPassword,
          leaveBalance: 15
        },
        {
          id: 'emp-dev1',
          name: 'Alice Developer',
          email: 'alice@enterprise.com',
          role: UserRole.EMPLOYEE,
          departmentId: 'dept-1',
          joiningDate: '2022-01-10',
          password: hashedPassword,
          managerId: 'emp-manager',
          leaveBalance: 12
        }
      ];

      // Connect departments to managers
      this.departments[0].managerId = 'emp-manager';
      this.departments[1].managerId = 'emp-hr';
      this.departments[2].managerId = 'emp-admin';

      this.initialized = true;
    } catch (e) {
      console.error('Seeding failed', e);
    }
  }

  // --- Employee Service Methods ---
  async getEmployees(params: { departmentId?: string; role?: UserRole; search?: string }) {
    let filtered = [...this.employees];
    if (params.departmentId) filtered = filtered.filter(e => e.departmentId === params.departmentId);
    if (params.role) filtered = filtered.filter(e => e.role === params.role);
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(e => e.name.toLowerCase().includes(s) || e.email.toLowerCase().includes(s));
    }
    return filtered;
  }

  async findEmployeeById(id: string) {
    return this.employees.find(e => e.id === id);
  }

  async findEmployeeByEmail(email: string) {
    return this.employees.find(e => e.email === email);
  }

  async createEmployee(employee: Omit<Employee, 'id'>) {
    const newEmployee = { ...employee, id: `emp-${Date.now()}` };
    this.employees.push(newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: string, updates: Partial<Employee>) {
    const index = this.employees.findIndex(e => e.id === id);
    if (index === -1) return null;
    this.employees[index] = { ...this.employees[index], ...updates };
    return this.employees[index];
  }

  // --- Leave Management Methods ---
  async createLeaveRequest(request: Omit<LeaveRequest, 'id'>) {
    const newRequest = { ...request, id: `leave-${Date.now()}` };
    this.leaveRequests.push(newRequest);
    return newRequest;
  }

  async getLeaveRequests(employeeId?: string, managerId?: string) {
    let requests = [...this.leaveRequests];
    if (employeeId) {
      requests = requests.filter(r => r.employeeId === employeeId);
    }
    if (managerId) {
      const teamIds = this.employees.filter(e => e.managerId === managerId).map(e => e.id);
      requests = requests.filter(r => teamIds.includes(r.employeeId));
    }
    return requests;
  }

  async updateLeaveStatus(id: string, status: LeaveStatus, approverId: string) {
    const request = this.leaveRequests.find(r => r.id === id);
    if (!request) return null;
    
    request.status = status;
    request.approvedById = approverId;

    if (status === LeaveStatus.APPROVED) {
      const employee = this.employees.find(e => e.id === request.employeeId);
      if (employee) {
        // Calculate days (simple difference)
        const start = new Date(request.startDate);
        const end = new Date(request.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
        employee.leaveBalance -= days;
      }
    }
    return request;
  }

  // --- Performance Methods ---
  async createPerformanceReview(review: Omit<PerformanceReview, 'id'>) {
    const newReview = { ...review, id: `rev-${Date.now()}`, date: new Date().toISOString() };
    this.performanceReviews.push(newReview);
    return newReview;
  }

  async getPerformanceHistory(employeeId: string) {
    return this.performanceReviews.filter(r => r.employeeId === employeeId);
  }

  // --- Department Methods ---
  async getDepartments() {
    return this.departments;
  }
}

export const db = new DataStore();
