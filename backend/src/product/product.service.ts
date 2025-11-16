import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './create-product.dto';
import { ProductVariant } from './product-variant.entity';
import { CreateVariantDto } from './variants/create-variant.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
  ) {}

  // 🔥 TEK VE DOĞRU CREATE METODU
  async create(dto: CreateProductDto): Promise<Product> {
    console.log("📦 SERVICE CREATE DTO:", dto);

    const { variants = [], ...productData } = dto as CreateProductDto & {
      variants?: CreateVariantDto[];
    };

    const newProduct = this.productRepository.create({
      ...productData,
      id: uuidv4(),
    });

    const savedProduct = await this.productRepository.save(newProduct);

    if (variants.length) {
      const variantEntities = variants.map((variant) =>
        this.productVariantRepository.create({
          id: uuidv4(),
          product: savedProduct,
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
        }),
      );

      const savedVariants = await this.productVariantRepository.save(
        variantEntities,
      );
      savedProduct.variants = savedVariants;
    }

    return savedProduct;
  }

  async findAll(search?: string): Promise<Product[]> {
    if (search && search.trim().length > 0) {
      return this.productRepository
        .createQueryBuilder('product')
        .where('product.name LIKE :search', { search: `%${search}%` })
        .getMany();
    }
    return this.productRepository.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async deleteProduct(id: string): Promise<{ message: string; deletedId: string }> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.remove(product);

    return {
      message: 'Product deleted successfully',
      deletedId: id,
    };
  }

  async findByName(term: string): Promise<Pick<Product, 'id' | 'name'>[]> {
    if (!term?.trim()) {
      return [];
    }
    const products = await this.productRepository.find({
      where: { name: ILike(`%${term}%`) },
      take: 10,
      order: { name: 'ASC' },
      select: ['id', 'name'],
    });
    return products;
  }

  async getVariants(productId: string): Promise<Array<Pick<ProductVariant, 'id' | 'size' | 'color' | 'stock'>>> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return (product.variants ?? []).map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
    }));
  }

  async upsertVariant(productId: string, dto: CreateVariantDto) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let variant = await this.productVariantRepository.findOne({
      where: {
        product: { id: productId },
        size: dto.size,
        color: dto.color,
      },
      relations: ['product'],
    });

    if (variant) {
      variant.stock = dto.stock;
    } else {
      variant = this.productVariantRepository.create({
        product,
        size: dto.size,
        color: dto.color,
        stock: dto.stock,
      });
    }

    const savedVariant = await this.productVariantRepository.save(variant);

    return {
      message: 'Variant added/updated',
      variant: {
        id: savedVariant.id,
        size: savedVariant.size,
        color: savedVariant.color,
        stock: savedVariant.stock,
      },
    };
  }
}
