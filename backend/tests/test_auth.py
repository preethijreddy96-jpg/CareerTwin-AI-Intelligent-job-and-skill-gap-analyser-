import pytest
from app.core.security import verify_password, get_password_hash

def test_password_hashing():
    raw_pwd = "SecurePassword123!"
    hashed = get_password_hash(raw_pwd)
    assert hashed != raw_pwd
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_password_complexity_validation(client):
    # Missing special character -> 422
    res1 = client.post("/api/auth/register", json={
        "email": "badpwd1@test.com",
        "password": "Password123",
        "full_name": "Test User"
    })
    assert res1.status_code == 422

    # Missing number -> 422
    res2 = client.post("/api/auth/register", json={
        "email": "badpwd2@test.com",
        "password": "Password!@#",
        "full_name": "Test User"
    })
    assert res2.status_code == 422

    # Too short -> 422
    res3 = client.post("/api/auth/register", json={
        "email": "badpwd3@test.com",
        "password": "P!1",
        "full_name": "Test User"
    })
    assert res3.status_code == 422

def test_register_verification_and_login_flow(client):
    # 1. Register user
    reg_payload = {
        "email": "verified.candidate@careertwin.ai",
        "password": "StrongPassword123!",
        "full_name": "Verified Candidate"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["requires_verification"] is True
    assert "dev_verification_code" in data
    code = data["dev_verification_code"]

    # 2. Login before verification must be rejected (403 Forbidden)
    login_unverified = client.post("/api/auth/login", json={
        "email": "verified.candidate@careertwin.ai",
        "password": "StrongPassword123!"
    })
    assert login_unverified.status_code == 403
    assert "not verified" in login_unverified.json()["detail"].lower()

    # 3. Verify with wrong code -> 400
    wrong_verify = client.post("/api/auth/verify-email", json={
        "email": "verified.candidate@careertwin.ai",
        "code": "000000"
    })
    assert wrong_verify.status_code == 400

    # 4. Verify with correct code -> 200 with JWT token
    verify_res = client.post("/api/auth/verify-email", json={
        "email": "verified.candidate@careertwin.ai",
        "code": code
    })
    assert verify_res.status_code == 200
    assert "access_token" in verify_res.json()

    # 5. Login after verification must succeed
    login_res = client.post("/api/auth/login", json={
        "email": "verified.candidate@careertwin.ai",
        "password": "StrongPassword123!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # 6. Verify protected /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "verified.candidate@careertwin.ai"

def test_invalid_and_disposable_email_rejection(client):
    # 1. Disposable email domain -> 422
    res_disp = client.post("/api/auth/register", json={
        "email": "user@mailinator.com",
        "password": "ValidPassword123!",
        "full_name": "Disposable User"
    })
    assert res_disp.status_code == 422
    assert "disposable" in res_disp.text.lower() or "temporary" in res_disp.text.lower()

    # 2. Invalid domain syntax -> 422
    res_bad = client.post("/api/auth/register", json={
        "email": "baduser@invalid",
        "password": "ValidPassword123!",
        "full_name": "Bad User"
    })
    assert res_bad.status_code == 422

def test_google_authentication_flow(client):
    # 1. First-time Google user sign-in
    google_payload = {
        "email": "candidate.google@gmail.com",
        "full_name": "Google Candidate User"
    }
    res = client.post("/api/auth/google", json=google_payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["email"] == "candidate.google@gmail.com"
    token = data["access_token"]

    # 2. Access protected endpoint with Google token
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["is_verified"] is True

    # 3. Repeat sign-in with same Google account (existing user)
    res_repeat = client.post("/api/auth/google", json=google_payload)
    assert res_repeat.status_code == 200
    assert res_repeat.json()["user_id"] == data["user_id"]
