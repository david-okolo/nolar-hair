import { User } from "../../../src/entities/user.entity";

export class MockUserRepository {

    user: User = {
        id: 1,
        username: 'test@test.com',
        password: 'password'
    }

    async findOne() {
        return this.user;
    }

}