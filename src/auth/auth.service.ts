import { BadRequestException, Injectable, InternalServerErrorException, Request, UnauthorizedException } from '@nestjs/common';


import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs'


import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

import { LoginDto, UpdateUserDto, CreateUserDto, RegisterUserDto } from './dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService
  ) {

  }
  async create(createUserDto: CreateUserDto): Promise<User> {

    try {
      const { password, ...userData } = createUserDto;
      const newUser = new this.userModel(
        {
          password: bcryptjs.hashSync(password, 10),
          ...userData
        }
      );
      await newUser.save();
      const { password: _, ...user } = newUser.toJSON();
      return user;
    } catch (error) {
      //console.log(error.code)
      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} already exist`);
      }
      else {
        throw new InternalServerErrorException(error.message)
      }
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    try {
      const { email, password } = loginDto;
      const user = await this.userModel.findOne({ email });


      if (!user) {
        throw new UnauthorizedException('Not valid credentials -email');
      }
      if (!bcryptjs.compareSync(password, user.password)) {
        throw new UnauthorizedException('Not valid credentials -password');
      }
      const { password: _, ...rest } = user.toJSON();
      return {
        user: rest,
        token: this.getJwtToken({ id: user.id })
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async checkUser(user: User): Promise<LoginResponse> {
    try {
      if (!user) {
        throw new UnauthorizedException('Not valid credentials -email');
      }

      const { password: _, ...rest } = user;
      return {
        user: rest,
        token: this.getJwtToken({ id: user._id })
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async register(regsiterUserDto: RegisterUserDto): Promise<LoginResponse> {

    const user: User = await this.create({ ...regsiterUserDto });

    return {
      user: user,
      token: this.getJwtToken({ id: user._id })
    }
  }
  getJwtToken(payload: JwtPayload) {
    //const payload = { sub: user.name, username: user.email };
    return this.jwtService.sign(payload);

  }


  findAll(): Promise<User[]> {

    return this.userModel.find();

  }

  findOne(id: number) {

    return `This action returns a #${id} auth`;
  }
  async findUserById(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id);
      const { password, ...rest } = user.toJSON();

      return rest;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // async checkToken(token: string, id: string): Promise<LoginResponse> {

  //   const user = await this.userModel.findById(id);
  //   console.log(user);
  //   return this.checkUser(user);
  // }

  update(id: number, updateAuthDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }


}
