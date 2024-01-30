import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateUserDTO } from './dtos/create-user.dto';
import { SignInDTO } from './dtos/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('users')
  // @Roles(RoleUser)
  @UseGuards(AuthGuard)
  getUsers() {
    return this.authService.getUsers();
  }

  @Post('signup')
  signup(@Body() body: CreateUserDTO) {
    return this.authService.signup(body);
  }

  @Post('signin')
  signin(@Body() body: SignInDTO) {
    return this.authService.signin(body);
  }
}
