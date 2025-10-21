import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core'; // 1. Import APP_GUARD
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // 2. Import Throttler
import { ServeStaticModule } from '@nestjs/serve-static'; // Tambahkan import ini
import { join } from 'path'; // Tambahkan import ini
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

    ThrottlerModule.forRoot([{
      ttl: 600000, // Waktu dalam detik untuk menghitung ulang permintaan
      limit: 50,  // Izinkan 10 permintaan dari IP yang sama dalam 1 menit
    }]),

    // Tambahkan ServeStaticModule untuk melayani file statis
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

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