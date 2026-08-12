import pytest

def test_register_user(client, db_session):
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "securepassword123",
        "age": 30,
        "sex": "male"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_register_duplicate_user(client, db_session):
    response = client.post("/auth/register", json={
        "email": "duplicate@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    
    response = client.post("/auth/register", json={
        "email": "duplicate@example.com",
        "password": "password123"
    })
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_login_user(client, db_session):
    # First create
    client.post("/auth/register", json={
        "email": "login@example.com",
        "password": "loginpassword123"
    })
    
    # Then login
    response = client.post(
        "/auth/login", 
        data={"username": "login@example.com", "password": "loginpassword123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client, db_session):
    client.post("/auth/register", json={
        "email": "wrongpass@example.com",
        "password": "correct123"
    })
    
    response = client.post(
        "/auth/login", 
        data={"username": "wrongpass@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 400
