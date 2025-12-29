# 🚀 Quick Start - Profile & Security Testing

## ⚡ Quick Setup (Already Complete)

✅ **Backend Server**: Running on http://localhost:5000
✅ **Frontend Server**: Running on http://localhost:5173
✅ **Database**: MySQL investment_tracker with all tables
✅ **Dependencies**: All installed (including multer)

---

## 🔐 Test Credentials

```
Email:    leider.epalacios@gmail.com
Password: password123
```

---

## 📋 5-Minute Test Flow

### 1. **Open Application** (30 seconds)
```
1. Open browser: http://localhost:5173
2. You should see the login page
```

### 2. **Login** (30 seconds)
```
1. Email: leider.epalacios@gmail.com
2. Password: password123
3. Click "Iniciar Sesión"
4. Wait for redirect to Dashboard
```

### 3. **Navigate to Profile** (30 seconds)
```
1. Click "Profile" or "Mi Perfil" in navigation
2. You should see the Profile page with two tabs:
   - Information Personal (selected)
   - Seguridad
```

### 4. **Test Profile Update** (2 minutes)
```
STEP 1: View Current Profile
  - See your current information displayed
  - Email field is read-only
  - Other fields show current values (may be empty)

STEP 2: Edit Profile
  - Click "Editar" button
  - All fields become editable
  - Click "Cancelar" to revert without saving

STEP 3: Update Information
  - Click "Editar" button again
  - Fill in or update these fields:
    * Name: "Test User Name"
    * Phone: "+57 300 1234567"
    * City: "Bogotá"
    * Country: "Colombia"
    * Occupation: "Software Engineer"
    * Bio: "Test biography"
    * Birth Date: Pick a date
  
STEP 4: Save Changes
  - Click "Guardar" button
  - Wait for "✓ Perfil actualizado exitosamente" message
  - Form becomes read-only again
  - Refresh page - changes should persist

STEP 5: Test Picture Upload
  - Click "Subir Foto" button
  - Select an image file from your computer (JPEG/PNG)
  - Preview should appear
  - Click "Subir Foto" to upload
  - Wait for success message
  - Profile picture should update
```

### 5. **Test Security Tab** (2 minutes)
```
STEP 1: Change Password
  - Click "Seguridad" tab
  - You should see "Cambiar Contraseña" form

STEP 2: Test Validation
  - Leave fields empty, try to submit → Error
  - Current password: "wrongpassword" → Error
  - New passwords don't match → Error
  - Password < 6 characters → Error

STEP 3: Change Password
  - Current Password: password123
  - New Password: NewPassword456
  - Confirm Password: NewPassword456
  - Click "Cambiar Contraseña"
  - Wait for success message
  - Form clears

STEP 4: Test New Password
  - Click "Cerrar Sesión" (if available)
  - Or open new tab: http://localhost:5173
  - Login with:
    * Email: leider.epalacios@gmail.com
    * Password: NewPassword456
  - Should successfully login

STEP 5: View Security Tips
  - Scroll down in Security tab
  - Read security recommendations
  - Tips include: password strength, frequency, uniqueness

STEP 6: Check Security Logs
  - Scroll further down
  - See "Actividad de Seguridad" section
  - Should show:
    * password_change (from step 3)
    * login events
    * profile_update (from step 4)
    * picture_upload (from step 4)
  - Each log shows: action, timestamp, IP address
```

---

## ✅ Success Criteria

### Profile Information Tab - PASS if:
- [ ] Can edit profile fields
- [ ] Changes save successfully
- [ ] Refreshing page preserves changes
- [ ] Picture upload works
- [ ] Success messages appear
- [ ] Dark mode styling works

### Security Tab - PASS if:
- [ ] Password change validation works
- [ ] Old password verification fails with wrong password
- [ ] New passwords must match
- [ ] Password must be 6+ characters
- [ ] Login with new password succeeds
- [ ] Security tips are visible
- [ ] Security logs show recent actions

---

## 🐛 Common Issues & Fixes

### "404 Profile Not Found"
**Cause**: API endpoint not registered
**Fix**: 
1. Stop backend: Kill Node.js process
2. Restart: `cd backend && node src/server.js`
3. Verify output shows profile routes registered

### "Failed to upload picture"
**Cause**: File type or size issue
**Fix**:
- Only JPEG, PNG, WebP, GIF supported
- Maximum 5MB file size
- Check file size: right-click → Properties

### "Password change fails silently"
**Cause**: Current password incorrect
**Fix**:
- Verify you're using: password123 (or new password from previous change)
- Check Caps Lock
- If forgotten, use admin tools to reset

### "Security logs empty"
**Cause**: No actions logged yet
**Fix**:
- Perform an action (update profile, change password)
- Wait 2-3 seconds
- Refresh page
- Logs should appear

### "Profile picture doesn't display"
**Cause**: File stored but not rendering
**Fix**:
- Check browser console for errors
- Verify file was uploaded (check server logs)
- Try uploading different image
- Clear browser cache: Ctrl+Shift+Delete

---

## 📊 Backend Console Output

You should see these messages when backend starts:
```
✅ Servidor corriendo en http://localhost:5000
✅ Conexión a MySQL exitosa
[Profile routes registered if available]
```

When you make requests, you'll see:
```
[GET] /api/profile
[PUT] /api/profile
[POST] /api/profile/change-password
[POST] /api/profile/upload-picture
[GET] /api/profile/security-logs
```

---

## 💻 Frontend Console

Open DevTools (F12) → Console tab to see:
- Network requests to API endpoints
- Profile data loaded
- Form state changes
- Error messages if any

---

## 🔄 Reset Everything

If you want to reset and start fresh:

### Option 1: Clear User Data
```sql
DELETE FROM password_history WHERE user_id = 1;
DELETE FROM security_logs WHERE user_id = 1;
UPDATE users SET 
  phone = NULL,
  city = NULL,
  profile_picture = NULL,
  bio = NULL,
  birth_date = NULL,
  occupation = NULL,
  password_hash = '$2a$10$6vsfkyCK/amEeM8hlyhl.OX9CZXHBFqIXJvAaKgWUgKQka5r6cee6'
WHERE id = 1;
```

### Option 2: Kill Servers and Restart
```powershell
# In PowerShell
Stop-Process -Name node -Force
# Wait 2-3 seconds
# Then restart both servers
```

---

## 📁 Key Files

### Backend Implementation
- **Controller**: `backend/src/controllers/profile.controller.js`
- **Routes**: `backend/src/routes/profile.routes.js`
- **Server**: `backend/src/server.js` (routes registered here)

### Frontend Implementation
- **Page**: `frontend/src/pages/Profile.jsx`
- **API Service**: `frontend/src/services/api.js` (profileAPI)
- **Hook**: `frontend/src/hooks/useAuth.js` (for user context)

### Database
- **Schema**: `database/update-users-table.sql` (changes applied)
- **Tables**: 
  - users (extended with profile fields)
  - password_history (new)
  - security_logs (new)

---

## 🎯 Next Steps

After successful testing:

1. **Review Logs**
   - Check backend console for any errors
   - Check browser console (F12) for warnings

2. **Expand Features** (Optional)
   - Add two-factor authentication (2FA)
   - Add account deactivation
   - Add login from new device confirmation
   - Add session management (see all active sessions)

3. **Improve UI** (Optional)
   - Add loading spinners during operations
   - Add confirmation dialogs for destructive actions
   - Add toast notifications library
   - Add form autosave feature

4. **Performance** (Optional)
   - Add image compression before upload
   - Add caching for profile data
   - Add pagination for security logs

---

## 📞 Questions?

Refer to the complete documentation:
📄 **PROFILE_SECURITY_COMPLETE.md** - Full implementation details

---

**Status**: ✅ READY FOR TESTING
**Last Updated**: 2025-01-15
**Estimated Test Time**: 5-10 minutes
