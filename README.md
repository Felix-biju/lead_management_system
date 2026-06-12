# Lead Management System

A full-stack web application for managing sales leads, tracking disputes, and analyzing pipeline metrics. Built with React and FastAPI.

## Features

- **Lead Management**: Create, view, and manage sales leads with detailed information
- **Pipeline Kanban Board**: Visualize leads across different sales stages
- **Analytics Dashboard**: Track key metrics and performance indicators
- **Dispute Management**: Handle and resolve customer disputes
- **User Authentication**: Secure login and user management with JWT
- **Notes System**: Add and manage notes on leads
- **Real-time Updates**: Responsive UI with Axios for API communication

## Tech Stack

### Frontend
- **React** 19.2.6 - UI framework
- **Vite** 8.0.12 - Build tool and dev server
- **Axios** 1.17.0 - HTTP client
- **Recharts** 3.8.1 - Data visualization
- **ESLint** 10.3.0 - Code quality

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **Python-Jose** - JWT authentication
- **Passlib** - Password hashing
- **SQLite** - Database

## Project Structure

```
lead_management_system/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Analytics.jsx
│   │   │   ├── AuthScreen.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── KanbanBoard.jsx
│   │   │   ├── leadsPipeline.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── QuickAddForm.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── assets/          # Static assets
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── package.json
└── backend/                  # FastAPI application
    ├── app/
    │   ├── main.py          # FastAPI app setup
    │   ├── database.py      # Database configuration
    │   ├── models/
    │   │   └── core.py      # Database models
    │   ├── schemas/         # Pydantic schemas
    │   │   ├── lead.py
    │   │   ├── user.py
    │   │   ├── note.py
    │   │   └── dispute.py
    │   ├── api/
    │   │   ├── dependencies.py
    │   │   └── routers/     # API endpoints
    │   │       ├── auth.py
    │   │       ├── leads.py
    │   │       ├── disputes.py
    │   └── core/
    └── promote.py
```

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install fastapi sqlalchemy python-jose[cryptography] passlib bcrypt python-multipart uvicorn
```

4. Run the FastAPI server:
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API documentation (Swagger UI): `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Leads
- `GET /leads` - Get all leads
- `POST /leads` - Create a new lead
- `GET /leads/{lead_id}` - Get lead details
- `PUT /leads/{lead_id}` - Update lead
- `DELETE /leads/{lead_id}` - Delete lead
- `PUT /leads/{lead_id}/stage` - Update lead stage
- `PUT /leads/{lead_id}/owner` - Assign lead to user

### Disputes
- `GET /disputes` - Get all disputes
- `POST /disputes` - Create a dispute
- `PUT /disputes/{dispute_id}` - Update dispute

### Notes
- `POST /leads/{lead_id}/notes` - Add note to lead
- `GET /leads/{lead_id}/notes` - Get lead notes

## Configuration

### Backend Environment Variables
Create a `.env` file in the backend directory:
```
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=your-secret-key-here
```

### Frontend API Base URL
The frontend is configured to connect to `http://localhost:8000`. Modify this in the Axios configuration as needed.

## Development Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend
- `python -m uvicorn app.main:app --reload` - Start development server with auto-reload
- `python promote.py` - Database promotion script

## Code Quality

### Frontend Linting
```bash
cd frontend
npm run lint
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and tests
4. Submit a pull request

## License

This project is private and not licensed for public use.

## Support

For issues or questions, please refer to the project documentation or create an issue in the repository.
