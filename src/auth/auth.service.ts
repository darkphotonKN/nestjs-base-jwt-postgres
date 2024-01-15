import * as bcrypt from 'bcrypt';
import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDTO } from './dtos/create-user.dto';
import { SignInDTO } from './dtos/signin.dto';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  // gets list of all users
  async getUsers(): Promise<User[]> {
    const users = await this.usersRepo.find();

    return users;
  }

  // signs up new user and saves to db
  async signup({ name, email, password }: CreateUserDTO): Promise<User> {
    // hash password before saving
    const salt = 10;
    const hash = await bcrypt.hash(password, salt);

    try {
      // create a new user
      const newUser = this.usersRepo.create({ name, email, password: hash });

      // save new user to db
      return await this.usersRepo.save(newUser);
    } catch (err) {
      // throw error if user can't be saved
      throw new HttpException(err.message, 500);
    }
  }

  // authenticate user signin and provide user info
  async signin({ email, password }: SignInDTO): Promise<User> {
    // check if user even exists
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    // check if password is correct
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid login credentials.');
    }

    return user;
  }
}
