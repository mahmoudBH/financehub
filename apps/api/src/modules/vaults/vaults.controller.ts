import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VaultsService } from './vaults.service';
import { CreateVaultDto } from './dto/create-vault.dto';
import { AddFundsDto } from './dto/add-funds.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Vaults')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vaults')
export class VaultsController {
  constructor(private readonly vaultsService: VaultsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new savings vault' })
  create(@Req() req, @Body() createVaultDto: CreateVaultDto) {
    return this.vaultsService.create(req.user.id, createVaultDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vaults for current user' })
  findAll(@Req() req) {
    return this.vaultsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific vault' })
  findOne(@Req() req, @Param('id') id: string) {
    return this.vaultsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vault settings' })
  update(@Req() req, @Param('id') id: string, @Body() updateVaultDto: Partial<CreateVaultDto>) {
    return this.vaultsService.update(req.user.id, id, updateVaultDto);
  }

  @Patch(':id/add-funds')
  @ApiOperation({ summary: 'Add funds to a vault from an account' })
  addFunds(@Req() req, @Param('id') id: string, @Body() addFundsDto: AddFundsDto) {
    return this.vaultsService.addFunds(req.user.id, id, addFundsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vault and return funds to account' })
  remove(@Req() req, @Param('id') id: string) {
    return this.vaultsService.remove(req.user.id, id);
  }
}
