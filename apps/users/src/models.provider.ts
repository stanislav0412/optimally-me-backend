import { User } from './models/user.entity';
import { UserWefitter } from "../../wefitter/src/models/user-wefitter.entity";

export const modelProviders = [
    {
        provide: 'USER_MODEL',
        useValue: User,
    },
    {
        provide: 'USER_WEFITTER_MODEL',
        useValue: UserWefitter,
    }
];
