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
import { JwtService } from '@nestjs/jwt';

type JwtSignPayload = {
  sub: number;
  username: string;
};

@Injectable()
export class AuthService {
  constructor(
    // repository injection
    @InjectRepository(User) private usersRepo: Repository<User>,
    // jwt service injection
    private jwtService: JwtService,
  ) {}

  async getUser(email: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { email } });

    if (user) {
      return user;
    }
  }

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
      // find if user exists already to prevent duplicate users
      const user = await this.getUser(email);

      if (user) {
        console.log('User found while attempting to signup:', user);
        throw new HttpException('User already exists', 500);
      }

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
  async signin({
    email,
    password,
  }: SignInDTO): Promise<{ user: User; accessToken: string }> {
    // check if user even exists before authenticating
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    // check if password is correct
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid login credentials.');
    }

    // if successful, generate jwt token and return user
    const jwtSignPayload: JwtSignPayload = {
      sub: user.id,
      username: user.name,
    };
    const accessToken = this.generateJwtToken(jwtSignPayload);
    return {
      user,
      accessToken,
    };
  }

  // generate jwt token
  generateJwtToken(payload: JwtSignPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }
}
