from datetime import date

from .database import db


class Gasto(db.Model):
    __tablename__ = "gastos"

    id = db.Column(db.Integer, primary_key=True)
    descricao = db.Column(db.String(140), nullable=False)
    valor = db.Column(db.Float, nullable=False)
    categoria = db.Column(db.String(60), nullable=False)
    data = db.Column(db.Date, nullable=False, default=date.today)
    tipo = db.Column(db.String(10), nullable=False, default="despesa")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "descricao": self.descricao,
            "valor": self.valor,
            "categoria": self.categoria,
            "data": self.data.isoformat(),
            "tipo": self.tipo,
        }
