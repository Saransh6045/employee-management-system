import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../services/dataService';
import { generateToken, authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole, LeaveStatus } from '../../types';
import { auditLog } from '../middleware/system';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user
 */
router.post('/login', async (req, res) => {
  await db.ensureInitialized();
  const { email, password } = req.body;
  const user = await db.findEmployeeByEmail(email);

  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  });

  res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

// --- Employee Routes ---
router.get('/employees', authenticate, async (req: AuthRequest, res) => {
  await db.ensureInitialized();
  const { departmentId, role, search } = req.query;
  const user = req.user!;

  let employees = await db.getEmployees({
    departmentId: departmentId as string,
    role: role as UserRole,
    search: search as string
  });

  // Role-based filtering
  if (user.role === UserRole.MANAGER) {
    // Managers see their team
    employees = employees.filter(e => e.managerId === user.id || e.id === user.id);
  } else if (user.role === UserRole.EMPLOYEE) {
    // Employees see only themselves
    employees = employees.filter(e => e.id === user.id);
  }

  res.json(employees);
});

router.post('/employees', authenticate, authorize([UserRole.ADMIN, UserRole.HR]), auditLog('CREATE', 'EMPLOYEE'), async (req, res) => {
  const newEmp = await db.createEmployee(req.body);
  res.status(201).json(newEmp);
});

// --- Leave Routes ---
router.post('/leaves', authenticate, auditLog('APPLY', 'LEAVE'), async (req: AuthRequest, res) => {
  const user = req.user!;
  const request = await db.createLeaveRequest({
    ...req.body,
    employeeId: user.id,
    status: LeaveStatus.PENDING,
    appliedDate: new Date().toISOString()
  });
  res.status(201).json(request);
});

router.get('/leaves', authenticate, async (req: AuthRequest, res) => {
  const user = req.user!;
  const requests = await db.getLeaveRequests(
    user.role === UserRole.EMPLOYEE ? user.id : undefined,
    user.role === UserRole.MANAGER ? user.id : undefined
  );
  res.json(requests);
});

router.patch('/leaves/:id/status', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER]), auditLog('APPROVE_REJECT', 'LEAVE'), async (req: AuthRequest, res) => {
  const { status } = req.body;
  const updated = await db.updateLeaveStatus(req.params.id, status, req.user!.id);
  if (!updated) return res.status(404).json({ message: 'Leave request not found' });
  res.json(updated);
});

// --- Performance Routes ---
router.post('/performance', authenticate, authorize([UserRole.ADMIN, UserRole.MANAGER]), auditLog('RATE', 'PERFORMANCE'), async (req: AuthRequest, res) => {
  const review = await db.createPerformanceReview({
    ...req.body,
    reviewerId: req.user!.id
  });
  res.status(201).json(review);
});

router.get('/performance/:employeeId', authenticate, async (req: AuthRequest, res) => {
  const history = await db.getPerformanceHistory(req.params.employeeId);
  res.json(history);
});

// --- Department Routes ---
router.get('/departments', authenticate, async (req, res) => {
  const departments = await db.getDepartments();
  res.json(departments);
});

export default router;
