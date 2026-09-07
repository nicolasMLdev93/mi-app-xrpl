import { Model, Optional, Sequelize } from 'sequelize';
interface BilleteraAttributes {
    id: number;
    user_id: number;
    address: string;
    network: string;
    name?: string | null;
    provider?: string | null;
    is_active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
interface BilleteraCreationAttributes extends Optional<BilleteraAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Billetera extends Model<BilleteraAttributes, BilleteraCreationAttributes> implements BilleteraAttributes {
    id: number;
    user_id: number;
    address: string;
    network: string;
    name: string | null;
    provider: string | null;
    is_active: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static initModel(sequelize: Sequelize): typeof Billetera;
}
export default Billetera;
