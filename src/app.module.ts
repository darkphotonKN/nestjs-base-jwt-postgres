import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/entities/user.entity';

import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password', // postgres docker version, change in production
      database: 'UBER-DB',
      entities: [User],
      synchronize: true, // set to false in production
    }),
    AuthModule,
  ],

  controllers: [AppController],
  providers: [],
})
export class AppModule {}
