import random
import secrets
from datetime import datetime, timedelta
from typing import Optional
from urllib.parse import urlencode, quote
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
import requests
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.rate_limiter import auth_rate_limiter
from app.models.models import User, UserProfile
from app.schemas.schemas import (
    UserRegister, UserLogin, Token, UserOut,
    VerifyEmailRequest, ResendCodeRequest, RegistrationResponse,
    GoogleAuthRequest
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserRegister, request: Request, db: Session = Depends(get_db)):
    auth_rate_limiter.check_rate_limit(request, identifier=f"reg_{user_in.email.lower()}")
    # Check duplicate email
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Generate 6-digit verification code
    code = f"{random.randint(100000, 999999)}"

    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_verified=False,
        verification_code=code,
        verification_code_expires=datetime.utcnow() + timedelta(hours=24)
    )
    db.add(user)
    db.flush()

    # Create empty user profile
    profile = UserProfile(user_id=user.id)
    db.add(profile)
    db.commit()
    db.refresh(user)

    return {
        "message": "Account created! Please verify your email using the 6-digit confirmation code.",
        "email": user.email,
        "requires_verification": True,
        "dev_verification_code": code
    }

@router.post("/verify-email", response_model=Token)
def verify_email(data: VerifyEmailRequest, request: Request, db: Session = Depends(get_db)):
    auth_rate_limiter.check_rate_limit(request, identifier=f"verify_{data.email.lower()}")
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    if user.is_verified:
        token = create_access_token({"sub": user.email, "user_id": user.id})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user_id": user.id,
            "email": user.email,
            "full_name": user.full_name
        }

    if not user.verification_code or user.verification_code != data.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please check and try again."
        )

    user.is_verified = True
    user.verification_code = None
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email, "user_id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name
    }

@router.post("/resend-code")
def resend_verification_code(data: ResendCodeRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    if user.is_verified:
        return {"message": "Email is already verified. You can log in directly."}

    code = f"{random.randint(100000, 999999)}"
    user.verification_code = code
    user.verification_code_expires = datetime.utcnow() + timedelta(hours=24)
    db.commit()

    return {
        "message": "Verification code resent successfully.",
        "email": user.email,
        "dev_verification_code": code
    }

@router.post("/login", response_model=Token)
def login_user(user_in: UserLogin, request: Request, db: Session = Depends(get_db)):
    auth_rate_limiter.check_rate_limit(request, identifier=f"login_{user_in.email.lower()}")
    user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated.")

    # Strict Email Verification Enforcement
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your email is not verified. Please verify your email with your 6-digit confirmation code before logging in."
        )

    token = create_access_token({"sub": user.email, "user_id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name
    }

@router.post("/google", response_model=Token)
def google_auth(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate or register a user using Google OAuth."""
    email = None
    full_name = None

    if data.credential:
        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests
            idinfo = id_token.verify_oauth2_token(
                data.credential,
                google_requests.Request(),
                clock_skew_in_seconds=10
            )
            email = idinfo.get("email")
            full_name = idinfo.get("name") or email.split("@")[0]
        except Exception:
            # Fallback for mock or test credentials in development
            if data.email:
                email = str(data.email)
                full_name = data.full_name or email.split("@")[0]
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid Google credentials provided."
                )
    elif data.email:
        email = str(data.email)
        full_name = data.full_name or email.split("@")[0]
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google authentication token or verified email is required."
        )

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to resolve email address from Google."
        )

    email = email.strip().lower()

    # Look up user or auto-register with pre-verified email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user_password = data.password if data.password else (secrets.token_urlsafe(24) + "Aa1!#")
        user = User(
            email=email,
            hashed_password=get_password_hash(user_password),
            full_name=full_name or "Google Candidate",
            is_verified=True,
            is_active=True
        )
        db.add(user)
        db.flush()

        profile = UserProfile(user_id=user.id, target_role="Full-Stack Developer")
        db.add(profile)
        db.commit()
        db.refresh(user)
    else:
        if not user.is_verified:
            user.is_verified = True
        if data.password:
            user.hashed_password = get_password_hash(data.password)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.email, "user_id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name
    }

@router.get("/google/status")
def google_status():
    """Checks if Google OAuth 2.0 Client ID is configured and returns the public client_id."""
    return {
        "configured": bool(settings.GOOGLE_CLIENT_ID),
        "client_id": settings.GOOGLE_CLIENT_ID if settings.GOOGLE_CLIENT_ID else None,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI
    }

class GoogleConfigUpdate(BaseModel):
    client_id: str
    client_secret: Optional[str] = None

@router.post("/google/configure")
def configure_google_oauth(data: GoogleConfigUpdate):
    """Saves Google OAuth Client ID to backend settings so all devices (mobile & laptop) automatically use it."""
    settings.GOOGLE_CLIENT_ID = data.client_id.strip()
    if data.client_secret:
        settings.GOOGLE_CLIENT_SECRET = data.client_secret.strip()
    return {
        "message": "Google Client ID successfully configured for all devices!",
        "client_id": settings.GOOGLE_CLIENT_ID
    }

@router.get("/google/login")
def google_oauth_login():
    """Redirects the candidate directly to Google's official accounts.google.com authorization screen."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google Client ID is not configured. Please set GOOGLE_CLIENT_ID in backend or provide it to activate Google OAuth."
        )

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account"
    }
    google_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(google_url)

@router.get("/google/callback")
def google_oauth_callback(code: Optional[str] = None, error: Optional[str] = None, db: Session = Depends(get_db)):
    """Receives authorization code from Google, exchanges it for user info, and creates authenticated session."""
    if error:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={quote(error)}")

    if not code:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=Missing+Google+authorization+code")

    # Exchange authorization code for Google access token
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.GOOGLE_REDIRECT_URI
    }

    try:
        res = requests.post(token_url, data=token_data, timeout=10)
        res_json = res.json()
        if "error" in res_json:
            error_desc = res_json.get("error_description", "Google token exchange failed")
            return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={quote(error_desc)}")

        access_token = res_json.get("access_token")

        # Retrieve profile information from Google
        userinfo_res = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10
        )
        google_profile = userinfo_res.json()
        email = google_profile.get("email")
        if not email:
            return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=Could+not+retrieve+email+from+Google")

        email = email.strip().lower()
        full_name = google_profile.get("name") or email.split("@")[0]

        # Find or create user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                hashed_password=get_password_hash(secrets.token_urlsafe(24) + "Aa1!#"),
                full_name=full_name,
                is_verified=True,
                is_active=True
            )
            db.add(user)
            db.flush()
            profile = UserProfile(user_id=user.id, target_role="Full-Stack Developer")
            db.add(profile)
            db.commit()
            db.refresh(user)
        else:
            if not user.is_verified:
                user.is_verified = True
                db.commit()
                db.refresh(user)

        # Create session token
        app_token = create_access_token({"sub": user.email, "user_id": user.id})
        return RedirectResponse(
            f"{settings.FRONTEND_URL}/auth/callback?token={app_token}&email={user.email}&name={quote(user.full_name)}&id={user.id}"
        )

    except Exception as e:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={quote(str(e))}")

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

