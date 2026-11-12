from app.models.models import Resume, User
from app.core.security import get_password_hash, create_access_token

def test_user_data_isolation_and_deletion(client, db_session):
    # Create two verified users with strong passwords
    u1 = User(email="user1@example.com", hashed_password=get_password_hash("Pass123!@#"), full_name="User One", is_verified=True)
    u2 = User(email="user2@example.com", hashed_password=get_password_hash("Pass123!@#"), full_name="User Two", is_verified=True)
    db_session.add_all([u1, u2])
    db_session.flush()

    # Create resume for user 1
    r1 = Resume(
        user_id=u1.id,
        filename="u1_resume.pdf",
        file_path="/tmp/u1.pdf",
        file_type="pdf",
        file_size_bytes=100,
        parsed_text="User 1 resume text content"
    )
    db_session.add(r1)
    db_session.commit()

    token1 = create_access_token({"sub": u1.email, "user_id": u1.id})
    token2 = create_access_token({"sub": u2.email, "user_id": u2.id})

    # User 1 can access their resume
    res1 = client.get(f"/api/resumes/{r1.id}", headers={"Authorization": f"Bearer {token1}"})
    assert res1.status_code == 200

    # User 2 CANNOT access User 1's resume (404 / access denied)
    res2 = client.get(f"/api/resumes/{r1.id}", headers={"Authorization": f"Bearer {token2}"})
    assert res2.status_code == 404

    # User 2 CANNOT delete User 1's resume
    del_res2 = client.delete(f"/api/resumes/{r1.id}", headers={"Authorization": f"Bearer {token2}"})
    assert del_res2.status_code == 404

    # User 1 CAN delete their resume
    del_res1 = client.delete(f"/api/resumes/{r1.id}", headers={"Authorization": f"Bearer {token1}"})
    assert del_res1.status_code == 204

