import {
  CreatePaymentDto,
  PaymentFiltersDto,
  PaymentResponseDto,
  UpdatePaymentDto,
} from '@/application/dtos';
import {
  CreatePaymentUseCase,
  GetPaymentUseCase,
  ListPaymentsUseCase,
  UpdatePaymentUseCase,
} from '@/application/use-cases';
import type { Payment } from '@/domain';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('api/payment')
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase,
    private readonly listPaymentsUseCase: ListPaymentsUseCase,
    private readonly updatePaymentUseCase: UpdatePaymentUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo pagamento' })
  @ApiResponse({
    status: 201,
    description: 'Pagamento criado com sucesso',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  async createPayment(
    @Body(ValidationPipe) createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    return await this.createPaymentUseCase.execute(createPaymentDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pagamento por ID' })
  @ApiResponse({
    status: 200,
    description: 'Pagamento encontrado',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  async getPayment(@Param('id') id: string): Promise<Payment> {
    return await this.getPaymentUseCase.execute(id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pagamentos' })
  @ApiResponse({
    status: 200,
    description: 'Pagamentos recuperados com sucesso',
    type: [PaymentResponseDto],
  })
  async listPayments(
    @Query(ValidationPipe) filters: PaymentFiltersDto,
  ): Promise<Payment[]> {
    return await this.listPaymentsUseCase.execute(filters);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar pagamento por ID' })
  @ApiResponse({
    status: 200,
    description: 'Pagamento atualizado com sucesso',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  async updatePayment(
    @Param('id') id: string,
    @Body(ValidationPipe) updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    return await this.updatePaymentUseCase.execute(id, updatePaymentDto);
  }
}
