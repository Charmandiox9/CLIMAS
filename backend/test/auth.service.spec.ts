import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwt = {
    signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
  };

  const mockUserService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('debe retornar token y datos del usuario cuando las credenciales son válidas', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'juan@test.com',
        password: hashedPassword,
        roles: ['PATIENT'],
      });

      const result = await authService.login('juan@test.com', 'password123');

      expect(result.message).toBe('Login exitoso');
      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('juan@test.com');
      expect(result.user.roles).toContain('PATIENT');
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login('noexiste@test.com', 'cualquier'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      const hashedPassword = await bcrypt.hash('passwordCorrecto', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'juan@test.com',
        password: hashedPassword,
        roles: ['PATIENT'],
      });

      await expect(
        authService.login('juan@test.com', 'passwordIncorrecto'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerDto = {
      firstName: 'Ana',
      lastName: 'Lopez',
      rut: '12345678-9',
      email: 'ana@test.com',
      password: 'password123',
    };

    it('debe registrar un nuevo usuario y retornar un token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-1',
        email: 'ana@test.com',
        roles: ['PATIENT'],
      });

      const result = await authService.register(registerDto);

      expect(result.message).toBe('Registro exitoso');
      expect(result.access_token).toBe('mock-jwt-token');
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('debe hashear la contraseña antes de guardar', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-1',
        email: 'ana@test.com',
        roles: ['PATIENT'],
      });

      await authService.register(registerDto);

      const createdData = mockPrisma.user.create.mock.calls[0][0].data;
      expect(createdData.password).not.toBe('password123');
      const isHashed = await bcrypt.compare('password123', createdData.password);
      expect(isHashed).toBe(true);
    });

    it('debe lanzar ConflictException si el email o RUT ya están registrados', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });
});
