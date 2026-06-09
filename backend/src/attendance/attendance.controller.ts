import { Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
}
