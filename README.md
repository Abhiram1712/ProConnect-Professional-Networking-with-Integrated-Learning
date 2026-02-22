# ProConnect: Professional Networking with Integrated Learning 


This platform is built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Full MERN Stack**: Backend API with Express and MongoDB.
- **Authentication**: User Login and Registration with JWT.
- **Dynamic Content**: Opportunities fetched from the database.
- **Responsive Design**: Modern UI using React and Vanilla CSS.
- **Pages**:
  - **Home**: Landing page with featured opportunities.
  - **Learn**: Educational resources.
  - **Practice**: Coding challenges.
  - **Mentorship**: Connect with mentors.
  - **Compete/Jobs**: Filterable list of Hackathons and Jobs.
  - **Blogs**: Articles and updates.

## Project Structure

- `src/`: Frontend React application.
- `server/`: Backend Node.js/Express application.

## Getting Started

### Prerequisites

- Node.js installed.
- MongoDB installed and running locally on port 27017.

### 1. Setup Backend

Open a terminal and run:

```bash
cd server
npm install
npm run dev
```

The server will start on `http://localhost:5000` and seed the database with initial data.

### 2. Setup Frontend

Open a **new** terminal (keep the backend running) and run:

```bash
# In the root project directory
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`.

## Functionality

1.  **Register**: Create a new account at `/register`.
2.  **Login**: Login at `/login` to see your username in the header.
3.  **View Opportunities**: Go to `/compete` to see data fetched from MongoDB.
