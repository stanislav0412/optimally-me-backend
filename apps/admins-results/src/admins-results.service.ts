import { Inject, Injectable } from '@nestjs/common';
import { Recommendation } from '../../biomarkers/src/models/recommendations/recommendation.entity';
import { Repository } from 'sequelize-typescript';
import { Transaction } from 'sequelize/types';
import { BaseService } from '../../common/src/base/base.service';
import { IUserResult, UserResult } from './models/user-result.entity';
import { UserRecommendation } from 'apps/biomarkers/src/models/userRecommendations/user-recommendation.entity';

@Injectable()
export class AdminsResultsService extends BaseService<UserResult> {
  constructor(
    @Inject('USER_RESULT_MODEL') protected model: Repository<UserResult>,
    @Inject('RECOMMENDATION_MODEL') private readonly recommendationModel: Repository<Recommendation>,
    @Inject('USER_RECOMMENDATION_MODEL') private readonly userRecommendationModel: Repository<UserRecommendation>
  ) { super(model); }

  create(body: IUserResult, transaction?: Transaction): Promise<UserResult> {
    return this.model.create({ ...body }, { transaction });
  }

  async bulkCreate(data: IUserResult[], transaction?: Transaction): Promise<UserResult[]> {
    return this.model.bulkCreate(data as any, { transaction });
  }

  async attachRecommendations(userResults: UserResult[], userId: number, transaction?: Transaction): Promise<void> {
    const userRecommendationsToCreate = [];
    const filteredUserResults = userResults.filter(userResult => userResult.filterId && userResult.recommendationRange);

    if (!filteredUserResults.length) {
      return;
    }

    const recommendations = await this.recommendationModel
      .scope([
        { method: ['byFilterIdAndType', filteredUserResults.map(userResult => ({ filterId: userResult.filterId, type: userResult.recommendationRange }))] }
      ])
      .findAll({ transaction });

    const userResultsMap = {};
    filteredUserResults.forEach(userResult => {
      userResultsMap[userResult.filterId] = userResult;
    });

    recommendations.forEach(recommendation => {
      if (userResultsMap[recommendation.filterRecommendations[0].filterId]) {
        userRecommendationsToCreate.push({
          userId: userId,
          recommendationId: recommendation.id,
          userResultId: userResultsMap[recommendation.filterRecommendations[0].filterId].id
        });
      }
    });

    await this.userRecommendationModel.bulkCreate(userRecommendationsToCreate, { transaction });
  }

  async dettachFilters(filterIds: number[], transaction?:Transaction): Promise<void> {
    await this.model
      .scope([{ method: ['byFilterId', filterIds] }])
      .update({ filterId: null }, { transaction } as any);
  }
}
