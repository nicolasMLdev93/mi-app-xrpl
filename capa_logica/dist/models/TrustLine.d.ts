import { Model, Optional, Sequelize } from 'sequelize';
interface TrustLineAttributes {
    id: number;
    wallet_id: number;
    currency: string;
    issuer: string;
    limit_amount: number;
    balance: number;
    status: 'active' | 'inactive' | 'blocked';
    createdAt?: Date;
    updatedAt?: Date;
}
interface TrustLineCreationAttributes extends Optional<TrustLineAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class TrustLine extends Model<TrustLineAttributes, TrustLineCreationAttributes> implements TrustLineAttributes {
    id: number;
    wallet_id: number;
    currency: string;
    issuer: string;
    limit_amount: number;
    balance: number;
    status: 'active' | 'inactive' | 'blocked';
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static initModel(sequelize: Sequelize): typeof TrustLine;
}
export default TrustLine;
