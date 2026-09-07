import sequelize from '../config/connection';
import Usuario from './Usuario';
import Billetera from './Billetera';
import Transaccion from './Transaccion';
import TrustLine from './TrustLine';

// Inicializar modelos
Usuario.initModel(sequelize);
Billetera.initModel(sequelize);
Transaccion.initModel(sequelize);
TrustLine.initModel(sequelize);

// Relaciones
Usuario.hasMany(Billetera, {
  foreignKey: 'user_id',
  as: 'billeteras',
});
Billetera.belongsTo(Usuario, {
  foreignKey: 'user_id',
  as: 'usuario',
});

Billetera.hasMany(Transaccion, {
  foreignKey: 'wallet_id',
  as: 'transacciones',
});
Transaccion.belongsTo(Billetera, {
  foreignKey: 'wallet_id',
  as: 'billetera',
});

Billetera.hasMany(TrustLine, {
  foreignKey: 'wallet_id',
  as: 'trustLines',
});
TrustLine.belongsTo(Billetera, {
  foreignKey: 'wallet_id',
  as: 'billetera',
});

export {
  sequelize,
  Usuario,
  Billetera,
  Transaccion,
  TrustLine,
};