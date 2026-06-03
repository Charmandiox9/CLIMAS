import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let userService: UserService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      firstName: 'Carlos',
      lastName: 'Mendez',
      rut: '11111111-1',
      email: 'carlos@test.com',
      password: 'secret123',
    };

    it('debe crear un usuario correctamente cuando no existe duplicado', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        firstName: 'Carlos',
        lastName: 'Mendez',
        email: 'carlos@test.com',
        roles: [],
      });

      const result = await userService.create(createDto);

      expect(result.id).toBe('user-1');
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('debe hashear la contraseña antes de guardar', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'user-1' });

      await userService.create(createDto);

      const createdData = mockPrisma.user.create.mock.calls[0][0].data;
      expect(createdData.password).not.toBe('secret123');
      const isHashed = await bcrypt.compare('secret123', createdData.password);
      expect(isHashed).toBe(true);
    });

    it('debe lanzar BadRequestException si el RUT ya existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing' });

      await expect(userService.create(createDto)).rejects.toThrow(
        new BadRequestException('El RUT ya existe'),
      );
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException si el email ya existe', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'existing' });

      await expect(userService.create(createDto)).rejects.toThrow(
        new BadRequestException('El email ya existe'),
      );
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debe retornar la lista de usuarios', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          firstName: 'Ana',
          lastName: 'Soto',
          rut: '11111111-1',
          email: 'ana@test.com',
          phone: null,
          roles: ['PATIENT'],
          isActive: true,
        },
      ];
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await userService.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('ana@test.com');
    });

    it('debe retornar array vacío si no hay usuarios', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);

      const result = await userService.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('debe retornar el usuario correspondiente al id', async () => {
      const mockUser = { id: 'user-1', firstName: 'Pedro', email: 'pedro@test.com' };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.findOne('user-1');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('debe retornar null si el usuario no existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await userService.findOne('id-inexistente');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('debe lanzar BadRequestException si el usuario no existe', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        userService.update('id-inexistente', { firstName: 'Nuevo' }),
      ).rejects.toThrow(new BadRequestException('Usuario no encontrado'));
    });

    it('debe actualizar y hashear la contraseña si se proporciona una nueva', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrisma.user.update.mockResolvedValue({
        id: 'user-1',
        firstName: 'Updated',
      });

      await userService.update('user-1', { firstName: 'Updated', password: 'nuevaPass' });

      const updateArgs = mockPrisma.user.update.mock.calls[0][0];
      expect(updateArgs.data.password).not.toBe('nuevaPass');
      const isHashed = await bcrypt.compare('nuevaPass', updateArgs.data.password);
      expect(isHashed).toBe(true);
    });

    it('debe actualizar sin modificar password si no se envía', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrisma.user.update.mockResolvedValue({ id: 'user-1', firstName: 'Nuevo' });

      await userService.update('user-1', { firstName: 'Nuevo' });

      const updateArgs = mockPrisma.user.update.mock.calls[0][0];
      expect(updateArgs.data.password).toBeUndefined();
    });
  });
});
