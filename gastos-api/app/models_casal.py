from datetime import date, datetime

from .database import db

MAX_INTEGRANTES_POR_CASAL = 2


class Casal(db.Model):
    __tablename__ = "casais"

    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(6), nullable=False, unique=True, index=True)
    criado_em = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    integrantes = db.relationship(
        "Integrante", backref="casal", cascade="all, delete-orphan", order_by="Integrante.id"
    )
    gastos = db.relationship(
        "GastoCasal", backref="casal", cascade="all, delete-orphan", order_by="GastoCasal.criado_em.desc()"
    )

    def to_dict(self) -> dict:
        return {
            "codigo": self.codigo,
            "integrantes": [i.to_dict() for i in self.integrantes],
        }


class Integrante(db.Model):
    __tablename__ = "integrantes"

    id = db.Column(db.Integer, primary_key=True)
    casal_id = db.Column(db.Integer, db.ForeignKey("casais.id"), nullable=False)
    nome = db.Column(db.String(40), nullable=False)
    criado_em = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {"id": self.id, "nome": self.nome}


class GastoCasal(db.Model):
    __tablename__ = "gastos_casal"

    id = db.Column(db.Integer, primary_key=True)
    casal_id = db.Column(db.Integer, db.ForeignKey("casais.id"), nullable=False)
    integrante_id = db.Column(db.Integer, db.ForeignKey("integrantes.id"), nullable=False)
    descricao = db.Column(db.String(140), nullable=False)
    valor = db.Column(db.Float, nullable=False)
    categoria = db.Column(db.String(60), nullable=False)
    data = db.Column(db.Date, nullable=False, default=date.today)
    criado_em = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

    integrante = db.relationship("Integrante")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "descricao": self.descricao,
            "valor": self.valor,
            "categoria": self.categoria,
            "data": self.data.isoformat(),
            "criado_em": self.criado_em.isoformat() + "Z",
            "integrante_id": self.integrante_id,
            "integrante_nome": self.integrante.nome if self.integrante else None,
        }
