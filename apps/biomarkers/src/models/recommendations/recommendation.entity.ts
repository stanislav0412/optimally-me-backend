import { RecommendationCategoryTypes } from '../../../../common/src/resources/recommendations/recommendation-category-types';
import { Table, Column, Model, DataType, Scopes, BelongsToMany } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { RecommendationActionTypes } from '../../../../common/src/resources/recommendations/recommendation-action-types';
import { File } from '../../../../files/src/models/file.entity';
import { RecommendationFile } from './recommendation-file.entity';

@Scopes(() => ({
    byCategory: (category) => ({ where: { category } }),
    search: (searchString) => ({ where: { content: { [Op.like]: `%${searchString}%` } } }),
    pagination: (query) => ({ limit: query.limit, offset: query.offset }),
    byId: (id) => ({ where: { id } }),
    withFile: () => ({
        include: [
            {
                model: File,
                as: 'file',
                required: false,
            },
        ]
    })
}))

@Table({
    tableName: 'recommendations',
    timestamps: true,
    underscored: false
})

export class Recommendation extends Model {
    @Column({
        type: DataType.NUMBER,
        allowNull: false,
    })
    category: RecommendationCategoryTypes;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    content: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    title: string;

    @Column({
        type: DataType.TINYINT,
        allowNull: true,
    })
    type: RecommendationActionTypes;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    productLink: string;

    @BelongsToMany(() => File, () => RecommendationFile, 'recommendationId', 'fileId')
    file: File;
}