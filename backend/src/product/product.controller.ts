import { Controller, Post, Body, Get, Delete, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './create-product.dto';
import { CreateVariantDto } from './variants/create-variant.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
async create(@Body() dto: CreateProductDto) {
  console.log("📥 GELEN DTO ===>", dto);   // 🔥 ZORUNLU LOG
  return this.productService.create(dto);
}


  @Get()
  async findAll(@Query('search') search?: string) {
    return this.productService.findAll(search);
  }

  @Get('search')
  async search(@Query('name') name?: string) {
    return this.productService.findByName(name ?? '');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }

  @Get(':id/variants')
  async getVariants(@Param('id') id: string) {
    return this.productService.getVariants(id);
  }

  @Post(':id/variants')
  async upsertVariant(@Param('id') id: string, @Body() dto: CreateVariantDto) {
    return this.productService.upsertVariant(id, dto);
  }

  
}


