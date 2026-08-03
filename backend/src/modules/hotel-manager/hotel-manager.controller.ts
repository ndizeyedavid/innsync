import { Controller, Get, Put, Post, Patch, Delete, Param, Body, UseGuards, Query, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { createId } from '@paralleldrive/cuid2';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { HotelManagerService } from './hotel-manager.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AssignRoomDto } from './dto/assign-room.dto';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { UpdateHousekeepingStatusDto } from './dto/update-housekeeping-status.dto';
import { AddChargeDto } from './dto/add-charge.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import { UpdateHotelSettingsDto } from './dto/update-hotel-settings.dto';
import { AdminSignUpDto } from './dto/admin-signup.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { IssueKeyDto } from './dto/issue-key.dto';

@ApiTags('hotel-manager')
@Controller('manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF, Role.CONCIERGE)
@ApiBearerAuth()
export class HotelManagerController {
  constructor(
    private readonly svc: HotelManagerService,
    private readonly notifications: NotificationsService,
  ) {}

  private async hotelId(user: AuthenticatedUser): Promise<string> {
    return this.svc.resolveUserHotel(user.sub);
  }

  // ── Upload ──

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'),
      filename: (_req: any, file: any, cb: (err: Error | null, name: string) => void) => {
        const ext = extname(file.originalname);
        cb(null, `${createId()}${ext}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image file' })
  uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    file: any,
  ): { url: string } {
    return { url: `/uploads/${file.filename}` };
  }

  // ── Dashboard ──

  @Get('dashboard')
  @ApiOperation({ summary: 'Get hotel dashboard metrics' })
  async getDashboard(@CurrentUser() user: AuthenticatedUser, @Query('days') days?: string) {
    const hid = await this.hotelId(user);
    return this.svc.getDashboard(hid, days ? parseInt(days, 10) : 7);
  }

  // ── Stays / Guests ──

  @Get('stays')
  @ApiOperation({ summary: 'List all stays for the hotel' })
  async listStays(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: string,
    @Query('skip') skip = '0',
    @Query('take') take = '50',
  ) {
    const hid = await this.hotelId(user);
    return this.svc.listStays(hid, status as any, parseInt(skip, 10), parseInt(take, 10));
  }

  @Get('stays/:stayId')
  @ApiOperation({ summary: 'Get a single stay detail' })
  async getStay(@CurrentUser() user: AuthenticatedUser, @Param('stayId') stayId: string) {
    const hid = await this.hotelId(user);
    return this.svc.getStay(hid, stayId);
  }

  @Post('stays/:stayId/check-in')
  @ApiOperation({ summary: 'Manual check-in for a stay' })
  async checkIn(@Param('stayId') stayId: string, @CurrentUser() user: AuthenticatedUser) {
    const hid = await this.hotelId(user);
    return this.svc.checkIn(hid, stayId, user.sub);
  }

  @Post('stays/:stayId/check-out')
  @ApiOperation({ summary: 'Manual check-out for a stay' })
  async checkOut(@Param('stayId') stayId: string, @CurrentUser() user: AuthenticatedUser) {
    const hid = await this.hotelId(user);
    return this.svc.checkOut(hid, stayId, user.sub);
  }

  @Post('stays/:stayId/cancel')
  @ApiOperation({ summary: 'Cancel a stay' })
  async cancelStay(@Param('stayId') stayId: string, @CurrentUser() user: AuthenticatedUser) {
    const hid = await this.hotelId(user);
    return this.svc.cancelStay(hid, stayId, user.sub);
  }

  @Put('stays/:stayId/assign-room')
  @ApiOperation({ summary: 'Assign a room to a stay' })
  async assignRoom(@Param('stayId') stayId: string, @Body() dto: AssignRoomDto, @CurrentUser() user: AuthenticatedUser) {
    const hid = await this.hotelId(user);
    return this.svc.assignRoom(hid, stayId, dto.roomId, user.sub);
  }

  // ── Orders ──

  @Get('orders')
  @ApiOperation({ summary: 'List all orders for the hotel' })
  async listOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: string,
    @Query('skip') skip = '0',
    @Query('take') take = '50',
  ) {
    const hid = await this.hotelId(user);
    return this.svc.listOrders(hid, status as any, parseInt(skip, 10), parseInt(take, 10));
  }

  @Put('orders/:orderId/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const hid = await this.hotelId(user);
    return this.svc.updateOrderStatus(hid, orderId, dto, user.sub);
  }

  // ── Rooms ──

  @Get('rooms')
  @ApiOperation({ summary: 'List all rooms for the hotel' })
  async listRooms(@CurrentUser() user: AuthenticatedUser) {
    const hid = await this.hotelId(user);
    return this.svc.listRooms(hid);
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Create a new room' })
  async createRoom(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateRoomDto) {
    const hid = await this.hotelId(user);
    return this.svc.createRoom(hid, dto);
  }

  @Put('rooms/:id')
  @ApiOperation({ summary: 'Update room details' })
  async updateRoom(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateRoomDto) {
    const hid = await this.hotelId(user);
    return this.svc.updateRoom(hid, id, dto);
  }

  @Delete('rooms/:id')
  @ApiOperation({ summary: 'Delete a room' })
  async deleteRoom(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const hid = await this.hotelId(user);
    return this.svc.deleteRoom(hid, id);
  }

  // ── Housekeeping ──

  @Get('housekeeping')
  @ApiOperation({ summary: 'List housekeeping tasks for the hotel' })
  async listHousekeeping(@CurrentUser() user: AuthenticatedUser, @Query('status') status?: string) {
    const hid = await this.hotelId(user);
    return this.svc.listHousekeeping(hid, status);
  }

  @Put('housekeeping/:id/status')
  @ApiOperation({ summary: 'Update housekeeping task status' })
  async updateHousekeepingStatus(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateHousekeepingStatusDto) {
    const hid = await this.hotelId(user);
    return this.svc.updateHousekeepingStatus(hid, id, dto);
  }

  // ── Folio / Billing ──

  @Get('invoices')
  @ApiOperation({ summary: 'List historical invoices for the hotel' })
  async listInvoices(@CurrentUser() user: AuthenticatedUser) {
    const hid = await this.hotelId(user);
    return this.svc.listInvoices(hid);
  }

  @Get('folio/:stayId')
  @ApiOperation({ summary: 'Get guest folio' })
  async getFolio(@CurrentUser() user: AuthenticatedUser, @Param('stayId') stayId: string) {
    const hid = await this.hotelId(user);
    return this.svc.getFolio(hid, stayId);
  }

  @Post('folio/:stayId/charge')
  @ApiOperation({ summary: 'Add manual charge to guest folio' })
  async addCharge(@Param('stayId') stayId: string, @Body() dto: AddChargeDto, @CurrentUser() user: AuthenticatedUser) {
    const hid = await this.hotelId(user);
    return this.svc.addCharge(hid, stayId, dto, user.sub);
  }

  @Post('folio/:stayId/void-charge/:chargeId')
  @ApiOperation({ summary: 'Void a manual charge on guest folio' })
  async voidCharge(@Param('stayId') stayId: string, @Param('chargeId') chargeId: string, @CurrentUser() user: AuthenticatedUser) {
    const hid = await this.hotelId(user);
    return this.svc.voidCharge(hid, stayId, chargeId);
  }

  @Post('folio/:stayId/generate-invoice')
  @ApiOperation({ summary: 'Generate an invoice from current folio' })
  async generateInvoice(@Param('stayId') stayId: string, @CurrentUser() user: AuthenticatedUser) {
    const hid = await this.hotelId(user);
    return this.svc.generateInvoice(hid, stayId, user.sub);
  }

  @Post('folio/:stayId/record-payment')
  @ApiOperation({ summary: 'Record an admin-collected payment' })
  async recordPayment(@Param('stayId') stayId: string, @Body() dto: RecordPaymentDto, @CurrentUser() user: AuthenticatedUser) {
    const hid = await this.hotelId(user);
    return this.svc.recordPayment(hid, stayId, dto, user.sub);
  }

  @Patch('invoices/:id/status')
  @ApiOperation({ summary: 'Update invoice status (paid/void/cancel)' })
  async updateInvoiceStatus(@Param('id') id: string, @Body() dto: UpdateInvoiceStatusDto, @CurrentUser() user: AuthenticatedUser) {
    const hid = await this.hotelId(user);
    return this.svc.updateInvoiceStatus(hid, id, dto.status);
  }

  // ── Disputes ──

  @Get('disputes')
  @ApiOperation({ summary: 'List all disputes for the hotel' })
  async listDisputes(@CurrentUser() user: AuthenticatedUser) {
    const hid = await this.hotelId(user);
    return this.svc.listDisputes(hid);
  }

  @Patch('disputes/:id/resolve')
  @ApiOperation({ summary: 'Resolve a dispute' })
  async resolveDispute(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body('resolution') resolution: string) {
    if (!resolution || resolution.length > 600) throw new Error('Resolution must be 1-600 characters');
    const hid = await this.hotelId(user);
    return this.svc.resolveDispute(hid, id, resolution);
  }

  @Patch('disputes/:id/reject')
  @ApiOperation({ summary: 'Reject a dispute' })
  async rejectDispute(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body('resolution') resolution: string) {
    if (!resolution || resolution.length > 600) throw new Error('Resolution must be 1-600 characters');
    const hid = await this.hotelId(user);
    return this.svc.rejectDispute(hid, id, resolution);
  }

  // ── Itinerary ──

  @Get('itinerary')
  @ApiOperation({ summary: 'List itineraries for a stay' })
  async listItinerary(@CurrentUser() user: AuthenticatedUser, @Query('stayId') stayId: string) {
    const hid = await this.hotelId(user);
    return this.svc.listItinerary(hid, stayId);
  }

  // ── Digital Keys ──

  @Get('digital-keys')
  @ApiOperation({ summary: 'List digital keys for the hotel' })
  async listDigitalKeys(@CurrentUser() user: AuthenticatedUser) {
    const hid = await this.hotelId(user);
    return this.svc.listDigitalKeys(hid);
  }

  @Post('digital-keys/issue')
  @ApiOperation({ summary: 'Issue a digital key to a stay' })
  async issueDigitalKey(@CurrentUser() user: AuthenticatedUser, @Body() dto: IssueKeyDto) {
    const hid = await this.hotelId(user);
    return this.svc.issueDigitalKey(hid, dto);
  }

  @Post('digital-keys/:id/revoke')
  @ApiOperation({ summary: 'Revoke a digital key' })
  async revokeDigitalKey(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const hid = await this.hotelId(user);
    return this.svc.revokeDigitalKey(hid, id);
  }

  // ── Amenities ──

  @Get('amenities')
  @ApiOperation({ summary: 'List hotel amenities' })
  async listAmenities(@CurrentUser() user: AuthenticatedUser) {
    const hid = await this.hotelId(user);
    return this.svc.listAmenities(hid);
  }

  @Post('amenities')
  @ApiOperation({ summary: 'Create a new amenity' })
  async createAmenity(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAmenityDto) {
    const hid = await this.hotelId(user);
    return this.svc.createAmenity(hid, dto);
  }

  @Put('amenities/:id')
  @ApiOperation({ summary: 'Update an amenity' })
  async updateAmenity(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateAmenityDto) {
    const hid = await this.hotelId(user);
    return this.svc.updateAmenity(hid, id, dto);
  }

  @Delete('amenities/:id')
  @ApiOperation({ summary: 'Delete an amenity' })
  async deleteAmenity(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const hid = await this.hotelId(user);
    return this.svc.deleteAmenity(hid, id);
  }

  // ── Hotel Settings ──

  @Get('hotel')
  @ApiOperation({ summary: 'Get hotel settings' })
  async getHotelSettings(@CurrentUser() user: AuthenticatedUser) {
    const hid = await this.hotelId(user);
    return this.svc.getHotelSettings(hid);
  }

  @Put('hotel')
  @ApiOperation({ summary: 'Update hotel settings' })
  async updateHotelSettings(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateHotelSettingsDto) {
    const hid = await this.hotelId(user);
    return this.svc.updateHotelSettings(hid, dto);
  }

  // ── Audit Logs ──

  @Get('audit-logs')
  @ApiOperation({ summary: 'List audit logs for the hotel' })
  async listAuditLogs(@CurrentUser() user: AuthenticatedUser, @Query('limit') limit?: string) {
    const hid = await this.hotelId(user);
    return this.svc.listAuditLogs(hid, limit ? parseInt(limit, 10) : 100);
  }

  // ── Staff Management ──

  @Get('staff')
  @ApiOperation({ summary: 'List hotel staff' })
  async listStaff(@CurrentUser() user: AuthenticatedUser) {
    const hid = await this.hotelId(user);
    return this.svc.listStaff(hid);
  }

  @Post('staff/invite')
  @ApiOperation({ summary: 'Invite a new staff member' })
  async inviteStaff(@CurrentUser() user: AuthenticatedUser, @Body() dto: AdminSignUpDto) {
    const hid = await this.hotelId(user);
    return this.svc.inviteStaff(hid, dto);
  }

  @Patch('staff/:id/role')
  @ApiOperation({ summary: 'Update staff member role' })
  async updateStaffRole(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: { role: Role }) {
    const hid = await this.hotelId(user);
    return this.svc.updateStaffRole(hid, id, dto.role);
  }

  @Delete('staff/:id')
  @ApiOperation({ summary: 'Remove a staff member' })
  async removeStaff(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const hid = await this.hotelId(user);
    return this.svc.removeStaff(hid, id);
  }

  // ── Notifications ──

  @Get('notifications')
  @ApiOperation({ summary: 'List admin notifications' })
  listNotifications(@CurrentUser() user: AuthenticatedUser, @Query('limit') limit = '30') {
    return this.notifications.listMine(user.sub, parseInt(limit, 10));
  }

  @Patch('notifications/:id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markNotificationRead(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.notifications.markRead(user.sub, id);
  }

  // ── Feature Flags ──

  @Get('feature-flags')
  @ApiOperation({ summary: 'List feature flags' })
  async listFeatureFlags() {
    return this.svc.listFeatureFlags();
  }

  @Patch('feature-flags/:key')
  @ApiOperation({ summary: 'Update a feature flag' })
  async updateFeatureFlag(@Param('key') key: string, @Body() dto: { enabled?: boolean; rolloutPercent?: number }) {
    if (dto.rolloutPercent !== undefined && (dto.rolloutPercent < 0 || dto.rolloutPercent > 100)) {
      throw new Error('rolloutPercent must be between 0 and 100');
    }
    return this.svc.updateFeatureFlag(key, dto);
  }

  // ── Menu CRUD ──

  @Get('menu')
  @ApiOperation({ summary: 'List menu items' })
  async listMenuItems(@CurrentUser() user: AuthenticatedUser, @Query('category') category?: string) {
    const hid = await this.hotelId(user);
    return this.svc.listMenuItems(hid, category);
  }

  @Post('menu')
  @ApiOperation({ summary: 'Create a menu item' })
  async createMenuItem(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateMenuItemDto) {
    const hid = await this.hotelId(user);
    return this.svc.createMenuItem(hid, dto);
  }

  @Put('menu/:id')
  @ApiOperation({ summary: 'Update a menu item' })
  async updateMenuItem(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    const hid = await this.hotelId(user);
    return this.svc.updateMenuItem(hid, id, dto);
  }

  @Delete('menu/:id')
  @ApiOperation({ summary: 'Delete a menu item' })
  async deleteMenuItem(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const hid = await this.hotelId(user);
    return this.svc.deleteMenuItem(hid, id);
  }

  // ── Bulk Housekeeping ──

  @Post('housekeeping/bulk-status')
  @ApiOperation({ summary: 'Bulk update housekeeping task statuses' })
  async bulkHousekeepingStatus(@Body() dto: { ids: string[]; status: string; assignedTo?: string }) {
    if (!Array.isArray(dto.ids) || dto.ids.length === 0 || dto.ids.length > 50) {
      throw new Error('ids must be a non-empty array with max 50 items');
    }
    return this.svc.bulkHousekeepingStatus(dto.ids, dto.status, dto.assignedTo);
  }
}
