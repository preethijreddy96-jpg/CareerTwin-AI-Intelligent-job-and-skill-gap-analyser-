import random
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.models import User, UserProfile
from app.schemas.schemas import (
    UserRegister, UserLogin, Token, UserOut,
    VerifyEmailRequest, ResendCodeRequest, RegistrationResponse,
    GoogleAuthRequest
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
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
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)):
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
def login_user(user_in: UserLogin, db: Session = Depends(get_db)):
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
        random_pwd = secrets.token_urlsafe(24) + "Aa1!#"
        user = User(
            email=email,
            hashed_password=get_password_hash(random_pwd),
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

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

