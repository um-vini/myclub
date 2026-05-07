import { DataTypes, Model } from 'sequelize';
import db from '../db/conn.js';
import type {
  IPayment,
  PaymentStatus,
  PaymentMethod,
  PaymentCategory,
} from '../interfaces/Payment.js';

/**
 * Payment model representing financial transactions in the 'payments' table.
 * Tracks memberships, product sales, and other revenue streams.
 */
class Payment extends Model<IPayment> implements IPayment {
  public id!: number;
  public memberId!: number;
  public month!: number; // Reference month (1 - 12)
  public year!: number; // Reference year (20xx)
  public amountPaid!: number;
  public paymentDate!: Date;
  public dueDate!: Date;
  public status!: PaymentStatus;
  public paymentMethod!: PaymentMethod;
  public category!: PaymentCategory;
  public description!: string;
  public readonly deletedAt!: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    memberId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'members',
        key: 'id',
      },
      field: 'member_id',
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amountPaid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'amount_paid',
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'payment_date',
    },
    dueDate: {
      type: DataTypes.DATEONLY, // YYYY-MM-DD
      allowNull: false,
      field: 'due_date',
    },
    status: {
      type: DataTypes.ENUM('paid', 'refunded', 'cancelled'),
      allowNull: false,
      defaultValue: 'paid',
    },
    paymentMethod: {
      type: DataTypes.ENUM('pix', 'cash', 'credit_card', 'debit_card'),
      allowNull: false,
      field: 'payment_method',
    },
    category: {
      type: DataTypes.ENUM('membership', 'product', 'other'),
      allowNull: false,
      defaultValue: 'membership',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    tableName: 'payments',
    modelName: 'Payment',
    paranoid: true,
    timestamps: true,
  },
);

export default Payment;
