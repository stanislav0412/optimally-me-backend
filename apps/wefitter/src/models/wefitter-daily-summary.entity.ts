import { Table, Column, Model, DataType, ForeignKey, Scopes } from 'sequelize-typescript';
import { User } from '../../../users/src/models';

@Scopes(() => ({
    byUserId: (userId) => ({ where: { userId } }),
    byDate: (date) => ({ where: { date } }),
}))
@Table({
    tableName: 'userWefitterDailySummary',
    timestamps: true,
    underscored: false
})
export class UserWefitterDailySummary extends Model {
    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        primaryKey: true
    })
    userId: number;

    @Column({
        type: DataType.DATEONLY,
        allowNull: true,
    })
    date: string;

    @Column({
        type: DataType.FLOAT,
        allowNull: true,
    })
    distance: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: true,
    })
    steps: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: true,
    })
    calories: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: true,
    })
    activeCalories: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: true,
    })
    bmrCalories: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: true,
    })
    points: number;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    source: string;
}