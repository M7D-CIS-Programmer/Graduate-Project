# Graduate Project: Full-Stack Job Portal

A comprehensive job recruitment platform designed to connect job seekers with potential employers, featuring real-time dashboards, dynamic resume generation, and multi-language support.

## Overview
The project is built with a modern full-stack architecture, focusing on performance, accessibility, and a premium user experience. It provides specialized tools for three user roles:
- **Job Seekers**: Explore jobs, build dynamic resumes, and track applications.
- **Employers**: Post jobs, manage applicants, and review candidates.
- **Admins**: Manage users, moderate content, and view platform analytics.

## 🛠 Tech Stack
### Frontend
- **React (Vite)**: For a fast and modern development experience.
- **React Query**: For efficient data fetching, caching, and state synchronization.
- **Context API**: Managing authentication, language (i18n), and themes.
- **Vanilla CSS**: Custom design system with Glassmorphism and RTL support.

### Backend
- **ASP.NET Core 8 Web API**: Scalable and secure backend architecture.
- **Entity Framework Core**: Relational mapping for SQL Server.
- **SQL Server**: Persistent data storage for users, jobs, and resumes.

## Project Structure
```
/root
├── backend/            # ASP.NET Core Solution
│   ├── Controllers/    # API Endpoints
│   ├── Models/         # Database Entities
│   ├── Dtos/           # Data Transfer Objects
│   └── Data/           # DbContext & Migrations
├── frontend/           # React Application
│   ├── src/
│   │   ├── api/        # API Client Helpers
│   │   ├── components/ # Reusable UI Components
│   │   ├── context/    # Global State
│   │   ├── hooks/      # Custom React Query Hooks
│   │   └── pages/      # View Components/Routes
├── setup.bat           # Environment Setup Script
└── start.bat           # Development Launch Script
```

## Key Features
- **Dynamic Resume System**: Replaces static PDFs with live, editable, and database-driven profile views.
- **Multi-Language Support**: Full support for English and Arabic (RTL).
- **Application Workflow**: Comprehensive status management (New, Shortlisted, Accepted, Rejected).
- **Responsive Dashboards**: Interactive charts and statistics for data-driven decisions.

## 🏁 Getting Started
1. **Initialize Dependencies**:
   Run `setup.bat` to install all necessary npm packages and restore .NET tools.
2. **Launch Application**:
   Run `start.bat`. This will start the backend API on port 5232 and the frontend on port 8080.
3. **Database**:
   Ensure you have SQL Server installed. The system uses migrations to automatically build the schema on first run.

---
Created as part of the Graduate Project program.
