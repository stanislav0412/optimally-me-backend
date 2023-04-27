import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '../../common/src/utils/config/config.service';
import * as crypto from 'crypto';
import { Transaction } from 'sequelize/types';
import { User } from '../../users/src/models';
import { SENSITIVE_SKIN_QUESTION, TypeformQuizType } from '../../common/src/resources/typeform/typeform-quiz-types';
import { UserQuiz } from './models/user-quiz.entity';
import axios from 'axios';
import { KlaviyoService } from '../../klaviyo/src/klaviyo.service';
import { KlaviyoModelService } from '../../klaviyo/src/klaviyo-model.service';
import { UsersTagsService } from '../../users-tags/src/users-tags.service';

@Injectable()
export class TypeformService {
    constructor(
        private readonly configService: ConfigService,
        private readonly klaviyoService: KlaviyoService,
        private readonly klavitoModelService: KlaviyoModelService,
        private readonly usersTagsService: UsersTagsService,
    ) { }

    private getHeaders(): Record<string, string | number | boolean> {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.configService.get('TYPEFORM_PERSONAL_TOKEN')}`
        };
    }

    verifySignature(signature: string, rawBody: Buffer): boolean {
        const hash = crypto
            .createHmac('sha256', this.configService.get('TYPEFORM_SECRET'))
            .update(rawBody)
            .digest('base64');

        return hash === signature;
    }

    async saveSensitiveQuizParameters(user: User, variables: { key: string, type: string, value: string | number }[], transaction?: Transaction): Promise<void> {
        const sensivitiveSkin = variables.find(variable => variable.key === SENSITIVE_SKIN_QUESTION);
        const isSensitiveSkin = sensivitiveSkin.value === 'True';

        await user.additionalField.update({ isSensitiveSkin }, { transaction });

        const tagsToCreate = variables.map(variable => ({
            userId: user.id,
            type: variable.type,
            key: variable.key,
            value: variable.value,
            quizType: TypeformQuizType.sensitiveSkin,
        }));
        await this.usersTagsService.bulkCreate(tagsToCreate, transaction);
    }

    async saveSelfAssesmentQuizParameters(variables: { key: string, type: string, value: string | number }[], user: User, transaction?: Transaction): Promise<void> {
        await user.additionalField.update({ isSelfAssesmentQuizCompleted: true }, { transaction });

        const klaviyoProfile = await this.klavitoModelService.getKlaviyoProfile(user, transaction);
        await this.klaviyoService.patchProfile({ type: 'profile', attributes: { properties: { Self_Assessment_Quiz_Completed: true } } }, klaviyoProfile.klaviyoUserId);

        const tagsToCreate = variables.map(variable => ({
            userId: user.id,
            type: variable.type,
            key: variable.key,
            value: variable.value,
            quizType: TypeformQuizType.selfAssesment,
        }));
        await this.usersTagsService.bulkCreate(tagsToCreate, transaction);
    }

    async getFormResponse(userQuiz: UserQuiz): Promise<any> {
        const url = `https://api.typeform.com/forms/${userQuiz.typeformFormId}/responses`;

        const response = await axios.get(url, { headers: this.getHeaders() })
            .catch(err => {
                console.log(err.message);
                throw new UnprocessableEntityException({
                    message: err.message,
                    errorCode: 'TYPEFORM_API_ERROR',
                    statusCode: HttpStatus.UNPROCESSABLE_ENTITY
                });
            });

        if (response?.data?.items?.length && response?.data?.items[0]) {
            return response?.data?.items[0];
        }

        return null;
    }
}
