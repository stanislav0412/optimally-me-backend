import { UserAdditionalField } from '../../users/src/models/user-additional-field.entity';
import { User } from '../../users/src/models';
import { Hl7Object } from './models/hl7-object.entity';
import { UserSample } from '../../samples/src/models/user-sample.entity';
import { File } from '../../files/src/models/file.entity';

export const modelProviders = [
    {
        provide: 'USER_MODEL',
        useValue: User,
    },
    {
        provide: 'USER_ADDITIONAL_FIELD_MODEL',
        useValue: UserAdditionalField,
    },
    {
        provide: 'HL7_OBJECT_MODEL',
        useValue: Hl7Object
    },
    {
        provide: 'USER_SAMPLE_MODEL',
        useValue: UserSample
    },
    {
        provide: 'FILE_MODEL',
        useValue: File,
    },
];
