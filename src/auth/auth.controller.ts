import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, CreateUserDto, UpdateUserDto, RegisterUserDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { User } from './entities/user.entity';
import { LoginResponse } from './interfaces/login-response';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    //console.log(createUserDto)
    return this.authService.create(createUserDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    //console.log(createUserDto)
    return this.authService.login(loginDto);
  }
  @Post('/register')
  register(@Body() registerUserDto: RegisterUserDto) {
    //console.log(createUserDto)
    return this.authService.register(registerUserDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Request() request: Request) {
    if (!request['user'])
      throw new Error('property user doesnt founded');

    this.authService.findUserById(request['user']);
    return this.authService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('check-token')
  checkToken(@Request() request: Request): LoginResponse {
    if (!request['user'])
      throw new Error('property user doesnt founded');

    const user = request['user'] as User;
    //console.log({ token });
    //return ' hola mundo1';
    const token = this.authService.getJwtToken({ id: user._id });

    return { token, user }
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    //return ' hola mundo 2';
    return this.authService.findOne(+id);
  }



  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateUserDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
