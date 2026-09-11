# Room4-xrp – Gestión de Billeteras y Trust Lines en XRP Ledger

Aplicación full-stack para gestionar billeteras XRP, tokens RLUSD y Trust Lines en la testnet de XRP Ledger.

Desarrollada con **Node.js + TypeScript** en el backend y **React + TypeScript** en el frontend.

---

## 🚀 Características

- **Autenticación JWT** – registro e inicio de sesión con validación robusta.
- **Gestión de billeteras** – agregar billeteras manualmente o simulando conexión con Xaman.
- **Trust Lines (RLUSD)** – crear, sincronizar (consultar balance real en blockchain) y eliminar Trust Lines.
- **Balances en tiempo real** – consulta de saldo XRP y RLUSD directamente desde la testnet.
- **Diseño moderno** – interfaz oscura con efectos de vidrio y animaciones.
- **Demo lista** – conexión simulada con Xaman para pruebas sin necesidad de una wallet real.

---

## 🛠 Tecnologías

### Backend
- Node.js + Express
- TypeScript
- Sequelize (ORM) + MySQL
- JWT para autenticación
- XRPL.js para interacción con el XRP Ledger
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
- (Opcional) Cuenta en Clever Cloud o similar para base de datos en la nube

---

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/nicolasMLdev93/mi-app-xrpl.git
```

### 2. Instalar el frontend (`capa_grafica`)

```bash
cd capa_grafica
npm i
```

### 3. Instalar el backend (`capa_logica`)

```bash
cd capa_logica
npm i
npm run build   # compila los archivos de /src a /dist
```

> 💡 El archivo `.env.example` indica qué variables debés completar para conectar una base de datos en la nube. Copialo como `.env` y cargá tus propios valores.

---

## ▶️ Modo desarrollo

### Frontend

```bash
cd capa_grafica
npm run dev
```

### Backend

```bash
cd capa_logica
npm start
```

---

## 🏗️ Compilar el backend para producción

```bash
cd capa_logica
npm run build
```

## 🧪 Tests en backend
```bash
cd capa_logica
npm test
```

---

## 🗄️ Migraciones de base de datos

```bash
cd capa_logica
npm run migrate
```

---

## ⚙️ Funcionamiento

1. **Registro e inicio de sesión**
   Si aún no tenés una cuenta, registrate; si ya tenés una, iniciá sesión.

2. **Creación de una billetera simulada**
   Presioná el botón **"Conectar con Xaman"**. Esto genera automáticamente una billetera de prueba con 100 XRP de saldo inicial para operar en la Devnet.

4. **Manejo de la seed (clave privada)**
   Al tratarse de una aplicación de pruebas sin riesgo real de seguridad, la seed de la billetera se almacena en el `sessionStorage` del navegador para poder firmar transacciones. En un entorno real conectado a Mainnet, la seed se obtendría mediante la autorización de Xaman, sin exponerla nunca en el navegador.

5. **Alcance de las operaciones**
   Únicamente las billeteras simuladas pueden firmar y enviar transacciones, ya que son las únicas que tienen su seed asociada en el `sessionStorage`. Si se agrega una billetera ya existente en la Devnet (solo dirección pública), únicamente será posible consultar sus fondos, no operar con ella.
   Recordar que las billeteras de la Devnet y Testnet son usadas por múltiples usuarios en línea por lo cual su saldo puede variar todo el tiempo de forma activa; si las agrego a mi cuenta serán almacenadas en la base de datos global de la aplicación y no se podrán agregar nuevamente con otro usuario.

   > ⚠️ El sistema siempre opera con la **billetera que se encuentra al tope de la lista**, ya que es la que tiene la seed asociada en el `sessionStorage`.
   > ⚠️ Si se borra de forma manual dicha seed se creará otra billetera y se almacenará dicha seed en el  `sessionStorage`.

7. **Cierre de sesión**
   - Si cerrás sesión y accedés con **otra cuenta**, la seed se elimina del `sessionStorage` de forma automática. Esto permite que la nueva cuenta pueda generar su propia billetera simulada.

   > ⚠️ Recordá: el sistema siempre usa la billetera simulada ubicada al tope, ya que es la que tiene la seed asociada. Si esa seed no está disponible, se mostrará un mensaje de error, ya que **es necesaria para firmar la transacción**. La aplicación es una simulación, en la vida real siempre obtiene la seed para poder firmar las transacciones desde XAMAN.

8. **Api de documentación**

La documentación de las rutas y endpoints del backend está disponible en:
```bash
http://localhost:3000/api-docs/
```

