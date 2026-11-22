import os
from sqlalchemy import create_engine
from database import Base
import models

url = os.environ["RENDER_DATABASE_URL"].strip()

if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql+psycopg://", 1)
elif url.startswith("postgresql://"):
    url = url.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(
    url,
    connect_args={"sslmode": "require"}
)

try:
    print("Connecting to Render PostgreSQL...")

    Base.metadata.create_all(bind=engine)

    print("SUCCESS: Database tables created!")
finally:
    engine.dispose()