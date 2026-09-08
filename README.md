# Room4-xrp – Gestión de Billeteras y Trust Lines en XRP Ledger

Aplicación full-stack para gestionar billeteras XRP, tokens RLUSD y Trust Lines en la testnet de XRP Ledger. Desarrollada con **Node.js + TypeScript (backend)** y **React + TypeScript (frontend)**.

## 🚀 Características

- **Autenticación JWT** – registro e inicio de sesión con validación robusta.
- **Gestión de billeteras** – agregar billeteras manualmente o simulando conexión con Xaman.
- **Trust Lines (RLUSD)** – crear, sincronizar (consultar balance real en blockchain) y eliminar Trust Lines.
- **Balances en tiempo real** – consulta de saldo XRP y RLUSD directamente desde la testnet.
- **Diseño moderno** – interfaz oscura con efectos de vidrio y animaciones.
- **Demo lista** – conexión simulada con Xaman para pruebas sin wallet real.

---

## 🛠 Tecnologías

### Backend
- Node.js + Express
- TypeScript
- Sequelize (ORM) + MySQL
- JWT para autenticación
- XRPL.js para interacción con XRP Ledger
- Express-validator para validaciones

### Frontend
- React + TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router DOM
- React Icons

---

## 📋 Requisitos previos

- Node.js ≥ 18
- MySQL (local o remoto)
- npm o yarn
- (Opcional) cuenta en Clever Cloud o similar para BD en la nube

---

## Frontend (modo desarrollo)
- cd capa_grafica
- npm run dev

## Backend (modo desarrollo)
- cd capa_logica
- npm start

## Compilar todos los archivos del /src del Backend
- cd capa_grafica
- npm run build

## Realizar migraciones a la base de datos
- cd capa_grafica
- npm run migrate

