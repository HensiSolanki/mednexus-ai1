import { User, LoginCredentials, SignupData } from '../types/auth';

// Dummy users database (in a real app, this would be a backend API)
const DUMMY_USERS: (User & { password: string })[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    password: 'password123',
    name: 'John Doe',
    role: 'patient',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    email: 'dr.smith@example.com',
    password: 'doctor123',
    name: 'Dr. Sarah Smith',
    role: 'doctor',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    email: 'admin@mednexus.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    email: 'jane.patient@example.com',
    password: 'patient123',
    name: 'Jane Patient',
    role: 'patient',
    createdAt: new Date('2024-02-01'),
  },
];

const STORAGE_KEY = 'mednexus_auth';

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = DUMMY_USERS.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const { password, ...userWithoutPassword } = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
  },

  // Signup
  signup: async (data: SignupData): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    const existingUser = DUMMY_USERS.find(u => u.email === data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: data.role || 'patient',
      createdAt: new Date(),
    };

    // Add to dummy database
    DUMMY_USERS.push({ ...newUser, password: data.password });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    
    return newUser;
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Get current user from storage
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    try {
      const user = JSON.parse(stored);
      // Convert createdAt back to Date
      user.createdAt = new Date(user.createdAt);
      return user;
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEY);
  },
};


