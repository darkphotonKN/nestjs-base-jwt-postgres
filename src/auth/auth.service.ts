import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDTO } from './dtos/create-user.dto';

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
    try {
      // create a new user
      const newUser = this.usersRepo.create({ name, email, password });

      // save new user to db
      return await this.usersRepo.save(newUser);
    } catch (err) {
      // throw error if user can't be saved
      throw new HttpException(err.message, 500);
    }
  }

  login() {
    return 'logged in!';
  }
}
