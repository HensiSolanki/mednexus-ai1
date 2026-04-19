import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

const DEMO_USERS: (AuthUser & { password: string })[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    password: 'password123',
    name: 'John Doe',
    role: 'patient',
  },
  {
    id: '2',
    email: 'dr.smith@example.com',
    password: 'doctor123',
    name: 'Dr. Sarah Smith',
    role: 'doctor',
  },
  {
    id: '3',
    email: 'admin@mednexus.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
  },
];

@Injectable()
export class AuthService {
  login(email: string, password: string): { accessToken: string; user: AuthUser } {
    const u = DEMO_USERS.find((x) => x.email === email && x.password === password);
    if (!u) throw new UnauthorizedException('Invalid email or password');
    const { password: _p, ...user } = u;
    return {
      accessToken: `demo-${user.id}-${Date.now()}`,
      user,
    };
  }

  signup(body: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }): { accessToken: string; user: AuthUser } {
    if (DEMO_USERS.some((x) => x.email === body.email)) {
      throw new ConflictException('User already exists');
    }
    const user: AuthUser = {
      id: Date.now().toString(),
      email: body.email,
      name: body.name,
      role: body.role ?? 'patient',
    };
    DEMO_USERS.push({ ...user, password: body.password });
    return {
      accessToken: `demo-${user.id}-${Date.now()}`,
      user,
    };
  }
}
