import { Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  @ApiOperation({ summary: 'Registrar la siguiente marca de asistencia del día' })
  async markAttendance(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub; 
    return this.attendanceService.markAttendance(userId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Obtener el historial de asistencia' })
  async getHistory(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.attendanceService.getHistory(userId);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener historial de asistencia de todo el personal (Solo Admin)' })
  async getAllAttendances() {
    return this.attendanceService.getAllAttendances();
  }
}
