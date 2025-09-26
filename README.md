# Smart Bill Splitter

A simple web app to manage a restaurant bill and split it equally, by item, or by custom amount.
Built with Flask (backend) and React + Vite + Tailwind (frontend).

---

## Features
- **Menu Management**: Menu items stored in `menu.json` with ID, name, description, category, and price.  
- **Order Taking**: Add items across multiple rounds (appetizers, mains, desserts).  
- **Bill Calculation**: Subtotal + configurable tax (20%), service charge, and tip.  
- **Splitting Methods**:  
  - **Equal Split** – divide evenly among guests.  
  - **By Item** – assign specific items to each guest (supports shared items).  
  - **By Amount** – enter each guest’s contribution and track balance.  

---

## Tech Stack
- **Backend**: Python, Flask, flask-cors  
- **Frontend**: React, Vite, TypeScript, Tailwind  
- **Data**: JSON file (`menu.json`)  

---

## Getting Started

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd smart-bill-splitter
```

### 2. Backend (Flask)
```bash
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend runs at: **http://localhost:5050**

### 3. Frontend (Vite + React)
```bash
cd frontend
cp .env.example .env   # sets VITE_API_BASE=http://localhost:5050
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## API Endpoints

### Menu & Orders
- `GET /menu` → returns menu items  
- `POST /order` → `{ "items": [1, 2, 3] }` (IDs)  
- `GET /bill` or `POST /bill` → calculate bill with optional `{ "service_enabled": true, "service_rate": 0.15, "tip_rate": 0.10 }`  
- `POST /table/reset` → clears orders  
- `GET /table/items` → list current table’s ordered items  

### Splitting
- `POST /split/equal` → `{ "num_guests": 3, "service_enabled": true, "tip_rate": 0.1 }`  
- `POST /split/item` → per-guest item assignments  
- `POST /split/amount` → `{ "Guest 1": 50, "Guest 2": 75, "service_enabled": true, "tip_rate": 0.1 }`  

---

## Assumptions
- Single table is supported at a time (reset clears everything).  
- Tax is fixed at 20%.  
- Service charge and tip are configurable.  
- Shared items are divided evenly among selected guests.  

---

## Design Choices
- **Separation of concerns**:  
  - `MenuItem`, `Order`, `Table`, `Bill`, `BillSplitter` handle core logic.  
- **Persistence**: Menu stored in JSON so it survives restarts.  
- **API-first**: Backend routes clearly defined and consumed by frontend.  

---

## Future Improvements
- Support multiple tables.  
- Generate per-guest receipts.  
 
