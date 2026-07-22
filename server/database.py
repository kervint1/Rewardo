from sqlmodel import Session, SQLModel, create_engine

import config

engine = create_engine(config.DATABASE_URL, pool_pre_ping=True)


def init_db() -> None:
    # MVPの間は起動時にテーブルを自動作成する（将来はAlembicに移行）
    import models  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
