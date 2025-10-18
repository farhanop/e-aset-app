import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core'; // 1. Import APP_GUARD
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // 2. Import Throttler
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { MasterDataModule } from './master-data/master-data.module';
import { AssetsModule } from './assets/assets.module';
import { AssetLifecycleModule } from './asset-lifecycle/asset-lifecycle.module';

@Module({
  imports: [
    // 3. Konfigurasi Throttler (Rate Limiting) secara global
    ThrottlerModule.forRoot([{
      ttl: 60000, // Waktu dalam milidetik (60000 ms = 1 menit)
      limit: 10,  // Izinkan 10 permintaan dari IP yang sama dalam 1 menit
    }]),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'db_aset',
      entities: [__dirname + '/**/*.entity.*'],
      synchronize: false,
      autoLoadEntities: true, 
    }),
    UsersModule,
    AuthModule,
    RolesModule,
    MasterDataModule,
    AssetsModule,
    AssetLifecycleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 4. Terapkan ThrottlerGuard sebagai guard global di seluruh aplikasi
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
