import os
from sqlalchemy import create_engine, text

url = os.environ["RENDER_DATABASE_URL"].strip()

if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql+psycopg://", 1)
elif url.startswith("postgresql://"):
    url = url.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(url, connect_args={"sslmode": "require"})

with engine.connect() as connection:
    tables = connection.execute(text("""
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
    """)).scalars().all()

    print("\nRENDER POSTGRESQL TABLES")
    print("-----------------------")

    for table in tables:
        print(table)

engine.dispose()
