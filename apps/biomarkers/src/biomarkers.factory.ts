import { Inject, Injectable } from '@nestjs/common';
import { BiomarkerTypes } from '../../common/src/resources/biomarkers/biomarker-types';
import { RecommendationTypes } from '../../common/src/resources/recommendations/recommendation-types';
import { Repository } from 'sequelize-typescript';
import { Transaction } from 'sequelize/types';
import { Biomarker } from './models/biomarker.entity';
import { CreateBiomarkerDto } from './models/create-biomarker.dto';
import { CreateFilterDto } from './models/filters/create-filter.dto';
import { Filter } from './models/filters/filter.entity';
import { CreateInteractionDto } from './models/interactions/create-interaction.dto';
import { Interaction } from './models/interactions/interaction.entity';
import { CreateRecommendationDto } from './models/recommendations/create-recommendation.dto';
import { FilterRecommendation } from './models/recommendations/filter-recommendation.entity';
import { FilterSex } from './models/filtersSex/filter-sex.entity';
import { FilterAge } from './models/filtersAge/filter-age.entity';
import { FilterEthnicity } from './models/filterEthnicity/filter-ethnicity.entity';
import { FilterOtherFeature } from './models/filterOtherFeatures/filter-other-feature.entity';

@Injectable()
export class BiomarkersFactory {
    constructor(
        @Inject('BIOMARKER_MODEL') readonly biomarkerModel: Repository<Biomarker>,
        @Inject('FILTER_MODEL') readonly filterModel: Repository<Filter>,
        @Inject('FILTER_RECOMMENDATION_MODEL') readonly filterRecommendationModel: Repository<FilterRecommendation>,
        @Inject('INTERACTION_MODEL') readonly interactionModel: Repository<Interaction>,
        @Inject('FILTER_SEX_MODEL') readonly filterSexModel: Repository<FilterSex>,
        @Inject('FILTER_AGE_MODEL') readonly filterAgeModel: Repository<FilterAge>,
        @Inject('FILTER_ETHNICITY_MODEL') readonly filterEthnicityModel: Repository<FilterEthnicity>,
        @Inject('FILTER_OTHER_FEATURE_MODEL') readonly filterOtherFeatureModel: Repository<FilterOtherFeature>,
    ) { }

    private async create(body: CreateBiomarkerDto & { templateId?: number, type: BiomarkerTypes }, transaction?: Transaction): Promise<Biomarker> {
        const biomarkerToCreate: any = body;
        const createdBiomarker = await this.biomarkerModel.create(biomarkerToCreate, { transaction });

        if (!body.filters || (body.filters && !body.filters.length)) {
            return createdBiomarker;
        }

        const promises = body.filters.map(filter => this.attachFilter(filter, createdBiomarker.id, transaction));

        await Promise.all(promises);

        return this.biomarkerModel
            .scope([{ method: ['byId', createdBiomarker.id] }, 'includeAll'])
            .findOne({ transaction });
    }

    async createBiomarker(body: CreateBiomarkerDto, transaction?: Transaction): Promise<Biomarker> {
        let templateId;
        if (body.ruleName) {
            const rule = await this.createRule(body, transaction);
            templateId = rule.id;
        } else {
            templateId = body.ruleId;
        }

        return this.create(Object.assign({ type: BiomarkerTypes.biomarker, templateId }, body), transaction);
    }

    async createRule(body: CreateBiomarkerDto, transaction?: Transaction): Promise<Biomarker> {
        return this.create(Object.assign({ type: BiomarkerTypes.rule }, body), transaction);
    }

    private async attachFilter(filter: CreateFilterDto, biomarkerId: number, transaction?: Transaction): Promise<void> {
        const filterToCreate: any = Object.assign({ biomarkerId }, filter);
        const createdFilter = await this.filterModel.create(filterToCreate, { transaction });

        await Promise.all([
            this.attachRecommendationsToFilter(filter.recommendation, createdFilter.id, transaction),
            this.attachInteractionsToFilter(filter.interactions, createdFilter.id, transaction),
            this.attachFilterCharacteristics(filter, createdFilter.id, transaction),
        ]);
    }

    private async attachRecommendationsToFilter(recommendation: CreateRecommendationDto, filterId: number, transaction?: Transaction): Promise<void> {
        const recommendationsToCreate = [];

        if (recommendation.criticalLow && recommendation.criticalLow.length) {
            recommendation.criticalLow.forEach(criticalLow => {
                recommendationsToCreate.push({
                    order: criticalLow.order,
                    recommendationId: criticalLow.recommendationId,
                    filterId,
                    type: RecommendationTypes.criticalLow
                });
            });
        }
        if (recommendation.low && recommendation.low.length) {
            recommendation.low.forEach(low => {
                recommendationsToCreate.push({
                    order: low.order,
                    recommendationId: low.recommendationId,
                    filterId,
                    type: RecommendationTypes.low
                });
            });
        }
        if (recommendation.high && recommendation.high.length) {
            recommendation.high.forEach(high => {
                recommendationsToCreate.push({
                    order: high.order,
                    recommendationId: high.recommendationId,
                    filterId,
                    type: RecommendationTypes.high
                });
            });
        }
        if (recommendation.criticalHigh && recommendation.criticalHigh.length) {
            recommendation.criticalHigh.forEach(criticalHigh => {
                recommendationsToCreate.push({
                    order: criticalHigh.order,
                    recommendationId: criticalHigh.recommendationId,
                    filterId,
                    type: RecommendationTypes.criticalHigh
                });
            });
        }

        await this.filterRecommendationModel.bulkCreate(recommendationsToCreate, { transaction });
    }

    private async attachInteractionsToFilter(interactions: CreateInteractionDto[], filterId: number, transaction?: Transaction): Promise<void> {
        const interactionsToCreate: any[] = interactions.map(interaction => Object.assign({ filterId }, interaction));
        await this.interactionModel.bulkCreate(interactionsToCreate, { transaction });
    }

    private async attachFilterCharacteristics(filter: CreateFilterDto, filterId: number, transaction?: Transaction): Promise<void> {
        const promises = [];
        if (filter.ages && filter.ages.length) {
            const agesToCreate: any[] = filter.ages.map(age => Object.assign({ filterId }, age));

            promises.push(
                this.filterAgeModel.bulkCreate(agesToCreate, { transaction })
            );
        }
        if (filter.sexes && filter.sexes.length) {
            const sexesToCreate: any[] = filter.sexes.map(sex => Object.assign({ filterId }, sex));

            promises.push(
                this.filterSexModel.bulkCreate(sexesToCreate, { transaction })
            );
        }
        if (filter.ethnicities && filter.ethnicities.length) {
            const ethnicitiesToCreate: any[] = filter.ethnicities.map(ethnicity => Object.assign({ filterId }, ethnicity));

            promises.push(
                this.filterEthnicityModel.bulkCreate(ethnicitiesToCreate, { transaction })
            );
        }
        if (filter.otherFeatures && filter.otherFeatures.length) {
            const otherFeaturesToCreate: any[] = filter.otherFeatures.map(otherFeature => Object.assign({ filterId }, otherFeature));

            promises.push(
                this.filterOtherFeatureModel.bulkCreate(otherFeaturesToCreate, { transaction })
            );
        }

        await Promise.all(promises);
    }
}