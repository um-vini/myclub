import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../db/conn.js';

/**
 * Attributes for the RefreshToken model.
 */
interface RefreshTokenAttributes {
  id: number;
  token: string;
  userId: number;
  expiresAt: Date;
}

/**
 * Attributes required for creating a new RefreshToken.
 * The 'id' is optional as it is auto-incremented by the database.
 */
interface RefreshTokenCreationAttributes extends Optional<
  RefreshTokenAttributes,
  'id'
> {}

/**
 * RefreshToken model for managing long session tokens.
 * Used to issue new access tokens without requiring authentication again.
 */
class RefreshToken
  extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>
  implements RefreshTokenAttributes
{
  public id!: number;
  public token!: string;
  public userId!: number;
  public expiresAt!: Date;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
  },
  {
    sequelize,
    modelName: 'RefreshToken',
    tableName: 'refresh_tokens',
    timestamps: true,
  },
);

export default RefreshToken;
