import pytest

def test_chat_unauthorized(client):
    response = client.post("/chat/", json={"message": "hello"})
    assert response.status_code == 401

def test_chat_authorized(client, db_session):
    # Register and login
    client.post("/auth/register", json={"email": "chat@example.com", "password": "pass"})
    login_resp = client.post("/auth/login", data={"username": "chat@example.com", "password": "pass"})
    token = login_resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/chat/", json={"message": "What is a headache?"}, headers=headers)
    assert response.status_code == 200
    assert response.json()["is_safe"] == True
    assert "Important:" in response.json()["response"]

def test_chat_emergency(client, db_session):
    client.post("/auth/register", json={"email": "chat2@example.com", "password": "pass"})
    login_resp = client.post("/auth/login", data={"username": "chat2@example.com", "password": "pass"})
    token = login_resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/chat/", json={"message": "I am having a stroke!"}, headers=headers)
    assert response.status_code == 200
    assert response.json()["is_safe"] == False
    assert "emergency" in response.json()["response"].lower()
