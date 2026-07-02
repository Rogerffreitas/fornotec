import { UserRepositoryGateway } from "../../domain/application/gateway/UserRepositoryGateway";
import { User, NewUser } from "../../domain/entities/User";
import { users } from "./seed";
import { delay, nextId } from "./utils";

export class UserRepositoryGatewayImpl implements UserRepositoryGateway {
  async findByUsername(username: string): Promise<User | undefined> {
    return delay(users.find((u) => u.username === username));
  }

  async create(data: NewUser & { password: string }): Promise<User> {
    const user: User = { id: nextId(users), ...data };
    users.push(user);
    return delay(user);
  }
}
