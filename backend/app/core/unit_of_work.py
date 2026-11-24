from sqlmodel import Session
from app.core.database import engine

class UnitOfWork:
    def __enter__(self):
        self.session = Session(engine)
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        except Exception:
            self.session.rollback()
            raise
        finally:
            self.session.close()
        return False
