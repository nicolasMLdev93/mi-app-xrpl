import swaggerJSDoc from "swagger-jsdoc";
import { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Billeteras y TrustLines",
      version: "1.0.0",
      description:
        "Documentación de la API para gestión de usuarios, billeteras, trustlines y transacciones en la red XRPL.",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Usuario: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            username: { type: "string", example: "johndoe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password_hash: { type: "string", example: "$2b$10$..." },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Billetera: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            address: {
              type: "string",
              example: "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            },
            network: { type: "string", example: "mainnet" },
            name: {
              type: "string",
              nullable: true,
              example: "Mi Billetera Principal",
            },
            provider: { type: "string", nullable: true, example: "xumm" },
            is_active: { type: "boolean", example: true },
            has_rlusd_trustline: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        TrustLine: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            wallet_id: { type: "integer", example: 1 },
            currency: { type: "string", example: "RLUSD" },
            issuer: { type: "string", example: "rIssuerAddress..." },
            limit_amount: { type: "number", format: "float", example: 1000.0 },
            balance: { type: "number", format: "float", example: 0.0 },
            status: {
              type: "string",
              enum: ["active", "inactive", "blocked"],
              example: "active",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Transaccion: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            wallet_id: { type: "integer", example: 1 },
            tx_hash: { type: "string", example: "ABCDEF123456..." },
            transaction_type: { type: "string", example: "Payment" },
            direction: {
              type: "string",
              enum: ["incoming", "outgoing"],
              example: "incoming",
            },
            amount: { type: "number", format: "float", example: 100.5 },
            currency: { type: "string", example: "RLUSD" },
            issuer: { type: "string", nullable: true },
            source_address: { type: "string", nullable: true },
            destination: { type: "string", nullable: true },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "failed", "cancelled"],
              example: "confirmed",
            },
            error_code: { type: "string", nullable: true },
            ledger_index: { type: "integer", nullable: true },
            transaction_date: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Error de validación" },
            errors: { type: "array", items: { type: "object" } },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts', 
    './src/config/swaggerDocs.ts' 
  ], 
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
