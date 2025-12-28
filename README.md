# InvestTracker 📊

Una aplicación web completa para gestionar y monitorear tu portafolio de inversiones.

## 🚀 Características

- ✅ Registro e inicio de sesión con JWT
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de inversiones (crear, editar, eliminar)
- ✅ Visualización de evolución del patrimonio
- ✅ Distribución por tipo de inversión
- ✅ Cálculo automático de rendimientos
- ✅ Interfaz responsive y moderna

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- MySQL 8
- JWT para autenticación
- bcryptjs para encriptación de contraseñas
- CORS habilitado

### Frontend
- React 19.2 + Vite
- React Router 7.11
- Axios para API calls
- Tailwind CSS v3.4.0
- Recharts para gráficos
- Lucide React para iconos

## 📁 Estructura del Proyecto

```
investment-tracker/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── schema.sql
│   └── seeds.sql
└── README.md
```

## 🔧 Instalación

### Requisitos previos
- Node.js v18+
- MySQL 8
- npm o yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configura las variables de entorno en .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📝 Variables de Entorno

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=investment-tracker
JWT_SECRET=tu_secreto_aqui
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🗄️ Base de Datos

Para crear la base de datos:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p investment-tracker < database/seeds.sql
```

## 🚀 Uso

1. **Registrarse**: Crea una nueva cuenta en la página de registro
2. **Iniciar sesión**: Accede con tus credenciales
3. **Dashboard**: Visualiza tus estadísticas principales
4. **Crear inversión**: Haz clic en "Nueva Inversión" para agregar una nueva
5. **Gestionar**: Edita o elimina inversiones según sea necesario

## 📊 Endpoints de API

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil del usuario

### Inversiones
- `GET /api/investments` - Obtener todas las inversiones
- `POST /api/investments` - Crear nueva inversión
- `GET /api/investments/:id` - Obtener inversión específica
- `PUT /api/investments/:id` - Actualizar inversión
- `DELETE /api/investments/:id` - Eliminar inversión

### Dashboard
- `GET /api/dashboard/stats` - Obtener estadísticas
- `GET /api/dashboard/evolution` - Obtener evolución patrimonial

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT.

## 📧 Contacto

Para preguntas o sugerencias, contacta al desarrollador.

---

**Desarrollado con ❤️ para gestionar inteligentemente tu portafolio de inversiones**
