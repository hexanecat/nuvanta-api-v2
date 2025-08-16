# Nuvanta API v2

Healthcare Management System Backend - Built with Node.js, Express, and PostgreSQL

## 🚀 Features

- **Raw SQL Queries** - No ORM, direct database control
- **User Authentication** - bcrypt password hashing
- **Task Management** - CRUD operations for healthcare tasks
- **Role-based Access** - Admin, nurse, and other roles
- **RESTful API** - Clean, consistent API design

## 🛠️ Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: bcrypt
- **Development**: tsx, nodemon

## 📦 Installation

```bash
# Install dependencies
npm install

# Create PostgreSQL database
createdb nuvanta_v2

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## 🏗️ Project Structure

```
src/
├── database/          # Database connection and setup
├── routes/            # API route handlers
├── services/          # Business logic
├── middleware/        # Express middleware
└── index.ts          # Application entry point
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Health Check
- `GET /api/health` - Service health status

## 🔧 Development

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/nuvanta_v2
PORT=3001
NODE_ENV=development
```
