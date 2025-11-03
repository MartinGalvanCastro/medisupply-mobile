# Test User Credentials

This file contains credentials for testing the MediSupply mobile app with mocked API calls.

## How to Enable Mock Mode

Make sure mocking is enabled in your `.env` file:

```bash
EXPO_PUBLIC_ENABLE_MOCKS=true
EXPO_PUBLIC_MOCK_DELAY=750
EXPO_PUBLIC_MOCK_LOGGING=true
```

Then restart the Expo dev server:

```bash
npm start -- --clear
```

---

## Test Users

### 1. Client User (Hospital Buyer)

**Email:** `client@medisupply.com`
**Password:** `Test1234!`

**Profile:**
- **Name:** Dr. Carlos Mendoza
- **Institution:** Hospital San Rafael de Bogotá
- **Type:** Hospital
- **Location:** Bogotá, Colombia
- **Phone:** +57 301 234 5678
- **NIT:** 900123456-7
- **Address:** Calle 45 #23-12, Chapinero

**Use this account to test:**
- Client-side order creation
- Viewing products and inventory
- Hospital/clinic workflows
- Client dashboard features

---

### 2. Seller User (Sales Representative)

**Email:** `seller@medisupply.com`
**Password:** `Test1234!`

**Profile:**
- **Name:** María González
- **Company:** MediSupply S.A.S
- **Location:** Medellín, Colombia
- **Phone:** +57 310 987 6543

**Use this account to test:**
- Creating orders for clients
- Managing visits
- Sales representative workflows
- Seller dashboard features

---

### 3. Admin User (Full Access)

**Email:** `admin@medisupply.com`
**Password:** `Admin1234!`

**Profile:**
- **Name:** Juan Pablo Ramírez
- **Company:** MediSupply S.A.S
- **Location:** Bogotá, Colombia
- **Phone:** +57 320 555 7890
- **Permissions:** All (client + seller + admin)

**Use this account to test:**
- Admin dashboard
- User management
- System-wide features
- All client and seller features

---

## Test Scenarios

### ✅ Valid Login
Use any of the credentials above with the exact email and password.

**Expected Result:**
- Status: 200 OK
- Successful login
- JWT tokens stored in secure storage
- User data loaded
- Console log: `[Mock] POST /auth/login - 200`

### ❌ Invalid Password
Use any email above with a wrong password (e.g., `WrongPassword123`)

**Example:**
- Email: `client@medisupply.com`
- Password: `WrongPassword123`

**Expected Result:**
- Status: 401 Unauthorized
- Error message: "Invalid email or password"
- No tokens stored
- Console log: `[Mock] POST /auth/login - 401`

### ❌ Non-existent User
Use an email not in the system (e.g., `notfound@medisupply.com`)

**Example:**
- Email: `notfound@medisupply.com`
- Password: `AnyPassword123`

**Expected Result:**
- Status: 401 Unauthorized
- Error message: "Invalid email or password"
- No tokens stored
- Console log: `[Mock] POST /auth/login - 401`

### ✅ Test Signup
Fill in the signup form with new user data

**Example:**
```json
{
  "email": "newclient@hospital.com",
  "password": "NewUser1234!",
  "name": "Dr. Ana López",
  "telefono": "+57 301 555 1234",
  "nombre_institucion": "Clínica del Norte",
  "tipo_institucion": "clinica",
  "nit": "900555666-7",
  "direccion": "Carrera 7 #45-67",
  "ciudad": "Medellín",
  "pais": "Colombia",
  "representante": "Dr. Ana López"
}
```

**Expected Result:**
- Status: 201 Created
- Success message: "Usuario creado exitosamente. Bienvenido a MediSupply, Dr. Ana López!"
- User ID returned
- Console log: `[Mock] POST /auth/signup - 201`

### ❌ Duplicate Email Signup
Try to sign up with an existing email (e.g., `client@medisupply.com`)

**Expected Result:**
- Status: 409 Conflict
- Error message: "User with this email already exists"
- Console log: `[Mock] POST /auth/signup - 409`

### ✅ Get Current User
Make a request to `/auth/me` with valid access token

**Expected Result:**
- Status: 200 OK
- User profile data returned
- Console log: `[Mock] GET /auth/me - 200`

### ❌ Get Current User (No Token)
Make a request to `/auth/me` without authorization header

**Expected Result:**
- Status: 401 Unauthorized
- Error message: "Missing or invalid authorization header"
- Console log: `[Mock] GET /auth/me - 401`

---

## Password Requirements

All test passwords follow these rules:
- **Minimum:** 8 characters
- **Contains:** Uppercase letter (A-Z)
- **Contains:** Lowercase letter (a-z)
- **Contains:** Number (0-9)
- **Contains:** Special character (!@#$%^&*)

**Valid examples:**
- `Test1234!` ✅
- `Admin1234!` ✅
- `NewUser1234!` ✅

**Invalid examples:**
- `test1234` ❌ (no uppercase, no special char)
- `TEST1234!` ❌ (no lowercase)
- `TestTest!` ❌ (no number)
- `Test123` ❌ (too short, no special char)

---

## Quick Copy/Paste Credentials

### Client Login
```
client@medisupply.com
Test1234!
```

### Seller Login
```
seller@medisupply.com
Test1234!
```

### Admin Login
```
admin@medisupply.com
Admin1234!
```

---

## Troubleshooting

### Mock API Not Working

**Symptom:** Login button doesn't respond, no console logs

**Solutions:**
1. Check console for `[Mock] Interceptor initialized` message at app start
2. Verify `EXPO_PUBLIC_ENABLE_MOCKS=true` in `.env` file
3. Restart the Expo dev server: `npm start -- --clear`
4. Check that mock files are not being ignored by bundler
5. Verify `@/api/mocks/interceptor.ts` is imported in `app/_layout.tsx`

### Login Fails with Correct Credentials

**Symptom:** 401 error with valid email/password

**Solutions:**
1. Double-check email/password (case-sensitive!)
2. Look for `[Mock] POST /auth/login - XXX` in console
3. Check for any error messages in red text
4. Verify mock users data in `/src/api/mocks/data/users.data.ts`
5. Clear app data and restart: `expo start --clear`

### User Data Not Loading After Login

**Symptom:** Login succeeds but user profile is empty

**Solutions:**
1. Check for `[Mock] GET /auth/me - 200` in console
2. Verify tokens were stored (check secure storage logs)
3. Check AuthProvider logs for token retrieval
4. Ensure authorization header is being sent
5. Check network tab in React Native Debugger

### JSON Parse Error

**Symptom:** `JSON Parse error: Unexpected character`

**Solutions:**
1. This should be fixed in the latest version
2. Verify handlers use `typeof config.data === 'string'` check
3. Check `/src/api/mocks/handlers/authentication.handlers.ts` has the fix
4. Pull latest changes if working in a team

### Signup Always Returns 409 Conflict

**Symptom:** Cannot create new users, always says email exists

**Solutions:**
1. Check if you're using an existing test email
2. Use a unique email like `test+${Date.now()}@example.com`
3. Restart app to clear mock users array
4. Note: Mock users are stored in memory, not persisted

### Slow Response Times

**Symptom:** All API calls take 3+ seconds

**Solutions:**
1. Check `EXPO_PUBLIC_MOCK_DELAY` in `.env` (default: 750ms)
2. Reduce delay for faster testing: `EXPO_PUBLIC_MOCK_DELAY=100`
3. Check if "slow" scenario is enabled in mock config
4. Verify no network issues causing additional delays

### Console Logs Not Showing

**Symptom:** No `[Mock]` logs visible

**Solutions:**
1. Set `EXPO_PUBLIC_MOCK_LOGGING=true` in `.env`
2. Check console filter settings (ensure "Info" level is visible)
3. Restart Expo dev server
4. Check if logs are being filtered out by your terminal

---

## Developer Notes

### Mock Data Source
- **Users:** `/src/api/mocks/data/users.data.ts`
- **Handlers:** `/src/api/mocks/handlers/authentication.handlers.ts`
- **Config:** `/src/api/mocks/config.ts`

### Mock Interceptor
- **Entry point:** `/src/api/mocks/interceptor.ts`
- **Initialization:** `app/_layout.tsx` (imported at app start)

### Toggle Mocking
Change `EXPO_PUBLIC_ENABLE_MOCKS` in `.env`:
- `true` - Use mock API (for development/testing)
- `false` - Use real API (for production/staging)

### Supported Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/signup` - User registration
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile

### Adding New Test Users
Edit `/src/api/mocks/data/users.data.ts` and add to `mockUsers` array:

```typescript
{
  userId: 'unique-id',
  email: 'test@example.com',
  password: 'Test1234!',
  name: 'Test User',
  userType: 'client',
  userGroups: ['client'],
  profile: {
    telefono: '+57 301 234 5678',
    nombreInstitucion: 'Test Hospital',
    // ... other fields
  },
  tokens: {
    accessToken: 'mock-access-token-unique',
    idToken: 'mock-id-token-unique',
    refreshToken: 'mock-refresh-token-unique',
    expiresIn: 3600,
  },
}
```

### Test Scenarios
To test different scenarios, modify `/src/api/mocks/config.ts`:

```typescript
scenarios: {
  authentication: 'success', // 'success' | 'error' | 'slow'
}
```

- **success** - Normal flow (default)
- **error** - All endpoints return 500 errors
- **slow** - 3 second delay on all requests

---

## Security Notes

⚠️ **IMPORTANT:** These are TEST CREDENTIALS for MOCK API ONLY

- **DO NOT** use these credentials in production
- **DO NOT** commit real user credentials to this file
- **DO NOT** use weak passwords like these in production
- Mock tokens are NOT real JWT tokens
- Mock authentication does NOT provide real security

The mock API is for development and testing purposes only. It simulates authentication flows without real security validation.

---

## Need Help?

If you're still experiencing issues:

1. Check the main documentation in `/MSW_SETUP_GUIDE.md`
2. Review implementation details in `/MSW_IMPLEMENTATION_SUMMARY.md`
3. See quick start guide in `/MSW_QUICK_START.md`
4. Check git history for recent changes
5. Ask the development team for support

---

**Last Updated:** 2025-11-02
**Version:** 1.0.0
**Maintained by:** MediSupply Development Team
