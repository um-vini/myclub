import { DataTypes, Model } from 'sequelize';
import type { IMember } from '../interfaces/Member.js';
import db from '../db/conn.js';

/**
 * Member model representing the 'members' table in the database.
 * Implements the IMember interface for strict typing across the application.
 */
class Member extends Model<IMember> implements IMember {
  public id!: number;
  public name!: string;
  public cpf!: string;
  public email!: string;
  public dueDay!: number;
  public phone!: string;
  public birthDate!: string;
  public restrictions!: string;
  public isActive!: boolean;
  public trainingDays!: string[];
  public trainingTime!: string;
  public planId!: number;
  public readonly deletedAt!: Date;
}

Member.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dueDay: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'birth_date',
    },
    restrictions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: 'is_active',
    },
    trainingDays: {
      type: DataTypes.JSON, // Stores array of days as a JSON string in MySQL
      allowNull: false,
      field: 'training_days',
    },
    trainingTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'training_time',
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'plan_id',
      references: {
        model: 'plans',
        key: 'id',
      },
    },
  },
  {
    sequelize: db,
    modelName: 'Member',
    tableName: 'members',
    timestamps: true,
    paranoid: true,
  },
);

export default Member;
