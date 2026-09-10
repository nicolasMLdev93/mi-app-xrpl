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
## Clonar repo
git clone https://github.com/nicolasMLdev93/mi-app-xrpl.git

## Instalación de paquetes de capa_grafica
- cd capa_grafica
- npm i (para instalar todos los paquetes de node.js)

## Instalación de paquetes de capa_logica
- cd capa_logica
- npm i (para instalar todos los paquetes de node.js)

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

## Funcionamiento
- Registro e inicio de sesión: si aún no tienes una cuenta, regístrate; si ya tienes una, inicia sesión.

- Creación de una billetera simulada: presiona el botón "Conectar con Xaman". Esto generará automáticamente una billetera de prueba con 100 XRP de saldo inicial para operar en la Devnet.

- Manejo de la seed (clave privada): dado que se trata de una aplicación de pruebas y no existe riesgo de seguridad, la seed de la billetera se almacenará en el sessionStorage para poder firmar las transacciones. En un entorno real conectado a la Mainnet, la seed se obtendría mediante la autorización de Xaman, sin exponerla nunca en el navegador.

- Alcance de las operaciones: únicamente las billeteras simuladas podrán firmar y enviar transacciones. Si se agrega una billetera ya existente en la Devnet (solo dirección pública), solo será posible consultar sus fondos, no operar con ella.

- Cierre de sesión: al cerrar la sesión y acceder con otra cuenta, se debe eliminar la seed del sessionStorage. Para restaurarla, basta con presionar nuevamente el botón "Conectar con Xaman", lo que volverá a cargar la seed y a recuperar las billeteras asociadas desde el backend.


