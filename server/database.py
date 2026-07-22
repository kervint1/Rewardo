from sqlmodel import Session, create_engine

import config

engine = create_engine(config.DATABASE_URL, pool_pre_ping=True)


def get_session():
    with Session(engine) as session:
        yield session
