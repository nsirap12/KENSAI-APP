
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="KENSAI API SQL Server")

# Configuración CORS para permitir que el frontend se conecte
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de conexión MySQL
db_config = {
    'host': 'localhost',
    'user': 'kensai_user',
    'password': 'tu_password_seguro',
    'database': 'kensai_db'
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"Error conectando a MySQL: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

# --- MODELOS DE DATOS (Pydantic) ---

class ClientSchema(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = ""
    address: Optional[str] = ""
    creditStatus: str
    creditDays: Optional[int] = 0

class QuoteSchema(BaseModel):
    id: str
    quoteNumber: str
    date: str
    clientId: str
    status: str
    paymentCondition: str
    taxRate: float
    items: List[dict]
    payments: List[dict] = []

# --- RUTAS DE LA API ---

@app.get("/api/init")
async def get_initial_data():
    """Carga todos los datos para sincronizar el frontend al inicio"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM clients")
        clients = cursor.fetchall()
        
        cursor.execute("SELECT * FROM quotes")
        quotes = cursor.fetchall()
        # Aquí convertiríamos los strings JSON de la DB a objetos
        
        return {
            "clients": clients,
            "quotes": quotes,
            "tasks": [], # Implementar lógica de tareas
            "products": [],
            "collaborators": []
        }
    finally:
        cursor.close()
        conn.close()

@app.post("/api/clients")
async def create_client(client: ClientSchema):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = "INSERT INTO clients (id, name, email, phone, address, creditStatus, creditDays) VALUES (%s, %s, %s, %s, %s, %s, %s)"
        values = (client.id, client.name, client.email, client.phone, client.address, client.creditStatus, client.creditDays)
        cursor.execute(query, values)
        conn.commit()
        return {"status": "success", "id": client.id}
    except Error as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.post("/api/quotes")
async def save_quote(quote: QuoteSchema):
    # Lógica para guardar la cotización y sus partidas en MySQL
    # Se recomienda usar tablas relacionales: 'quotes' y 'quote_items'
    return {"status": "saved", "id": quote.id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
