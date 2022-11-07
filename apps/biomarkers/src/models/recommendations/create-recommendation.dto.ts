import { ApiProperty } from '@nestjs/swagger';
import { RecommendationCategoryTypes } from '../../../../common/src/resources/recommendations/recommendation-category-types';
import { EnumHelper } from '../../../../common/src/utils/helpers/enum.helper';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { RecommendationActionTypes } from '../../../../common/src/resources/recommendations/recommendation-action-types';
import { CreateRecommendationImpactDto } from '../recommendationImpacts/create-recommendation-impact.dto';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { ArrayDistinct } from '../../../../common/src/resources/common/array-distinct.decorator';
import { recommendationValidationRules } from 'apps/common/src/resources/recommendations/recommendation-validation-rules';
import { OneOf } from '../../../../common/src/resources/common/one-of.decorator';

export class CreateRecommendationDto {
    @ApiProperty({ type: () => Number, required: true, description: EnumHelper.toDescription(RecommendationCategoryTypes) })
    @IsNotEmpty()
    @IsNumber()
    @IsEnum(RecommendationCategoryTypes)
    readonly category: number;

    @ApiProperty({ type: () => String, required: true })
    @IsNotEmpty()
    @IsString()
    @MinLength(recommendationValidationRules.titleMinLength)
    @MaxLength(recommendationValidationRules.titleMaxLength)
    @Transform(({ value }: TransformFnParams) => value?.trim())
    readonly title: string;

    @ApiProperty({ type: () => Number, required: false, description: EnumHelper.toDescription(RecommendationActionTypes) })
    @IsOptional()
    @IsEnum(RecommendationActionTypes)
    @IsNumber()
    readonly type: number;

    @ApiProperty({ type: () => String, required: false })
    @IsOptional()
    @IsString()
    @MaxLength(recommendationValidationRules.contentMaxLength)
    readonly content: string;

    @ApiProperty({ type: () => String, required: false })
    @IsOptional()
    @IsString()
    @MaxLength(recommendationValidationRules.productLinkMaxLength)
    @MinLength(recommendationValidationRules.productLinkMinLength)
    readonly productLink: string;

    @ApiProperty({ type: () => Boolean, required: false, default: true })
    @IsOptional()
    @IsBoolean()
    readonly isAddToCartAllowed: boolean = true;

    @ApiProperty({ type: () => Number, required: false })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @IsInt()
    readonly fileId: number;

    @ApiProperty({ type: () => [CreateRecommendationImpactDto], required: false })
    @IsOptional()
    @IsArray()
    @ArrayDistinct('biomarkerId')
    @OneOf(['descriptionLow', 'descriptionHigh'], { each: true })
    @ValidateNested()
    @Type(() => CreateRecommendationImpactDto)
    readonly impacts: CreateRecommendationImpactDto[];
}