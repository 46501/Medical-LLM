import pytest
from fastapi.testclient import TestClient
import io

def test_upload_document_unauthorized(client):
    response = client.post("/documents/upload")
    assert response.status_code == 401

def test_upload_document_authorized(client, db_session):
    # Register and login
    client.post("/auth/register", json={"email": "doc@example.com", "password": "pass"})
    login_resp = client.post("/auth/login", data={"username": "doc@example.com", "password": "pass"})
    token = login_resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Mock file upload
    file_content = b"fake image content"
    files = {"file": ("test.png", io.BytesIO(file_content), "image/png")}
    
    response = client.post("/documents/upload", headers=headers, files=files)
    assert response.status_code == 200
    assert response.json()["file_type"] == "image/png"
    assert "id" in response.json()

def test_upload_document_invalid_type(client, db_session):
    client.post("/auth/register", json={"email": "doc2@example.com", "password": "pass"})
    login_resp = client.post("/auth/login", data={"username": "doc2@example.com", "password": "pass"})
    token = login_resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    file_content = b"fake text content"
    files = {"file": ("test.txt", io.BytesIO(file_content), "text/plain")}
    
    response = client.post("/documents/upload", headers=headers, files=files)
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]

def test_analyze_document(client, db_session):
    client.post("/auth/register", json={"email": "doc3@example.com", "password": "pass"})
    login_resp = client.post("/auth/login", data={"username": "doc3@example.com", "password": "pass"})
    token = login_resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    file_content = b"fake image content"
    files = {"file": ("test.png", io.BytesIO(file_content), "image/png")}
    
    upload_resp = client.post("/documents/upload", headers=headers, files=files)
    doc_id = upload_resp.json()["id"]
    
    analyze_resp = client.post(f"/documents/{doc_id}/analyze", headers=headers)
    assert analyze_resp.status_code == 200
    data = analyze_resp.json()
    assert data["document_id"] == doc_id
    assert "explanation" in data
