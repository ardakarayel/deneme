import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '../config/database.config';
import { Product } from '../product/product.entity';
import { seedProducts } from './seed-data';

const AppDataSource = new DataSource(
  getDatabaseConfig({
    logging: false,
  }),
);

async function seed() {
  await AppDataSource.initialize();
  const productRepository = AppDataSource.getRepository(Product);

  for (const productData of seedProducts) {
    const existing = await productRepository.findOne({
      where: { name: productData.name },
    });

    if (existing) {
      continue;
    }

    const product = productRepository.create(productData);
    await productRepository.save(product);
  }

  console.log('🎯 Seeding tamamlandı');
}

seed()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });
