# Authentication & Authorization Guide

## Overview

This e-commerce store implements a complete authentication and authorization system using Supabase Auth with role-based access control (RBAC).

## Features

✅ User authentication (login/signup)
✅ Role-based access control (admin/user)
✅ Protected admin routes
✅ Middleware for route protection
✅ Conditional UI rendering
✅ Session management
✅ Automatic profile creation

## Setup Instructions

### 1. Run Database Migrations

Execute the SQL in `lib/supabase-schema-auth.sql` in your Supabase SQL Editor:

```sql
-- Creates profiles table
-- Sets up RLS policies
-- Creates trigger for automatic profile creation
```

### 2. Create Admin User

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" or sign up through the app
3. Copy the user's UUID
4. Run this SQL to make them admin:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
```

### 3. Environment Variables

Ensure these are in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## User Roles

### Admin
- Full access to admin dashboard
- Can manage products
- Can manage orders
- Can view all data

### User (Default)
- Can browse products
- Can add to cart
- Can place orders
- Cannot access admin routes

## Route Structure

### Public Routes
- `/` - Home page
- `/shop` - Product listing
- `/product/[id]` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/login` - Login page
- `/signup` - Sign up page

### Protected Routes (Admin Only)
- `/admin` - Admin dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management

### Special Routes
- `/access-denied` - Shown when non-admin tries to access admin routes

## Authentication Flow

### Sign Up
1. User fills signup form
2. Supabase creates auth user
3. Trigger automatically creates profile with role='user'
4. User is logged in
5. Redirected to homepage

### Sign In
1. User enters credentials
2. Supabase validates
3. Profile is fetched
4. User is redirected to intended page

### Admin Access
1. User tries to access `/admin`
2. Middleware checks authentication
3. Middleware checks role
4. If admin: allow access
5. If not admin: redirect to `/access-denied`

## Middleware Protection

Located in `middleware.ts`:

```typescript
export async function middleware(req: NextRequest) {
  // Check authentication
  if (!session) {
    return redirect to login
  }
  
  // Check admin role
  if (role !== 'admin') {
    return redirect to access-denied
  }
  
  return allow access
}
```

## Auth Context

Located in `lib/auth-context.tsx`:

### Available Functions

```typescript
const {
  user,          // Current user object
  profile,       // User profile with role
  loading,       // Loading state
  isAdmin,       // Boolean: is user admin?
  signIn,        // Sign in function
  signUp,        // Sign up function
  signOut,       // Sign out function
  refreshProfile // Refresh profile data
} = useAuth()
```

### Usage Example

```typescript
'use client'

import { useAuth } from '@/lib/auth-context'

export default function MyComponent() {
  const { user, isAdmin, signOut } = useAuth()

  if (!user) {
    return <p>Please log in</p>
  }

  return (
    <div>
      <p>Welcome, {user.email}</p>
      {isAdmin && <p>You are an admin!</p>}
      <button onClick={signOut}>Logout</button>
    </div>
  )
}
```

## Conditional Rendering

### Show Admin Link Only to Admins

```typescript
{isAdmin && (
  <Link href="/admin">Admin Dashboard</Link>
)}
```

### Show Content Based on Auth

```typescript
{user ? (
  <p>Logged in as {user.email}</p>
) : (
  <Link href="/login">Login</Link>
)}
```

## Security Features

### 1. Route Protection
- Middleware blocks unauthorized access
- Redirects to login if not authenticated
- Redirects to access-denied if not admin

### 2. Row Level Security (RLS)
- Users can only view their own profile
- Admins can view all profiles
- Enforced at database level

### 3. Session Management
- Automatic session refresh
- Secure token storage
- Session expiration handling

### 4. Password Security
- Minimum 6 characters
- Hashed by Supabase
- Never stored in plain text

## Testing

### Test Accounts

Create these test accounts:

**Admin Account:**
```
Email: admin@example.com
Password: admin123
Role: admin
```

**User Account:**
```
Email: user@example.com
Password: user123
Role: user
```

### Test Scenarios

1. **Login as admin**
   - Should see "Admin" link in navbar
   - Can access `/admin` routes
   - Can manage products and orders

2. **Login as user**
   - Should NOT see "Admin" link
   - Cannot access `/admin` routes
   - Redirected to access-denied if tries

3. **Not logged in**
   - Cannot access `/admin` routes
   - Redirected to login page
   - Can browse public pages

## Troubleshooting

### Admin Link Not Showing

1. Check user is logged in
2. Verify role in database:
   ```sql
   SELECT * FROM profiles WHERE email = 'your@email.com';
   ```
3. Update role if needed:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```

### Cannot Access Admin Routes

1. Clear browser cache
2. Log out and log back in
3. Check middleware is running
4. Verify Supabase connection

### Profile Not Created

1. Check trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
2. Manually create profile:
   ```sql
   INSERT INTO profiles (id, email, role)
   VALUES ('user-uuid', 'email@example.com', 'user');
   ```

### Session Issues

1. Check Supabase URL and keys
2. Verify auth is enabled in Supabase
3. Check browser console for errors
4. Try incognito mode

## Database Schema

### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Roles

- `admin` - Full access
- `user` - Limited access (default)

## Best Practices

1. **Never hardcode admin emails**
   - Use database roles
   - Update via SQL or admin panel

2. **Always check auth on server**
   - Use middleware
   - Don't rely on client-side checks

3. **Implement proper RLS**
   - Protect sensitive data
   - Test policies thoroughly

4. **Handle errors gracefully**
   - Show user-friendly messages
   - Log errors for debugging

5. **Keep sessions secure**
   - Use HTTPS in production
   - Set proper cookie settings
   - Implement CSRF protection

## Production Checklist

- [ ] Set up proper email verification
- [ ] Configure password reset flow
- [ ] Implement rate limiting
- [ ] Add 2FA for admin accounts
- [ ] Set up audit logging
- [ ] Configure session timeout
- [ ] Test all auth flows
- [ ] Review RLS policies
- [ ] Set up monitoring
- [ ] Document admin procedures

## Support

For authentication issues:
- Check Supabase Auth logs
- Review browser console
- Test with different browsers
- Verify database policies
