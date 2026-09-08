import { Model, Optional, Sequelize } from 'sequelize';
import TrustLine from './TrustLine';
interface BilleteraAttributes {
    id: number;
    user_id: number;
    address: string;
    network: string;
    name?: string | null;
    provider?: string | null;
    is_active: boolean;
    has_rlusd_trustline?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
interface BilleteraCreationAttributes extends Optional<BilleteraAttributes, 'id' | 'createdAt' | 'updatedAt' | 'name' | 'provider' | 'has_rlusd_trustline'> {
}
declare class Billetera extends Model<BilleteraAttributes, BilleteraCreationAttributes> implements BilleteraAttributes {
    id: number;
    user_id: number;
    address: string;
    network: string;
    name: string | null;
    provider: string | null;
    is_active: boolean;
    has_rlusd_trustline: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    trustLines?: TrustLine[];
    static initModel(sequelize: Sequelize): typeof Billetera;
}
export default Billetera;
