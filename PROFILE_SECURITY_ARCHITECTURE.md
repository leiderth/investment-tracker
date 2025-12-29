# 📐 Profile & Security System - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVESTMENT TRACKER APP                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────┐       ┌──────────────────────────┐│
│  │   FRONTEND (PORT 5173)   │       │   BACKEND (PORT 5000)    ││
│  │    React + Vite          │◄─────►│  Node.js + Express       ││
│  │                          │ HTTP  │                          ││
│  │  ┌──────────────────┐    │       │  ┌──────────────────┐   ││
│  │  │ Profile.jsx      │    │       │  │ profile.routes   │   ││
│  │  │                  │    │       │  │      .js         │   ││
│  │  │ • Info Tab       │    │       │  │                  │   ││
│  │  │ • Security Tab   │    │       │  │ 6 Endpoints      │   ││
│  │  │ • Picture Upload │    │       │  │                  │   ││
│  │  │ • Logs Display   │    │       │  └────────┬─────────┘   ││
│  │  └──────────────────┘    │       │           │              ││
│  │                          │       │  ┌────────▼─────────┐   ││
│  │  ┌──────────────────┐    │       │  │ profile.          │   ││
│  │  │ api.js           │    │       │  │ controller        │   ││
│  │  │                  │    │       │  │ .js               │   ││
│  │  │ • profileAPI     │    │       │  │                  │   ││
│  │  │ • axios config   │    │       │  │ 6 Functions      │   ││
│  │  │ • JWT intercept  │    │       │  │ (get, update,    │   ││
│  │  └──────────────────┘    │       │  │  password, pic,  │   ││
│  └──────────────────────────┘       │  │  logs)           │   ││
│                                      │  └────────┬─────────┘   ││
│                                      │           │              ││
│                                      │  ┌────────▼─────────┐   ││
│                                      │  │ middleware       │   ││
│                                      │  │ • auth           │   ││
│                                      │  │ • multer         │   ││
│                                      │  │ • logger         │   ││
│                                      │  └──────────────────┘   ││
│  ┌──────────────────────────┐       │                          ││
│  │   STORAGE                │       │                          ││
│  │   localStorage           │       └──────────────────────────┘│
│  │   • JWT token            │                                    │
│  │   • user data            │       ┌──────────────────────────┐│
│  └──────────────────────────┘       │   DATABASE (MySQL)      ││
│                                      │   investment_tracker    ││
│                                      │                         ││
│                                      │  ┌────────────────────┐ ││
│                                      │  │ users              │ ││
│                                      │  │ • name, email      │ ││
│                                      │  │ • phone, city      │ ││
│                                      │  │ • occupation       │ ││
│                                      │  │ • birth_date       │ ││
│                                      │  │ • bio              │ ││
│                                      │  │ • profile_picture  │ ││
│                                      │  │ • password_hash    │ ││
│                                      │  └────────────────────┘ ││
│                                      │                         ││
│                                      │  ┌────────────────────┐ ││
│                                      │  │ password_history   │ ││
│                                      │  │ • user_id          │ ││
│                                      │  │ • password_hash    │ ││
│                                      │  │ • changed_at       │ ││
│                                      │  └────────────────────┘ ││
│                                      │                         ││
│                                      │  ┌────────────────────┐ ││
│                                      │  │ security_logs      │ ││
│                                      │  │ • user_id          │ ││
│                                      │  │ • action           │ ││
│                                      │  │ • ip_address       │ ││
│                                      │  │ • user_agent       │ ││
│                                      │  │ • created_at       │ ││
│                                      │  └────────────────────┘ ││
│                                      └──────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    API ENDPOINT ROUTING                          │
└─────────────────────────────────────────────────────────────────┘

GET /api/profile
├─ Authentication: JWT Required
├─ Controller: getProfile()
├─ Database: SELECT users WHERE id = ?
└─ Response: User profile object

PUT /api/profile
├─ Authentication: JWT Required
├─ Body: { name, phone, city, country, bio, birth_date, occupation }
├─ Controller: updateProfile()
├─ Validation: Field length checks
├─ Database: UPDATE users SET ... WHERE id = ?
├─ Logging: INSERT INTO security_logs (action='profile_update')
└─ Response: Updated user object

POST /api/profile/change-password
├─ Authentication: JWT Required
├─ Body: { currentPassword, newPassword }
├─ Controller: changePassword()
├─ Validation: 
│  ├─ Current password verification (bcryptjs.compare)
│  ├─ Password length >= 6
│  └─ New password != current password
├─ Database: 
│  ├─ UPDATE users SET password_hash = ? WHERE id = ?
│  └─ INSERT INTO password_history (old hash)
├─ Logging: INSERT INTO security_logs (action='password_change')
└─ Response: Success message

POST /api/profile/upload-picture
├─ Authentication: JWT Required
├─ Middleware: multer (image file validation)
├─ Validation:
│  ├─ File type: JPEG, PNG, WebP, GIF only
│  └─ File size: <= 5MB
├─ Controller: uploadProfilePicture()
├─ Database: UPDATE users SET profile_picture = ? WHERE id = ?
├─ Logging: INSERT INTO security_logs (action='picture_upload')
└─ Response: Picture URL

GET /api/profile/picture/:userId
├─ Authentication: Optional (public)
├─ Controller: getProfilePicture()
├─ Database: SELECT profile_picture FROM users WHERE id = ?
└─ Response: Binary image data

GET /api/profile/security-logs
├─ Authentication: JWT Required
├─ Controller: getSecurityLogs()
├─ Database: SELECT * FROM security_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
└─ Response: Array of security log objects
```

---

## Data Flow: Update Profile

```
USER INTERACTION
        │
        ▼
┌────────────────────────────────────────────┐
│ Profile.jsx Component                      │
│ • User clicks "Editar"                     │
│ • setIsEditing(true)                       │
└────────────────────┬───────────────────────┘
                     │
                     ▼
           ┌─────────────────────┐
           │ Form becomes        │
           │ editable            │
           │ • Name field        │
           │ • Phone field       │
           │ • City field, etc.  │
           └─────────┬───────────┘
                     │
        User modifies fields
                     │
                     ▼
           ┌──────────────────┐
           │ User clicks      │
           │ "Guardar"        │
           └────────┬─────────┘
                    │
                    ▼
        ┌────────────────────────────────────┐
        │ Client Validation                  │
        │ • Check required fields            │
        │ • Validate field formats           │
        │ • Show error if invalid            │
        └────────────┬───────────────────────┘
                     │ Valid
                     ▼
        ┌────────────────────────────────────┐
        │ API Call                           │
        │ PUT /api/profile                   │
        │ Body: { name, phone, city, ... }   │
        │ Headers: Authorization: Bearer ... │
        └────────────┬───────────────────────┘
                     │
              ─────────────────
              │               │
          HTTP Request      Network
              │               │
              └───────┬───────┘
                      │
                      ▼
        ┌─────────────────────────────────────────┐
        │ Backend: Express Server (Port 5000)     │
        │ profile.routes.js                       │
        │ Middleware: authenticateToken           │
        └────────────┬────────────────────────────┘
                     │ Token verified, userId extracted
                     ▼
        ┌─────────────────────────────────────────┐
        │ profile.controller.js                   │
        │ updateProfile() function                │
        │                                         │
        │ 1. Validate inputs                      │
        │ 2. Construct UPDATE query               │
        │ 3. Execute database query               │
        └────────────┬────────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────────────────┐
        │ MySQL Database                       │
        │ UPDATE users SET                     │
        │   name = ?, phone = ?, city = ?     │
        │ WHERE id = 1                         │
        └────────────┬─────────────────────────┘
                     │ Success
                     ▼
        ┌──────────────────────────────────────┐
        │ Security Logging                     │
        │ INSERT INTO security_logs (          │
        │   user_id = 1,                       │
        │   action = 'profile_update',         │
        │   details = {...},                   │
        │   ip_address = '192.168.x.x',        │
        │   user_agent = 'Mozilla...'          │
        │ )                                    │
        └────────────┬─────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────────────────┐
        │ Server Response (200 OK)             │
        │ {                                    │
        │   message: "Perfil actualizado...", │
        │   user: { id, name, phone, ... }   │
        │ }                                    │
        └────────────┬─────────────────────────┘
                     │
              HTTP Response
                     │
                     ▼
        ┌──────────────────────────────────────┐
        │ Frontend: React Component            │
        │ • setLoading(false)                  │
        │ • setMessage(success)                │
        │ • setIsEditing(false)                │
        │ • updateProfileData()                │
        └────────────┬─────────────────────────┘
                     │
                     ▼
              ┌────────────────┐
              │ UI Updates:    │
              │ • Form shows   │
              │   saved values │
              │ • Success msg  │
              │   displayed    │
              │ • Edit button  │
              │   restored     │
              └────────────────┘
```

---

## Data Flow: Change Password

```
┌──────────────────────────────────────────────────────┐
│ User enters password change form                     │
│ • Current Password: [user types]                     │
│ • New Password: [user types]                         │
│ • Confirm Password: [user types]                     │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
        ┌─────────────────────────────────┐
        │ Client Validation               │
        │ ├─ Check: not empty             │
        │ ├─ Check: newPassword.length>=6 │
        │ ├─ Check: new === confirm       │
        │ └─ Show errors if invalid       │
        └──────────────┬──────────────────┘
                       │ Valid
                       ▼
        ┌──────────────────────────────────────┐
        │ API Call                             │
        │ POST /api/profile/change-password    │
        │ Body: {                              │
        │   currentPassword: "old123",         │
        │   newPassword: "new456"              │
        │ }                                    │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌────────────────────────────────────────────┐
        │ Backend: profile.controller.js             │
        │ changePassword() function                  │
        │                                            │
        │ Step 1: Get current password hash          │
        │ SELECT password_hash FROM users WHERE ... │
        │                                            │
        │ Step 2: Verify current password            │
        │ bcryptjs.compare(currentPassword, hash)    │
        │ ├─ If false → 401 error                    │
        │ └─ If true → Continue                      │
        │                                            │
        │ Step 3: Hash new password                  │
        │ bcryptjs.hash(newPassword, 10)             │
        │                                            │
        │ Step 4: Update password in users table     │
        │ UPDATE users SET password_hash = ? WHERE ..│
        │                                            │
        │ Step 5: Store old hash in history          │
        │ INSERT INTO password_history               │
        │   (user_id, password_hash, ...)            │
        │                                            │
        │ Step 6: Log the action                     │
        │ INSERT INTO security_logs                  │
        │   (user_id, action='password_change', ...) │
        │                                            │
        │ Step 7: Return success                     │
        └────────────┬─────────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────────────────────┐
        │ Frontend: React handles response          │
        │ • Clear password form fields              │
        │ • Show success message                    │
        │ • Reload security logs                    │
        │ • Reset form state                        │
        └──────────────────────────────────────────┘
        
    ✓ User can now login with new password
```

---

## Data Flow: Picture Upload

```
┌────────────────────────────────────────┐
│ Profile.jsx                            │
│ • User clicks "Subir Foto"             │
│ • File picker opened                   │
│ • User selects image                   │
└──────────────┬───────────────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ FileReader API               │
    │ readAsDataURL(file)          │
    │                              │
    │ Preview generated            │
    │ setProfilePicturePreview()   │
    └──────────┬───────────────────┘
               │
    User sees preview
               │
               ▼
    ┌──────────────────────────┐
    │ User clicks              │
    │ "Subir Foto"             │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────────────┐
    │ Create FormData                  │
    │ • formData.append('picture',     │
    │    fileInput.files[0])           │
    │ • headers: multipart/form-data   │
    └──────────┬───────────────────────┘
               │
               ▼
    ┌─────────────────────────────────────┐
    │ API Call                            │
    │ POST /api/profile/upload-picture    │
    │ FormData with file                  │
    └──────────┬──────────────────────────┘
               │
         HTTP Upload
               │
               ▼
    ┌────────────────────────────────────────┐
    │ Backend: Multer Middleware             │
    │ • Receives multipart/form-data         │
    │ • Validates MIME type                  │
    │   ├─ Only image/* allowed              │
    │   └─ jpeg, png, webp, gif OK          │
    │ • Checks file size                     │
    │   ├─ Max 5MB                           │
    │   └─ Error if exceeds                  │
    │ • Passes file buffer to controller     │
    └────────────┬─────────────────────────┘
                 │ Valid
                 ▼
    ┌────────────────────────────────────────┐
    │ Backend: profile.controller.js         │
    │ uploadProfilePicture()                 │
    │                                        │
    │ 1. Read file buffer                    │
    │    const picture = req.file.buffer     │
    │                                        │
    │ 2. Store in database                   │
    │    UPDATE users SET                    │
    │      profile_picture = ?               │
    │    WHERE id = ?                        │
    │                                        │
    │ 3. Log action                          │
    │    INSERT INTO security_logs           │
    │      (action='picture_upload', ...)    │
    │                                        │
    │ 4. Return success response             │
    └────────────┬────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────┐
    │ MySQL Database                   │
    │ LONGBLOB column updated          │
    │ • users.profile_picture = BLOB   │
    │ • users.updated_at updated       │
    └────────────┬─────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────┐
    │ Success Response (200 OK)            │
    │ {                                    │
    │   message: "Foto subida exitosamente│,
    │   pictureUrl: "/api/profile/pic/1"  │
    │ }                                    │
    └────────────┬───────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────┐
    │ Frontend: React updates              │
    │ • Show success message               │
    │ • Update profile picture display     │
    │ • Refresh profile data               │
    └──────────────────────────────────────┘
```

---

## Database Schema Relationships

```
┌─────────────────────────┐
│      USERS TABLE        │
├─────────────────────────┤
│ PK: id                  │
│ --- Basic Info ---      │
│ name                    │
│ email                   │
│ password_hash           │
│ --- Profile Info ---    │
│ phone                   │
│ city                    │
│ country                 │
│ occupation              │
│ birth_date              │
│ bio                     │
│ profile_picture (BLOB)  │
│ --- Timestamps ---      │
│ created_at              │
│ updated_at              │
└──────┬──────────────────┘
       │
       │ 1:Many relationship
       │
       ├──────────────────────────┐
       │                          │
       ▼                          ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│PASSWORD_HISTORY TABLE   │  │ SECURITY_LOGS TABLE     │
├─────────────────────────┤  ├─────────────────────────┤
│ PK: id                  │  │ PK: id                  │
│ FK: user_id ────┐       │  │ FK: user_id ────┐       │
│ password_hash   │       │  │ action          │       │
│ changed_at      │       │  │ details (JSON)  │       │
└────────────────┼────────┘  │ ip_address      │       │
                 │           │ user_agent      │       │
        Tracks password       │ created_at      │       │
        change history        │                 │       │
                              │ IDX: user_id    │       │
                              │      created_at │       │
                              └─────────────────┘       │
                                                        │
                     Audit trail for all security
                     actions (changes, password
                     updates, photo uploads, etc.)
```

---

## Authentication Flow

```
┌─────────────────────┐
│   Login (Existing)  │
│ • Email/Password    │
│ • JWT Token issued  │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────┐
│ Frontend localStorage        │
│ token: "eyJhbGci..."        │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ API Request to /api/profile           │
│ Headers: {                            │
│   Authorization: "Bearer eyJhbGci..." │
│ }                                     │
└──────────┬──────────────────────────┘
           │
           ▼
┌────────────────────────────────────┐
│ Backend: authenticateToken         │
│ Middleware                         │
│                                    │
│ 1. Extract token from header       │
│ 2. jwt.verify(token, secret)       │
│ 3. If valid:                       │
│    ├─ req.user.userId extracted    │
│    └─ Continue to controller       │
│ 4. If invalid:                     │
│    ├─ 401 Unauthorized             │
│    └─ Stop request                 │
└──────────┬───────────────────────┘
           │ Valid
           ▼
┌────────────────────────────┐
│ Profile Controller         │
│ Access req.user.userId     │
│ Query user's own data      │
│ Return response            │
└────────────────────────────┘
```

---

## Security Logging Architecture

```
USER ACTION → LOG CAPTURED
    │
    ├─ action: 'profile_update'
    ├─ user_id: 1
    ├─ ip_address: '192.168.1.100' (extracted from req)
    ├─ user_agent: 'Mozilla/5.0...' (from headers)
    ├─ details: { fields: ['name', 'phone'] }
    └─ created_at: '2025-01-15T10:30:00Z'
    
        │
        ▼
    DATABASE: security_logs table
    
        │
        ▼
    USER VIEW: Last 20 logs displayed
    
    Security Activities Tracked:
    • login          - User session started
    • logout         - User session ended
    • password_change - Password was changed
    • profile_update - Profile info modified
    • picture_upload - Profile picture uploaded
    • failed_login   - Invalid credentials attempt
```

---

## State Management Flow (React)

```
┌──────────────────────────────────────────────────────────────┐
│ Component: Profile.jsx - State Variables                      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ ┌─ Profile Data State                                        │
│ ├─ profileData: {}              # Full user object           │
│ │                                                             │
│ │  ┌─ Form Input States                                      │
│ │  ├─ formData: {                                            │
│ │  │    name, email, phone, city, country,                 │
│ │  │    bio, birth_date, occupation                         │
│ │  │  }                                                      │
│ │  │                                                         │
│ │  └─ passwordData: {                                        │
│ │       currentPassword, newPassword, confirmPassword       │
│ │     }                                                      │
│ │                                                             │
│ │  ┌─ UI State                                              │
│ │  ├─ activeTab: 'info' | 'security'  # Tab selection       │
│ │  ├─ isEditing: boolean              # Edit mode toggle    │
│ │  ├─ loading: boolean                # API loading state   │
│ │  ├─ showPassword: boolean           # Password visibility │
│ │  │                                                         │
│ │  └─ Message States                                        │
│ │      ├─ message: { text, type }     # Notifications       │
│ │      └─ profilePicturePreview: ""   # Image preview       │
│ │                                                             │
│ │  ┌─ Data Display State                                    │
│ │  └─ securityLogs: []                # Activity list        │
│ │                                                             │
│ └─ Event Handlers                                            │
│    ├─ handleInputChange()              # Update form state   │
│    ├─ handlePasswordChange()           # Update password form│
│    ├─ handleSaveProfile()              # API call - PUT      │
│    ├─ handleChangePassword()           # API call - POST     │
│    ├─ handleUploadProfilePicture()     # API call - POST     │
│    ├─ loadProfile()                    # Fetch user data     │
│    └─ loadSecurityLogs()               # Fetch activity      │
│                                                               │
└──────────────────────────────────────────────────────────────┘

useEffect Hooks:
├─ useEffect(() => loadProfile() && loadSecurityLogs(), [])
│  └─ Runs on component mount - fetches initial data
│
└─ useEffect(() => setMessage(null), [some condition])
   └─ Auto-clear success messages after timeout
```

---

## Complete Request-Response Cycle

```
PROFILE UPDATE REQUEST-RESPONSE CYCLE
════════════════════════════════════════════════════════════════

CLIENT (React)                          SERVER (Express)
│                                            │
├─ formData = {name, phone, ...}            │
│                                            │
├─ setLoading(true)                         │
│                                            │
├─ profileAPI.updateProfile(data)           │
│  └─ axios.put('/profile', data)           │
│     └─ headers: {                         │
│        Authorization: 'Bearer token...'   │
│     }                                     │
│                                            ├─ authenticateToken middleware
│        REQUEST ──────────────────────────►├─ Verify JWT
│                                            ├─ Extract userId
│                                            │
│                                            ├─ updateProfile()
│                                            ├─ Validate inputs
│                                            ├─ UPDATE users table
│                                            ├─ Log to security_logs
│                                            │
│       RESPONSE ◄────────────────────────── ├─ res.json(success)
│                                            │
├─ setLoading(false)                        │
├─ setMessage({ type: 'success', ...})      │
├─ setIsEditing(false)                      │
├─ setFormData(response.data.user)          │
│                                            │
├─ Display success UI                       │
│  ├─ Hide form inputs                      │
│  ├─ Show success message                  │
│  └─ Enable "Editar" button                │
│                                            │
└─ User sees confirmation                   │
```

---

## Error Handling Flow

```
┌─────────────────────────────────────┐
│ User Action                         │
│ (Update, Password, Upload, etc.)    │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌─ Client Validation
        │  ├─ Check required fields
        │  ├─ Check field formats
        │  └─ Show error if invalid → STOP
        │
        └─► Continue if valid
               │
               ▼
        ┌─ API Request
        │  ├─ Network error
        │  │  └─ Show network error
        │  │
        │  └─ Server error response
        │     │
        │     ├─ 400 (Bad Request)
        │     │  ├─ Invalid data format
        │     │  ├─ Validation failed
        │     │  └─ Display error message
        │     │
        │     ├─ 401 (Unauthorized)
        │     │  ├─ Token expired
        │     │  ├─ Invalid token
        │     │  └─ Redirect to login
        │     │
        │     └─ 500 (Server Error)
        │        ├─ Database error
        │        ├─ File system error
        │        └─ Show generic error
        │
        └─► Success (200)
            ├─ Update component state
            ├─ Display success message
            └─ Auto-dismiss after 3 seconds
```

---

## Performance Considerations

```
┌──────────────────────────────────┐
│ FRONTEND OPTIMIZATION            │
├──────────────────────────────────┤
│ • useEffect cleanup functions   │
│ • Prevent unnecessary re-renders │
│ • Lazy load security logs       │
│ • Image optimization            │
│ • LocalStorage caching          │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ BACKEND OPTIMIZATION            │
├──────────────────────────────────┤
│ • Connection pooling            │
│ • Query optimization            │
│ • Index on security_logs        │
│ • Async/await non-blocking      │
│ • File buffer streaming         │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ DATABASE OPTIMIZATION           │
├──────────────────────────────────┤
│ • Index: security_logs          │
│   (user_id, created_at)         │
│ • LONGBLOB for image storage    │
│ • Proper data types             │
│ • Foreign key constraints       │
└──────────────────────────────────┘
```

---

**This diagram shows the complete architecture and data flow of the Profile & Security system.**

Use this as reference when understanding how components interact and data flows through the system.
