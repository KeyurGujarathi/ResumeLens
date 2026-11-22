import os
from pathlib import Path

from sqlalchemy import create_engine, MetaData, Table, select, text


# =====================================================
# CONFIGURATION
# =====================================================

BASE_DIR = Path(__file__).resolve().parent
SQLITE_PATH = BASE_DIR / "resumelens.db"

RENDER_URL = os.environ.get("RENDER_DATABASE_URL")

if not RENDER_URL:
    raise RuntimeError("RENDER_DATABASE_URL environment variable is missing.")

if RENDER_URL.startswith("postgres://"):
    RENDER_URL = RENDER_URL.replace(
        "postgres://", "postgresql+psycopg://", 1
    )
elif RENDER_URL.startswith("postgresql://"):
    RENDER_URL = RENDER_URL.replace(
        "postgresql://", "postgresql+psycopg://", 1
    )


# =====================================================
# TABLES TO MIGRATE
# =====================================================

TABLE_ORDER = [
    "companies",
    "skills",
    "career_domains",
    "job_postings",
    "job_posting_skills",
    "job_posting_career_domains",
]

EXPECTED_COUNTS = {
    "companies": 15,
    "job_postings": 5004,
    "skills": 63,
    "job_posting_skills": 15063,
    "career_domains": 9,
    "job_posting_career_domains": 4501,
}

# Tables with automatically generated integer IDs.
SEQUENCE_TABLES = [
    "companies",
    "job_postings",
    "skills",
    "career_domains",
]


# =====================================================
# DATABASE CONNECTIONS
# =====================================================

if not SQLITE_PATH.exists():
    raise FileNotFoundError(
        f"Local SQLite database not found: {SQLITE_PATH}"
    )

source_engine = create_engine(
    f"sqlite:///{SQLITE_PATH.as_posix()}"
)

destination_engine = create_engine(
    RENDER_URL,
    connect_args={
        "sslmode": "require",
        "connect_timeout": 20,
    },
    pool_pre_ping=True,
)


def migrate():

    source_metadata = MetaData()
    destination_metadata = MetaData()

    source_metadata.reflect(bind=source_engine)
    destination_metadata.reflect(bind=destination_engine)

    print("\nRESUMELENS MARKET DATA MIGRATION")
    print("================================")

    # -------------------------------------------------
    # Verify that all required tables exist.
    # -------------------------------------------------

    for table_name in TABLE_ORDER:

        if table_name not in source_metadata.tables:
            raise RuntimeError(
                f"Missing local table: {table_name}"
            )

        if table_name not in destination_metadata.tables:
            raise RuntimeError(
                f"Missing Render table: {table_name}"
            )

    print("All required tables exist.")

    source_tables = {
        name: source_metadata.tables[name]
        for name in TABLE_ORDER
    }

    destination_tables = {
        name: destination_metadata.tables[name]
        for name in TABLE_ORDER
    }

    # -------------------------------------------------
    # Verify local record counts.
    # -------------------------------------------------

    with source_engine.connect() as source:

        print("\nChecking local SQLite records...")

        for table_name in TABLE_ORDER:

            table = source_tables[table_name]

            count = source.execute(
                select(text("COUNT(*)")).select_from(table)
            ).scalar_one()

            expected = EXPECTED_COUNTS[table_name]

            print(f"{table_name}: {count}")

            if count != expected:
                raise RuntimeError(
                    f"Unexpected count in {table_name}. "
                    f"Expected {expected}, found {count}."
                )

    print("\nLocal data verification successful.")

    # -------------------------------------------------
    # Verify destination is empty before importing.
    # -------------------------------------------------

    print("\nChecking Render PostgreSQL destination...")

    with destination_engine.connect() as destination:

        for table_name in TABLE_ORDER:

            table = destination_tables[table_name]

            count = destination.execute(
                select(text("COUNT(*)")).select_from(table)
            ).scalar_one()

            print(f"{table_name}: {count}")

            if count != 0:
                raise RuntimeError(
                    f"Destination table {table_name} is not empty. "
                    "Migration stopped to prevent overwriting data."
                )

    print("\nDestination verification successful.")

    # -------------------------------------------------
    # Copy data inside one PostgreSQL transaction.
    # -------------------------------------------------

    print("\nStarting migration...")

    with source_engine.connect() as source:

        with destination_engine.begin() as destination:

            for table_name in TABLE_ORDER:

                source_table = source_tables[table_name]
                destination_table = destination_tables[table_name]

                source_columns = set(source_table.columns.keys())
                destination_columns = set(
                    destination_table.columns.keys()
                )

                if source_columns != destination_columns:
                    raise RuntimeError(
                        f"Column mismatch in {table_name}. "
                        "Migration stopped."
                    )

                print(f"\nTransferring {table_name}...")

                result = source.execute(
                    select(source_table)
                )

                transferred = 0

                while True:

                    rows = result.fetchmany(500)

                    if not rows:
                        break

                    batch = [
                        dict(row._mapping)
                        for row in rows
                    ]

                    destination.execute(
                        destination_table.insert(),
                        batch
                    )

                    transferred += len(batch)

                print(
                    f"Successfully transferred "
                    f"{transferred} records."
                )

                if transferred != EXPECTED_COUNTS[table_name]:
                    raise RuntimeError(
                        f"Record count mismatch in {table_name}."
                    )

            # -----------------------------------------
            # Reset PostgreSQL ID sequences.
            # This prevents future ID conflicts.
            # -----------------------------------------

            print("\nUpdating PostgreSQL ID sequences...")

            for table_name in SEQUENCE_TABLES:

                sequence = destination.execute(
                    text(
                        "SELECT pg_get_serial_sequence("
                        ":table_name, 'id')"
                    ),
                    {"table_name": table_name}
                ).scalar_one()

                if sequence:

                    max_id = destination.execute(
                        text(
                            f'SELECT COALESCE(MAX(id), 1) '
                            f'FROM "{table_name}"'
                        )
                    ).scalar_one()

                    has_records = destination.execute(
                        text(
                            f'SELECT EXISTS('
                            f'SELECT 1 FROM "{table_name}")'
                        )
                    ).scalar_one()

                    destination.execute(
                        text(
                            "SELECT setval("
                            "CAST(:sequence AS regclass), "
                            ":max_id, :has_records)"
                        ),
                        {
                            "sequence": sequence,
                            "max_id": max_id,
                            "has_records": has_records,
                        }
                    )

            print("\nAll migration operations completed.")

    print("\nMIGRATION TRANSACTION COMMITTED.")


# =====================================================
# EXECUTION
# =====================================================

try:

    migrate()

    print("\n================================")
    print("MIGRATION COMPLETED SUCCESSFULLY")
    print("================================")

except Exception as error:

    print("\nMIGRATION FAILED.")
    print("Reason:", str(error))
    print("PostgreSQL transaction was rolled back if it had started.")

    raise

finally:

    source_engine.dispose()
    destination_engine.dispose()