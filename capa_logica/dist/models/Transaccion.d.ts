import { Model, Optional, Sequelize } from 'sequelize';
interface TransaccionAttributes {
    id: number;
    wallet_id: number;
    tx_hash: string;
    transaction_type: string;
    direction: 'incoming' | 'outgoing';
    amount: number;
    currency: string;
    issuer?: string | null;
    source_address?: string | null;
    destination?: string | null;
    status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
    error_code?: string | null;
    ledger_index?: number | null;
    transaction_date: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
interface TransaccionCreationAttributes extends Optional<TransaccionAttributes, 'id' | 'createdAt' | 'updatedAt' | 'issuer' | 'source_address' | 'destination' | 'error_code' | 'ledger_index'> {
}
declare class Transaccion extends Model<TransaccionAttributes, TransaccionCreationAttributes> implements TransaccionAttributes {
    id: number;
    wallet_id: number;
    tx_hash: string;
    transaction_type: string;
    direction: 'incoming' | 'outgoing';
    amount: number;
    currency: string;
    issuer: string | null;
    source_address: string | null;
    destination: string | null;
    status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
    error_code: string | null;
    ledger_index: number | null;
    transaction_date: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static initModel(sequelize: Sequelize): typeof Transaccion;
}
export default Transaccion;
