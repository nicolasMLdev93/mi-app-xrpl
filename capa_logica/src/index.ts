import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { config } from "./config";
import apiRoutes from "./routes/apiRoutes"; 
import { swaggerSpec } from './config/swagger';

const app: Application = express();
// Middlewares globales
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}
// Rutas
app.use("/api", apiRoutes); 
// Swagger UI 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Iniciar servidor
const { port } = config;
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});