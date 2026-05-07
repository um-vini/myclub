import { DataTypes, Model } from 'sequelize';
import type { IPlan } from '../interfaces/Plan.js';
import db from '../db/conn.js';

/**
 * Plan model representing membership options in the 'plans' table.
 * Defines pricing and training frequency for gym members.
 */
class Plan extends Model<IPlan> implements IPlan {
  public id!: number;
  public name!: string;
  public price!: number;
  public timesPerWeek!: number;
  public isActive!: boolean;
  public readonly deletedAt!: Date;
}

Plan.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      /**
       * Getter to ensure price is always returned as a number.
       */
      get() {
        const rawValue = this.getDataValue('price');
        return rawValue ? parseFloat(String(rawValue)) : 0;
      },
    },
    timesPerWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'times_per_week',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: 'is_active',
    },
  },
  {
    sequelize: db,
    modelName: 'Plan',
    tableName: 'plans',
    timestamps: true,
    paranoid: true,
  },
);

export default Plan;
