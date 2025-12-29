# 📚 Profile & Security API Reference

## Base Configuration

```
Base URL: http://localhost:5000/api
Content-Type: application/json
Authentication: Bearer {JWT_token} (in Authorization header)
```

---

## 🔐 Authentication

All endpoints require JWT token in header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token is automatically included by Axios interceptor from localStorage.

---

## 📋 API Endpoints

### 1️⃣ GET /profile - Get User Profile

**Purpose**: Retrieve current user's profile information

**Method**: `GET`

**Authentication**: Required (JWT)

**Parameters**: None

**Request Headers**:
```
Authorization: Bearer {token}
```

**Response (200 OK)**:
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "leider.epalacios@gmail.com",
    "phone": "+57 300 1234567",
    "city": "Bogotá",
    "country": "Colombia",
    "bio": "Professional developer",
    "birth_date": "1990-01-15",
    "occupation": "Software Engineer",
    "profile_picture": null,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:
```json
// 401 - Unauthorized
{ "message": "Token inválido o expirado" }

// 404 - User not found
{ "message": "Usuario no encontrado" }

// 500 - Server error
{ "message": "Error interno del servidor" }
```

**Example Usage** (Frontend):
```javascript
const response = await profileAPI.getProfile();
console.log(response.data.user);
```

---

### 2️⃣ PUT /profile - Update User Profile

**Purpose**: Update user's personal information

**Method**: `PUT`

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "name": "Jane Smith",
  "phone": "+57 300 9876543",
  "city": "Medellín",
  "country": "Colombia",
  "bio": "Passionate about finance",
  "birth_date": "1992-06-20",
  "occupation": "Financial Analyst"
}
```

**Fields**:
- `name` (string, max 100) - Optional
- `phone` (string, max 20) - Optional
- `city` (string, max 100) - Optional
- `country` (string, max 100) - Optional
- `bio` (text) - Optional
- `birth_date` (date) - Optional
- `occupation` (string, max 100) - Optional

**Response (200 OK)**:
```json
{
  "message": "Perfil actualizado exitosamente",
  "user": {
    "id": 1,
    "name": "Jane Smith",
    "email": "leider.epalacios@gmail.com",
    "phone": "+57 300 9876543",
    "city": "Medellín",
    "country": "Colombia",
    "bio": "Passionate about finance",
    "birth_date": "1992-06-20",
    "occupation": "Financial Analyst",
    "profile_picture": null,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-15T11:45:00.000Z"
  }
}
```

**Error Responses**:
```json
// 400 - Bad request
{ "message": "Datos inválidos" }

// 401 - Unauthorized
{ "message": "No autorizado" }

// 500 - Server error
{ "message": "Error al actualizar perfil" }
```

**Security Log Action**: `profile_update`

**Example Usage** (Frontend):
```javascript
const updatedData = {
  name: "Jane Smith",
  city: "Medellín",
  phone: "+57 300 9876543"
};
const response = await profileAPI.updateProfile(updatedData);
```

---

### 3️⃣ POST /profile/change-password - Change Password

**Purpose**: Change user's account password securely

**Method**: `POST`

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}
```

**Fields**:
- `currentPassword` (string) - Current password for verification
- `newPassword` (string) - New password (min 6 characters)

**Validations**:
- Current password must be correct (verified via bcryptjs)
- New password must be at least 6 characters
- New password cannot be same as current password
- Both fields are required

**Response (200 OK)**:
```json
{
  "message": "Contraseña cambiada exitosamente",
  "passwordHistoryId": 5
}
```

**Error Responses**:
```json
// 400 - Validation error
{ "message": "Contraseña actual incorrecta" }

// 400 - Same password
{ "message": "La nueva contraseña debe ser diferente a la actual" }

// 400 - Invalid length
{ "message": "La contraseña debe tener al menos 6 caracteres" }

// 400 - Missing fields
{ "message": "currentPassword y newPassword son requeridos" }

// 401 - Unauthorized
{ "message": "No autorizado" }

// 500 - Server error
{ "message": "Error al cambiar contraseña" }
```

**Side Effects**:
- Old password hash stored in `password_history` table
- Action logged in `security_logs` table
- User can immediately login with new password

**Security Log Action**: `password_change`

**Example Usage** (Frontend):
```javascript
const passwordData = {
  currentPassword: "password123",
  newPassword: "newPassword456"
};
try {
  const response = await profileAPI.changePassword(passwordData);
  console.log("Password changed successfully");
} catch (error) {
  console.error("Password change failed:", error.response.data.message);
}
```

---

### 4️⃣ POST /profile/upload-picture - Upload Profile Picture

**Purpose**: Upload and store user's profile picture

**Method**: `POST`

**Authentication**: Required (JWT)

**Content-Type**: `multipart/form-data`

**Request Body** (FormData):
```
picture: <File object>
```

**File Requirements**:
- **Formats**: JPEG, PNG, WebP, GIF
- **Size**: Maximum 5MB
- **Field Name**: Must be named "picture"

**Validations**:
- File type must be image (MIME type checked by multer)
- File size cannot exceed 5MB
- File is required

**Response (200 OK)**:
```json
{
  "message": "Foto de perfil subida exitosamente",
  "pictureUrl": "/api/profile/picture/1"
}
```

**Error Responses**:
```json
// 400 - Invalid file type
{ "message": "Solo se permiten imágenes (JPEG, PNG, WebP, GIF)" }

// 400 - File too large
{ "message": "El archivo excede el tamaño máximo de 5MB" }

// 400 - No file uploaded
{ "message": "No se subió ningún archivo" }

// 401 - Unauthorized
{ "message": "No autorizado" }

// 500 - Server error
{ "message": "Error al subir la foto de perfil" }
```

**Storage Details**:
- Stored as LONGBLOB in `users.profile_picture` column
- Binary data preserved exactly as uploaded
- Retrievable via GET /profile/picture/{userId}

**Security Log Action**: `picture_upload`

**Example Usage** (Frontend):
```javascript
const fileInput = document.querySelector('input[type="file"]');
const formData = new FormData();
formData.append('picture', fileInput.files[0]);

try {
  const response = await profileAPI.uploadProfilePicture(formData);
  console.log("Picture uploaded:", response.data.pictureUrl);
} catch (error) {
  console.error("Upload failed:", error.response.data.message);
}
```

**Advanced Example** (With Preview):
```javascript
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  
  // Validate file type
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    alert('Invalid file type');
    return;
  }
  
  // Validate file size
  if (file.size > 5 * 1024 * 1024) {
    alert('File too large (max 5MB)');
    return;
  }
  
  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    setPreview(e.target.result);
  };
  reader.readAsDataURL(file);
};

const handleUpload = async () => {
  const formData = new FormData();
  formData.append('picture', fileInput.files[0]);
  const response = await profileAPI.uploadProfilePicture(formData);
  setProfilePicture(response.data.pictureUrl);
};
```

---

### 5️⃣ GET /profile/picture/{userId} - Get Profile Picture

**Purpose**: Download/retrieve a user's profile picture

**Method**: `GET`

**Authentication**: Optional (public endpoint)

**URL Parameters**:
- `userId` (integer) - ID of user whose picture to retrieve

**Response (200 OK)**:
- Returns binary image file
- Content-Type: image/jpeg or image/png (as stored)

**Error Responses**:
```json
// 404 - Picture not found
{ "message": "Foto de perfil no encontrada" }

// 404 - User not found
{ "message": "Usuario no encontrado" }

// 500 - Server error
{ "message": "Error al obtener la foto de perfil" }
```

**Example Usage** (Frontend):
```javascript
// Display in img tag
<img src={`http://localhost:5000/api/profile/picture/${userId}`} />

// Download image
const downloadProfilePicture = async (userId) => {
  const response = await profileAPI.getProfilePicture(userId);
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `profile_${userId}.jpg`);
  document.body.appendChild(link);
  link.click();
};
```

---

### 6️⃣ GET /profile/security-logs - Get Security Activity

**Purpose**: Retrieve user's security activity log (last 20 events)

**Method**: `GET`

**Authentication**: Required (JWT)

**Parameters**: None (returns last 20 records)

**Request Headers**:
```
Authorization: Bearer {token}
```

**Response (200 OK)**:
```json
{
  "logs": [
    {
      "id": 47,
      "user_id": 1,
      "action": "password_change",
      "details": {
        "timestamp": "2025-01-15T11:20:00Z"
      },
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "created_at": "2025-01-15T11:20:00.000Z"
    },
    {
      "id": 46,
      "user_id": 1,
      "action": "profile_update",
      "details": {
        "fields_updated": ["name", "city", "phone"]
      },
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "created_at": "2025-01-15T11:15:00.000Z"
    },
    {
      "id": 45,
      "user_id": 1,
      "action": "picture_upload",
      "details": {
        "file_size": 245123
      },
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "created_at": "2025-01-15T11:10:00.000Z"
    }
  ]
}
```

**Security Log Actions**:
- `login` - User logged in
- `logout` - User logged out
- `password_change` - Password was changed
- `profile_update` - Profile information was updated
- `picture_upload` - Profile picture was uploaded
- `login_attempt_failed` - Failed login attempt (if tracked)

**Error Responses**:
```json
// 401 - Unauthorized
{ "message": "No autorizado" }

// 500 - Server error
{ "message": "Error al obtener registros de seguridad" }
```

**Example Usage** (Frontend):
```javascript
const loadSecurityLogs = async () => {
  const response = await profileAPI.getSecurityLogs();
  const logs = response.data.logs;
  
  logs.forEach(log => {
    console.log(`${log.action} at ${log.created_at} from ${log.ip_address}`);
  });
};
```

**Display in Table**:
```javascript
<table>
  <thead>
    <tr>
      <th>Action</th>
      <th>Date/Time</th>
      <th>IP Address</th>
    </tr>
  </thead>
  <tbody>
    {logs.map(log => (
      <tr key={log.id}>
        <td>{log.action}</td>
        <td>{new Date(log.created_at).toLocaleString()}</td>
        <td>{log.ip_address}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## 🔄 Complete Workflow Examples

### Complete Profile Setup
```javascript
// 1. Get current profile
const profile = await profileAPI.getProfile();
console.log("Current name:", profile.data.user.name);

// 2. Update profile information
await profileAPI.updateProfile({
  name: "John Doe",
  phone: "+57 300 1234567",
  city: "Bogotá",
  country: "Colombia"
});

// 3. Upload profile picture
const formData = new FormData();
formData.append('picture', imageFile);
await profileAPI.uploadProfilePicture(formData);

// 4. Change password
await profileAPI.changePassword({
  currentPassword: "oldPassword123",
  newPassword: "newPassword456"
});

// 5. Check security logs
const logs = await profileAPI.getSecurityLogs();
console.log("Last action:", logs.data.logs[0].action);
```

### Error Handling Pattern
```javascript
try {
  const response = await profileAPI.updateProfile(data);
  setMessage({ text: "✓ Éxito", type: "success" });
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired - redirect to login
    window.location.href = '/login';
  } else if (error.response?.data?.message) {
    // Show server error message
    setMessage({ text: error.response.data.message, type: "error" });
  } else {
    // Generic error
    setMessage({ text: "Error desconocido", type: "error" });
  }
}
```

---

## 📊 Data Structures

### User Profile Object
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  bio?: string;
  birth_date?: string; // YYYY-MM-DD
  occupation?: string;
  profile_picture?: Buffer | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

### Security Log Object
```typescript
interface SecurityLog {
  id: number;
  user_id: number;
  action: string; // 'login' | 'logout' | 'password_change' | 'profile_update' | 'picture_upload'
  details?: Record<string, any>; // JSON object with action-specific data
  ip_address?: string;
  user_agent?: string;
  created_at: string; // ISO 8601
}
```

### Password Change Request
```typescript
interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}
```

### Profile Update Request
```typescript
interface ProfileUpdateRequest {
  name?: string;
  phone?: string;
  city?: string;
  country?: string;
  bio?: string;
  birth_date?: string;
  occupation?: string;
}
```

---

## 🚨 Rate Limiting & Quotas

Currently no rate limiting is implemented. Consider adding:
- **Password change**: Max 3 per day per user
- **Profile update**: Max 10 per day per user
- **Picture upload**: Max 2 per day per user
- **API calls**: Max 100 requests per minute per user

---

## 🔐 Security Considerations

### Password Hashing
- Algorithm: bcryptjs with strength 10
- Never stored in plain text
- Always compared using bcryptjs.compare()
- Never logged or transmitted in plain text

### File Upload
- Multer middleware validates file type
- File size limited to 5MB
- Only image formats allowed
- Stored as binary BLOB

### Authentication
- JWT tokens required for all endpoints (except picture retrieval)
- Token includes user ID and issued timestamp
- Token expiration handled by middleware
- Token stored in localStorage (frontend)

### Data Protection
- All sensitive operations logged in security_logs
- IP address captured for each action
- User agent captured for device tracking
- Email field read-only (cannot be changed via API)

---

## 🧪 Testing with cURL

### Get Profile
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/profile
```

### Update Profile
```bash
curl -X PUT \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","city":"Bogotá"}' \
  http://localhost:5000/api/profile
```

### Change Password
```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"password123","newPassword":"newPassword456"}' \
  http://localhost:5000/api/profile/change-password
```

### Upload Picture
```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -F "picture=@/path/to/image.jpg" \
  http://localhost:5000/api/profile/upload-picture
```

### Get Security Logs
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/profile/security-logs
```

---

## 📞 Debugging

### Common Issues & Solutions

**401 Unauthorized**
- Verify token is in localStorage
- Check token hasn't expired
- Verify Authorization header format: `Bearer {token}`

**404 Not Found**
- Check endpoint URL spelling
- Verify backend server is running on port 5000
- Check profile routes are registered in server.js

**500 Internal Server Error**
- Check backend logs in terminal
- Verify database connection
- Check file permissions for uploads

**CORS Error**
- Verify CORS is enabled in backend
- Check API_URL in frontend matches backend port
- Check Content-Type headers

---

**Document Version**: 1.0
**Last Updated**: 2025-01-15
**Status**: COMPLETE & TESTED
