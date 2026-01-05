# Authentication Flow Implementation

Implements complete authentication and authorization flows using Better Auth with JWT tokens for secure, stateless authentication.

## Purpose

This skill implements end-to-end authentication flows including user registration, login, JWT token generation and verification, protected routes, and user-scoped data access. It integrates Better Auth on the backend with JWT token management and secure frontend authentication patterns.

## Core Capabilities

- **Better Auth Configuration**: Setup Better Auth for JWT token generation
- **User Registration**: Sign up flow with password hashing and validation
- **User Login**: Authenticate users and issue JWT tokens
- **JWT Token Management**: Generate, sign, verify, and refresh tokens
- **Protected Routes**: Frontend route protection with authentication checks
- **Protected Endpoints**: Backend API endpoint protection with JWT verification
- **User Context**: Extract user from JWT and scope data access
- **Token Refresh**: Handle token expiry with refresh tokens
- **Session Management**: Stateless authentication without server-side sessions
- **Security Best Practices**: Password hashing, token expiry, HTTPS enforcement

## When to Use This Skill

Use this skill when:
- Implementing user registration and login functionality
- Securing API endpoints with JWT authentication
- Protecting frontend routes from unauthenticated access
- Setting up user-scoped data access (users only see their own data)
- Implementing logout functionality
- Handling token refresh and expiry
- Converting from session-based to token-based authentication
- Integrating Better Auth with FastAPI backend

Do NOT use this skill for:
- OAuth/Social login (requires separate Better Auth configuration)
- Multi-factor authentication (requires MFA extension)
- Role-based access control beyond basic user/admin (requires custom implementation)
- Database schema design (use DB Model Generator)
- Frontend UI components (use Frontend Component Generator)

## Execution Workflow

### Step 1: Specification Analysis

**Input Sources**:
- Auth Spec: `@specs/features/authentication.md`
- API Spec: `@specs/api/auth.md`
- User Model: `Backend/app/models/user.py`

**Extract**:
1. Authentication methods (email/password, social, etc.)
2. JWT token requirements (expiry, claims, secret)
3. Protected routes and endpoints
4. User model fields (email, password, etc.)
5. Registration validation rules
6. Session management strategy

### Step 2: Backend Authentication Setup

**Better Auth Configuration**:
1. Install Better Auth library
2. Configure JWT secret and algorithm
3. Setup password hashing (bcrypt)
4. Create auth routes (register, login, logout)
5. Implement JWT token generation
6. Create token verification dependency

**FastAPI Integration**:
1. Create auth router
2. Implement registration endpoint
3. Implement login endpoint
4. Create `get_current_user` dependency
5. Apply dependency to protected endpoints

### Step 3: JWT Token Implementation

**Token Structure**:
1. Define JWT claims (sub, exp, iat)
2. Set token expiry (e.g., 1 hour for access, 7 days for refresh)
3. Generate signed tokens
4. Verify and decode tokens
5. Handle token expiry errors

### Step 4: Frontend Authentication

**Login/Signup Flow**:
1. Create login/signup forms
2. Submit credentials to backend
3. Receive and store JWT token
4. Redirect to dashboard

**Token Storage**:
1. Store in httpOnly cookies (most secure) OR
2. Store in localStorage (easier but less secure)
3. Include token in all API requests

**Route Protection**:
1. Check authentication status
2. Redirect to login if unauthenticated
3. Show loading state during check

### Step 5: User Context and Scoping

**Backend**:
1. Extract user from JWT token
2. Use `get_current_user` dependency
3. Filter queries by `user_id`
4. Verify ownership before updates/deletes

**Frontend**:
1. Display user info from token
2. Handle logout (clear token)
3. Redirect on 401 errors

## Templates

### Template 1: Better Auth Configuration (Backend)

```python
# Backend/app/auth.py

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status

# Configuration
SECRET_KEY = "your-secret-key-here"  # Should be from environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hour
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: Data to encode in the token (typically {"sub": user_id})
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow()
    })

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token with longer expiry"""
    expires_delta = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return create_access_token(data, expires_delta)


def verify_token(token: str) -> dict:
    """
    Verify and decode a JWT token.

    Args:
        token: JWT token string

    Returns:
        Decoded token payload

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
```

### Template 2: Authentication Routes (Backend)

```python
# Backend/app/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserResponse
)
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token
)
from app.dependencies import get_db_session

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user"
)
async def register(
    user_data: UserRegister,
    session: AsyncSession = Depends(get_db_session)
) -> TokenResponse:
    """
    Register a new user account.

    - Validates email uniqueness
    - Hashes password with bcrypt
    - Creates user record
    - Returns JWT access and refresh tokens
    """
    # Check if email already exists
    query = select(User).where(User.email == user_data.email)
    result = await session.execute(query)
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        name=user_data.name
    )

    session.add(user)
    await session.commit()
    await session.refresh(user)

    # Generate tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name
        )
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login user"
)
async def login(
    credentials: UserLogin,
    session: AsyncSession = Depends(get_db_session)
) -> TokenResponse:
    """
    Authenticate user and return JWT tokens.

    - Validates email and password
    - Returns JWT access and refresh tokens
    """
    # Find user by email
    query = select(User).where(User.email == credentials.email)
    result = await session.execute(query)
    user = result.scalar_one_or_none()

    # Verify user exists and password is correct
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )

    # Generate tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name
        )
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token"
)
async def refresh_token(
    refresh_token: str,
    session: AsyncSession = Depends(get_db_session)
) -> TokenResponse:
    """
    Generate new access token using refresh token.

    - Validates refresh token
    - Returns new access and refresh tokens
    """
    from app.auth import verify_token

    # Verify refresh token
    payload = verify_token(refresh_token)
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    # Get user
    query = select(User).where(User.id == int(user_id))
    result = await session.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Generate new tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name
        )
    )
```

### Template 3: Authentication Dependency (Backend)

```python
# Backend/app/dependencies.py

from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.user import User
from app.auth import verify_token

security = HTTPBearer()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Database session dependency"""
    async with get_session() as session:
        yield session


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_db_session)
) -> User:
    """
    Get current authenticated user from JWT token.

    Args:
        credentials: HTTP Bearer token from Authorization header
        session: Database session

    Returns:
        Current user object

    Raises:
        401: Invalid or expired token
        404: User not found
        403: User account is disabled
    """
    token = credentials.credentials

    # Verify and decode token
    payload = verify_token(token)
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    query = select(User).where(User.id == int(user_id))
    result = await session.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user (wrapper for clarity).

    Use this as dependency for protected endpoints.
    """
    return current_user


async def get_current_superuser(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current user and verify superuser status.

    Use this for admin-only endpoints.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user
```

### Template 4: Authentication Schemas (Backend)

```python
# Backend/app/schemas/auth.py

from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRegister(BaseModel):
    """Schema for user registration"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, max_length=100, description="User password")
    name: Optional[str] = Field(None, max_length=255, description="User display name")

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class UserResponse(BaseModel):
    """Schema for user data in responses"""
    id: int
    email: str
    name: Optional[str]

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for authentication token response"""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserResponse = Field(..., description="User information")


class TokenData(BaseModel):
    """Schema for decoded token data"""
    user_id: Optional[int] = None
```

### Template 5: Protected Endpoint Example (Backend)

```python
# Backend/app/routes/todos.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.todo import Todo
from app.models.user import User
from app.schemas.todo import TodoCreate, TodoResponse
from app.dependencies import get_current_user, get_db_session

router = APIRouter(prefix="/api/todos", tags=["todos"])


@router.post(
    "/",
    response_model=TodoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new todo"
)
async def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),  # JWT authentication
    session: AsyncSession = Depends(get_db_session)
) -> TodoResponse:
    """
    Create a new todo for the authenticated user.

    Requires: JWT authentication
    """
    # Create todo with user_id from JWT token
    todo = Todo(
        **todo_data.model_dump(),
        user_id=current_user.id  # User scoping
    )

    session.add(todo)
    await session.commit()
    await session.refresh(todo)

    return todo


@router.get(
    "/",
    response_model=List[TodoResponse],
    summary="List user's todos"
)
async def list_todos(
    current_user: User = Depends(get_current_user),  # JWT authentication
    session: AsyncSession = Depends(get_db_session)
) -> List[TodoResponse]:
    """
    List all todos belonging to the authenticated user.

    Requires: JWT authentication
    User scoping: Only returns current user's todos
    """
    # Query with user scoping
    query = select(Todo).where(Todo.user_id == current_user.id)
    result = await session.execute(query)
    todos = result.scalars().all()

    return todos


@router.patch(
    "/{todo_id}",
    response_model=TodoResponse,
    summary="Update a todo"
)
async def update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    current_user: User = Depends(get_current_user),  # JWT authentication
    session: AsyncSession = Depends(get_db_session)
) -> TodoResponse:
    """
    Update a todo.

    Requires: JWT authentication
    Ownership verification: User can only update their own todos
    """
    # Fetch todo with ownership verification
    query = select(Todo).where(
        Todo.id == todo_id,
        Todo.user_id == current_user.id  # Ownership check
    )
    result = await session.execute(query)
    todo = result.scalar_one_or_none()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found or access denied"
        )

    # Update todo
    update_data = todo_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(todo, key, value)

    session.add(todo)
    await session.commit()
    await session.refresh(todo)

    return todo
```

### Template 6: Frontend Login Component

```tsx
// Frontend/app/login/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { authApi } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // Login via API client
      const response = await authApi.login({
        email,
        password
      })

      // Success - token is automatically stored by API client
      toast({
        title: "Success",
        description: `Welcome back, ${response.user.name || response.user.email}!`,
      })

      // Redirect to dashboard
      router.push('/dashboard')

    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={errors.email ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={errors.password ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:underline">
                Sign up
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
```

### Template 7: Frontend Auth Context

```tsx
// Frontend/lib/auth-context.tsx

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from './api'

interface User {
  id: number
  email: string
  name: string | null
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      // Optional: Verify token with backend
      // For now, just check if token exists
      // In production, decode JWT and check expiry
      const decoded = JSON.parse(atob(token.split('.')[1]))
      const isExpired = decoded.exp * 1000 < Date.now()

      if (isExpired) {
        logout()
      } else {
        // Get user data from localStorage or API
        const userData = localStorage.getItem('user_data')
        if (userData) {
          setUser(JSON.parse(userData))
        }
      }
    } catch (error) {
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    setUser(response.user)
    localStorage.setItem('user_data', JSON.stringify(response.user))
  }

  const register = async (email: string, password: string, name?: string) => {
    const response = await authApi.register({ email, password, name })
    setUser(response.user)
    localStorage.setItem('user_data', JSON.stringify(response.user))
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### Template 8: Frontend Protected Route

```tsx
// Frontend/app/dashboard/layout.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user, logout } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex space-x-8">
              <a href="/dashboard" className="text-gray-900 font-medium">
                Dashboard
              </a>
              <a href="/dashboard/todos" className="text-gray-600 hover:text-gray-900">
                Todos
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name || user?.email}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Protected Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
```

## Security Best Practices

### 1. Password Security

```python
# ✅ DO: Use strong password hashing
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwd_context.hash(password)

# ❌ DON'T: Store plain passwords
user.password = password  # NEVER DO THIS

# ✅ DO: Enforce password strength
@field_validator('password')
def validate_password(cls, v):
    if len(v) < 8:
        raise ValueError('Password too short')
    if not any(char.isdigit() for char in v):
        raise ValueError('Password must contain digit')
    return v
```

### 2. JWT Token Security

```python
# ✅ DO: Use environment variables for secrets
import os
SECRET_KEY = os.getenv("JWT_SECRET_KEY")

# ❌ DON'T: Hardcode secrets
SECRET_KEY = "my-secret-key"  # NEVER DO THIS

# ✅ DO: Set appropriate token expiry
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hour
REFRESH_TOKEN_EXPIRE_DAYS = 7

# ✅ DO: Include expiry in token
to_encode.update({"exp": expire, "iat": datetime.utcnow()})
```

### 3. HTTPS Enforcement

```python
# ✅ DO: Use secure cookies in production
from fastapi.responses import Response

response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,
    secure=True,  # HTTPS only
    samesite="lax"
)

# Frontend: Use HTTPS for all API calls
const API_URL = process.env.NEXT_PUBLIC_API_URL  // https://api.example.com
```

### 4. Token Storage (Frontend)

```typescript
// ✅ BEST: httpOnly cookies (set by backend)
// Most secure, not accessible via JavaScript

// ✅ OK: localStorage (easier but less secure)
localStorage.setItem('auth_token', token)

// ❌ AVOID: sessionStorage (cleared on tab close)
// ❌ NEVER: Plain cookies accessible via JS
```

### 5. User Scoping

```python
# ✅ DO: Always scope by user_id
query = select(Todo).where(
    Todo.id == todo_id,
    Todo.user_id == current_user.id  # Critical!
)

# ❌ DON'T: Trust client-provided user_id
# Get user_id from JWT token, not request body

# ✅ DO: Verify ownership before updates
if todo.user_id != current_user.id:
    raise HTTPException(status_code=403, detail="Access denied")
```

## Tool Usage

### Required Tools

**Read**: Load authentication specifications
- `Read(@specs/features/authentication.md)` - Auth requirements
- `Read(Backend/app/models/user.py)` - User model
- `Read(Backend/app/auth.py)` - Existing auth code

**Write**: Create auth files
- `Write(Backend/app/auth.py)` - JWT utilities
- `Write(Backend/app/routes/auth.py)` - Auth endpoints
- `Write(Frontend/app/login/page.tsx)` - Login page

**Edit**: Update existing files
- `Edit(Backend/app/dependencies.py)` - Add get_current_user
- `Edit(Frontend/lib/api.ts)` - Add auth API functions

**Bash**: Install dependencies
- `Bash("cd Backend && pip install python-jose[cryptography] passlib[bcrypt]")` - Install auth libraries
- `Bash("cd Frontend && npm install jose")` - Install JWT library

## Decision Points

### Token Storage Strategy

**httpOnly Cookies** (Most Secure):
- Set by backend in response
- Not accessible via JavaScript
- Auto-sent with requests
- Use when: Production, high security

**localStorage** (Easier):
- Stored client-side
- Must manually include in requests
- Vulnerable to XSS
- Use when: Development, internal tools

### Token Expiry Strategy

**Short-lived Access Tokens** (Recommended):
- Access: 15 min - 1 hour
- Refresh: 7-30 days
- More secure, requires refresh flow

**Long-lived Tokens**:
- Access: 24 hours - 7 days
- No refresh needed
- Simpler but less secure

### Password Validation

**Basic** (Minimum):
- Length >= 8 characters
- Use when: Internal tools

**Strong** (Recommended):
- Length >= 8
- 1 uppercase, 1 lowercase, 1 digit
- Use when: Production apps

**Very Strong**:
- Length >= 12
- Uppercase, lowercase, digit, special char
- Use when: Financial/sensitive apps

## Common Patterns

### Pattern 1: Automatic Token Refresh

```typescript
// Frontend: Intercept 401 and refresh token
async function apiRequest(url: string, options: RequestInit) {
  let response = await fetch(url, options)

  if (response.status === 401) {
    // Try to refresh token
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken })
      })

      if (refreshResponse.ok) {
        const { access_token } = await refreshResponse.json()
        localStorage.setItem('auth_token', access_token)

        // Retry original request
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${access_token}`
        }
        response = await fetch(url, options)
      }
    }
  }

  return response
}
```

### Pattern 2: Remember Me

```python
# Backend: Longer expiry for "remember me"
def create_access_token(user_id: int, remember_me: bool = False):
    expires = timedelta(
        days=30 if remember_me else minutes=60
    )
    # ...
```

### Pattern 3: Email Verification

```python
# Generate verification token
verification_token = create_access_token(
    data={"sub": str(user.id), "type": "email_verification"},
    expires_delta=timedelta(hours=24)
)

# Send email with link
verification_link = f"{FRONTEND_URL}/verify-email?token={verification_token}"

# Verify endpoint
@router.post("/verify-email")
async def verify_email(token: str, session: AsyncSession):
    payload = verify_token(token)
    if payload.get("type") != "email_verification":
        raise HTTPException(400, "Invalid token")

    user_id = payload.get("sub")
    # Mark user as verified
```

## Acceptance Criteria

Every authentication implementation must:
- [ ] Hash passwords with bcrypt (never store plain passwords)
- [ ] Generate JWT tokens with expiry
- [ ] Verify JWT tokens on protected endpoints
- [ ] Include user_id in JWT payload (sub claim)
- [ ] Scope all queries by current user
- [ ] Handle token expiry gracefully (401 errors)
- [ ] Validate email format and uniqueness
- [ ] Enforce password strength requirements
- [ ] Use HTTPS in production
- [ ] Store secrets in environment variables
- [ ] Implement logout functionality
- [ ] Redirect unauthenticated users to login
- [ ] Show loading states during auth checks
- [ ] Provide clear error messages

## Validation Checklist

Before finalizing authentication implementation:

### Backend
- [ ] JWT secret from environment variable
- [ ] Password hashing with bcrypt
- [ ] Token expiry configured
- [ ] get_current_user dependency created
- [ ] Protected endpoints use Depends(get_current_user)
- [ ] User scoping on all queries
- [ ] Email uniqueness validated
- [ ] Password strength validated

### Frontend
- [ ] Login/signup forms created
- [ ] Token stored securely
- [ ] Token included in API requests
- [ ] Protected routes check authentication
- [ ] Logout functionality implemented
- [ ] 401 errors redirect to login
- [ ] Loading states during auth check
- [ ] User info displayed when logged in

### Security
- [ ] No hardcoded secrets
- [ ] HTTPS enforced in production
- [ ] Tokens have reasonable expiry
- [ ] Passwords never logged
- [ ] SQL injection prevented (using ORM)
- [ ] XSS prevention (Content-Security-Policy)

## Integration Points

**Works with**:
- DB Model Generator → Uses User model
- API Endpoint Generator → Protects endpoints
- Frontend Component Generator → Login/signup UI
- Backend Dev Agent → Implements auth logic

**Workflow**:
1. DB Model Generator creates User model
2. **This skill implements auth flow**
3. API Endpoint Generator adds get_current_user dependency
4. Frontend Component Generator creates login UI

## Changelog

### v1.0.0 (2025-01-15)
- Initial release
- Better Auth with JWT tokens
- FastAPI integration
- Frontend login/signup components
- Protected routes (frontend and backend)
- User scoping patterns
- Security best practices
- Token refresh implementation
- Auth context for React
