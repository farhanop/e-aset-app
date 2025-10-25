// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { MasterDataModule } from './master-data/master-data.module';
import { AssetsModule } from './assets/assets.module';
import { AssetLifecycleModule } from './asset-lifecycle/asset-lifecycle.module';
import { JwtService } from '@nestjs/jwt';
import { SlidingThrottlerGuard } from './common/guards/sliding-throttler.guard';
import { JwtStrategy } from './auth/jwt.strategy';
import { LocalStrategy } from './auth/local.strategy';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 1800, // Waktu dalam detik
        limit: 50, // Jumlah maksimum permintaan dalam jangka waktu ttl
      },
    ]),

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
    JwtStrategy,
    LocalStrategy,
    SlidingThrottlerGuard,

    {
      provide: APP_GUARD,
      useClass: SlidingThrottlerGuard,
    },
  ],
})
export class AppModule {}
