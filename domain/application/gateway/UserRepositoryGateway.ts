import { User, NewUser } from "../../entities/User";

export interface UserRepositoryGateway {
  findByUsername(username: string): Promise<User | undefined>;
  create(data: NewUser & { password: string }): Promise<User>;
}
