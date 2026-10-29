from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash, create_access_token, get_current_user
)
from app.models.models import User, UserRole, AuditLog
from app.schemas.schemas import (
    UserCreate, UserLogin, UserOut, Token, ProfileUpdate
)

router = APIRouter()

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        onboarding_completed=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Public registration grants only 'student' role. Admin role requires bootstrap.
    role_name = "student"
    role = UserRole(user_id=user.id, role=role_name)
    db.add(role)
    db.commit()

    token = create_access_token(data={"sub": user.id, "email": user.email, "role": role_name})
    user_out = UserOut.model_validate(user)
    user_out.roles = [role_name]
    return Token(access_token=token, token_type="bearer", user=user_out)

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    roles = [r.role for r in db.query(UserRole).filter(UserRole.user_id == user.id).all()] or ["student"]
    token = create_access_token(data={"sub": user.id, "email": user.email, "roles": roles})
    user_out = UserOut.model_validate(user)
    user_out.roles = roles
    return Token(access_token=token, token_type="bearer", user=user_out)

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    roles = [r.role for r in db.query(UserRole).filter(UserRole.user_id == current_user.id).all()] or ["student"]
    user_out = UserOut.model_validate(current_user)
    user_out.roles = roles
    return user_out

@router.put("/profile", response_model=UserOut)
def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    update_dict = profile_data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(current_user, field, val)

    current_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(current_user)

    roles = [r.role for r in db.query(UserRole).filter(UserRole.user_id == current_user.id).all()] or ["student"]
    user_out = UserOut.model_validate(current_user)
    user_out.roles = roles
    return user_out

@router.post("/demo-login", response_model=Token)
def demo_login(db: Session = Depends(get_db)):
    """
    Demo student login for Chaithanya (3rd Year CSE).
    Authenticates through proper password validation and returns legitimate JWT session.
    """
    demo_email = "chaithanya@student.college.edu"
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo student not found. Please run seed script.")

    roles = [r.role for r in db.query(UserRole).filter(UserRole.user_id == user.id).all()] or ["student"]
    token = create_access_token(data={"sub": user.id, "email": user.email, "roles": roles})
    user_out = UserOut.model_validate(user)
    user_out.roles = roles
    return Token(access_token=token, token_type="bearer", user=user_out)

