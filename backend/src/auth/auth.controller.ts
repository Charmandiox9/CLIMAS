import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener un JWT' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        message: 'Login exitoso',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '12345678-1234-1234-1234-123456789012',
          firstName: 'John',
          lastName: 'Doe',
          email: 'jhondoe@climas.com',
          roles: ['PATIENT'],
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
    schema: {
      example: {
        message: 'Credenciales inválidas',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  signIn(@Body() signInDto: LoginDto) {
    return this.authService.login(signInDto.email, signInDto.password);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo paciente' })
  @ApiResponse({
    status: 201,
    description: 'Registro exitoso',
    schema: {
      example: {
        message: 'Registro exitoso',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '12345678-1234-1234-1234-123456789012',
          firstName: 'John',
          lastName: 'Doe',
          email: 'jhondoe@climas.com',
          roles: ['PATIENT'],
        },
      },
    },
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
