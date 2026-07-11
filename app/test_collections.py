"""
Tests for Collections API endpoints.
Uses in-memory SQLite with StaticPool so every request
shares the same database connection — required for FastAPI TestClient.
"""

import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db  # override the SHARED get_db used by all routes

# ──────────────────────────────────────────────
# In-memory SQLite – single shared connection
# ──────────────────────────────────────────────
engine = create_engine(
    "sqlite://",                          # :memory:
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,                 # share the same connection across sessions
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override the dependency for ALL routes (matched by function identity)
app.dependency_overrides[get_db] = override_get_db


# ──────────────────────────────────────────────
# Test Suite
# ──────────────────────────────────────────────
class TestCollectionsAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

        # Create two test users
        cls.user1_headers = cls.register_and_login(
            "testuser1", "user1@example.com", "password123"
        )
        cls.user2_headers = cls.register_and_login(
            "testuser2", "user2@example.com", "password123"
        )

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=engine)

    # ── helpers ──────────────────────────────
    @classmethod
    def register_and_login(cls, username, email, password):
        """Register (ignoring duplicate errors) and return an auth header dict."""
        cls.client.post("/auth/register", data={
            "username": username,
            "email": email,
            "password": password,
        })
        response = cls.client.post("/auth/login", data={
            "username": email,
            "password": password,
        })
        resp_json = response.json()
        if "access_token" not in resp_json:
            raise RuntimeError(f"Login failed for {email}: {resp_json}")
        return {"Authorization": f"Bearer {resp_json['access_token']}"}

    def _create(self, name, description="", visibility="private", headers=None):
        """Shorthand for creating a collection and returning its id."""
        r = self.client.post("/collections/", json={
            "name": name,
            "description": description,
            "visibility": visibility,
        }, headers=headers or self.user1_headers)
        self.assertEqual(r.status_code, 200, msg=f"Failed to create '{name}': {r.json()}")
        return r.json()["id"]

    # ── tests ────────────────────────────────
    def test_01_create_and_get_collections(self):
        col_id = self._create("My Private Col", visibility="private")

        # Duplicate name should be rejected
        r = self.client.post("/collections/", json={
            "name": "My Private Col",
            "description": "dup",
            "visibility": "private",
        }, headers=self.user1_headers)
        self.assertEqual(r.status_code, 400)
        self.assertIn("already exists", r.json()["detail"])

        # Owner can list their own collections
        r = self.client.get("/collections/", headers=self.user1_headers)
        self.assertEqual(r.status_code, 200)
        ids = [c["id"] for c in r.json()]
        self.assertIn(col_id, ids)

    def test_02_visibility_permissions(self):
        private_id = self._create("Secret List 2", visibility="private")
        public_id  = self._create("Shared List 2", visibility="public")

        # User 2 cannot read a private collection owned by user 1
        r = self.client.get(f"/collections/{private_id}", headers=self.user2_headers)
        self.assertEqual(r.status_code, 403)

        # User 2 CAN read a public collection owned by user 1
        r = self.client.get(f"/collections/{public_id}", headers=self.user2_headers)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["name"], "Shared List 2")

    def test_03_search_and_public_collections(self):
        pub_id = self._create("Search Test Public", visibility="public")

        # /collections/public must include our new collection
        r = self.client.get("/collections/public", headers=self.user2_headers)
        self.assertEqual(r.status_code, 200)
        public_names = [c["name"] for c in r.json()]
        self.assertIn("Search Test Public", public_names)
        # Private collections must NOT appear
        self.assertNotIn("Secret List 2", public_names)

        # Name-based search
        r = self.client.get("/collections/search?q=Search+Test", headers=self.user2_headers)
        self.assertEqual(r.status_code, 200, msg=r.text)
        names = [c["name"] for c in r.json()]
        self.assertIn("Search Test Public", names, msg=f"Search returned: {names}")

        # Username-based search (testuser1 created it)
        r = self.client.get("/collections/search?q=testuser1", headers=self.user2_headers)
        self.assertEqual(r.status_code, 200, msg=r.text)
        names = [c["name"] for c in r.json()]
        self.assertTrue(
            len(names) > 0,
            msg=f"Username search returned nothing: {r.json()}"
        )

    def test_04_add_and_remove_movies(self):
        col_id = self._create("Movie List 4")

        # Add a movie
        r = self.client.post(f"/collections/{col_id}/movies", json={
            "movie_id": "tt1234567",
            "movie_title": "Test Movie",
            "poster_path": "http://example.com/poster.jpg",
        }, headers=self.user1_headers)
        self.assertEqual(r.status_code, 200)

        # Duplicate add should be rejected
        r = self.client.post(f"/collections/{col_id}/movies", json={
            "movie_id": "tt1234567",
            "movie_title": "Test Movie",
            "poster_path": "http://example.com/poster.jpg",
        }, headers=self.user1_headers)
        self.assertEqual(r.status_code, 400)

        # Owner sees the movie in the collection
        r = self.client.get(f"/collections/{col_id}", headers=self.user1_headers)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.json()["movies"]), 1)

        # Non-owner cannot remove
        r = self.client.delete(
            f"/collections/{col_id}/movies/tt1234567",
            headers=self.user2_headers
        )
        self.assertEqual(r.status_code, 404)

        # Owner can remove
        r = self.client.delete(
            f"/collections/{col_id}/movies/tt1234567",
            headers=self.user1_headers
        )
        self.assertEqual(r.status_code, 200)

        # Collection now empty
        r = self.client.get(f"/collections/{col_id}", headers=self.user1_headers)
        self.assertEqual(len(r.json()["movies"]), 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
