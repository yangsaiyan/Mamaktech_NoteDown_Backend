import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from './entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Secret } from './entities/secrets.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Secret)
    private readonly secretsRepository: Repository<Secret>,
    private jwtService: JwtService,
  ) {}

  async registerUser(): Promise<{
    user: User;
    secretWords: string[];
    accessToken: string;
  }> {
    const randomSecrets = await this.secretsRepository
      .createQueryBuilder('secret')
      .orderBy('RANDOM()')
      .limit(4)
      .getMany();

    const secretIds = randomSecrets.map((secret) => secret.id);
    const secretWords = randomSecrets.map((secret) => secret.secret);

    const user = new User();
    user.secret = secretIds;
    const savedUser = await this.usersRepository.save(user);

    const payload = { sub: savedUser.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: savedUser,
      secretWords: secretWords,
      accessToken: accessToken,
    };
  }

  async validateUserBySecrets(
    userId: number,
    providedSecrets: string[],
  ): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) return null;

    const userSecrets = await this.secretsRepository
      .createQueryBuilder('secret')
      .where('secret.id IN (:...ids)', { ids: user.secret })
      .getMany();

    const userSecretWords = userSecrets.map((secret) => secret.secret);

    const allSecretsMatch = providedSecrets.every((secret) =>
      userSecretWords.includes(secret),
    );

    return allSecretsMatch ? user : null;
  }

  async loginWithSecrets(
    secrets: string[],
  ): Promise<{ user: User; accessToken: string }> {
    const user = await this.validateUserBySecretsOnly(secrets);

    if (!user) {
      throw new UnauthorizedException('Invalid secrets');
    }

    const payload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      user,
      accessToken,
    };
  }

  async validateUserBySecretsOnly(
    providedSecrets: string[],
  ): Promise<User | null> {
    const secrets = await this.secretsRepository
      .createQueryBuilder('secret')
      .where('secret.secret IN (:...words)', { words: providedSecrets })
      .getMany();

    const secretIds = secrets.map((secret) => secret.id);

    if (secretIds.length !== providedSecrets.length) {
      return null;
    }

    const users = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.secret @> ARRAY[:...secretIds]::integer[]', { secretIds })
      .andWhere('array_length(user.secret, 1) = :length', {
        length: secretIds.length,
      })
      .getMany();

    if (users.length === 1) {
      return users[0];
    }
    return null;
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
