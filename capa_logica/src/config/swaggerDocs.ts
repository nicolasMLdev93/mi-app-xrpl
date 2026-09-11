/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticación de usuarios
 *   - name: Billeteras
 *     description: Gestión de billeteras
 *   - name: TrustLines
 *     description: Gestión de TrustLines en XRPL
 *   - name: Transacciones
 *     description: Historial de transacciones
 */

// ==========================================
// AUTH
// ==========================================

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, retorna token JWT
 *       401:
 *         description: Credenciales inválidas
 */

// ==========================================
// BILLETERAS
// ==========================================

/**
 * @swagger
 * /billeteras:
 *   get:
 *     summary: Obtener todas las billeteras del usuario autenticado
 *     tags: [Billeteras]
 *     responses:
 *       200:
 *         description: Lista de billeteras
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Billetera'
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /billeteras:
 *   post:
 *     summary: Crear una nueva billetera
 *     tags: [Billeteras]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - network
 *             properties:
 *               address:
 *                 type: string
 *               network:
 *                 type: string
 *               name:
 *                 type: string
 *               provider:
 *                 type: string
 *     responses:
 *       201:
 *         description: Billetera creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Billetera'
 *       400:
 *         description: Error de validación
 */

// ==========================================
// TRUSTLINES
// ==========================================

/**
 * @swagger
 * /billeteras/{wallet_id}/trustlines:
 *   get:
 *     summary: Obtener las trustlines de una billetera específica
 *     tags: [TrustLines]
 *     parameters:
 *       - in: path
 *         name: wallet_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la billetera
 *     responses:
 *       200:
 *         description: Lista de TrustLines
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TrustLine'
 *       404:
 *         description: Billetera no encontrada
 */

/**
 * @swagger
 * /trustlines:
 *   post:
 *     summary: Crear una trustline manualmente
 *     tags: [TrustLines]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wallet_id
 *               - currency
 *               - issuer
 *               - limit_amount
 *             properties:
 *               wallet_id:
 *                 type: integer
 *               currency:
 *                 type: string
 *               issuer:
 *                 type: string
 *               limit_amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: TrustLine creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrustLine'
 */

/**
 * @swagger
 * /trustlines/{id}:
 *   put:
 *     summary: Actualizar una trustline (localmente)
 *     tags: [TrustLines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la trustline
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit_amount:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, inactive, blocked]
 *     responses:
 *       200:
 *         description: TrustLine actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrustLine'
 *       404:
 *         description: TrustLine no encontrada
 */

/**
 * @swagger
 * /trustlines/{id}:
 *   delete:
 *     summary: Eliminar una trustline
 *     tags: [TrustLines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: TrustLine eliminada exitosamente
 *       404:
 *         description: TrustLine no encontrada
 */

/**
 * @swagger
 * /trustlines/{id}/sync:
 *   post:
 *     summary: Sincronizar trustline con la blockchain
 *     tags: [TrustLines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: TrustLine sincronizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrustLine'
 */

/**
 * @swagger
 * /trustlines/{id}/prepare-limit-change:
 *   post:
 *     summary: Preparar transacción para cambiar el límite de una trustline
 *     tags: [TrustLines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - new_limit
 *             properties:
 *               new_limit:
 *                 type: number
 *     responses:
 *       200:
 *         description: Transacción preparada (retorna payload para firmar)
 */

/**
 * @swagger
 * /trustlines/check/{address}:
 *   get:
 *     summary: Verificar si una dirección tiene trustline (para frontend)
 *     tags: [TrustLines]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado de la trustline
 */

/**
 * @swagger
 * /balances/rlusd/{address}:
 *   get:
 *     summary: Obtener el balance de RLUSD de una dirección
 *     tags: [TrustLines]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Balance de RLUSD
 */

// ==========================================
// TRANSACCIONES
// ==========================================

/**
 * @swagger
 * /transacciones:
 *   get:
 *     summary: Obtener las transacciones del usuario autenticado
 *     tags: [Transacciones]
 *     responses:
 *       200:
 *         description: Lista de transacciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaccion'
 *       401:
 *         description: No autorizado
 */

// ==========================================
// HEALTH
// ==========================================

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar el estado del servidor
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

export {};
