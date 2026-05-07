import { DataTypes, Model } from 'sequelize';
import db from '../db/conn.js';
import type {
  IExpense,
  ExpenseStatus,
  ExpenseCategory,
} from '../interfaces/Expense.js';

/**
 * Expense model representing financial outflows in the 'expenses' table.
 * Tracks operational costs, equipment purchases, and recurring utilities.
 */
class Expense extends Model<IExpense> implements IExpense {
  public id!: number;
  public description!: string;
  public amount!: number;
  public dueDate!: Date;
  public paymentDate?: Date | null;
  public status!: ExpenseStatus;
  public category!: ExpenseCategory;
  public installment?: number | null;
  public totalInstallments?: number | null;
  public isRecurring!: boolean;
  public parentId?: number | null;
  public observations?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date;
}

Expense.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    dueDate: {
      type: DataTypes.DATEONLY, // YYYY-MM-DD
      allowNull: false,
      field: 'due_date',
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'payment_date',
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'overdue'),
      allowNull: false,
      defaultValue: 'pending',
    },
    category: {
      type: DataTypes.ENUM(
        'utilities',
        'equipment',
        'rent',
        'marketing',
        'salary',
        'other',
      ),
      allowNull: false,
      defaultValue: 'other',
    },
    installment: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    totalInstallments: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'total_installments',
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_recurring',
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'parent_id',
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: 'expenses',
    modelName: 'Expense',
    paranoid: true, // Mantém o padrão de Soft Delete que você usa
    timestamps: true,
    underscored: false, // Mantive como false para seguir seu padrão de field manual
  },
);

export default Expense;
