const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const opportunitiesRouter = require('./routes/opportunities');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');
const connectionsRouter = require('./routes/connections');
const applicationsRouter = require('./routes/applications');
const notificationsRouter = require('./routes/notifications');
const adminRouter = require('./routes/admin');
const compilerRouter = require('./routes/compiler');

app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/posts', postsRouter);
app.use('/api/users', usersRouter);
app.use('/api/connections', connectionsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/compiler', compilerRouter);

// Database Connection
console.log('Connecting to MongoDB at:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log('MongoDB Connection Error: ' + err.message));

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    seedData();
});

// Mock Initial Data Seed
const Opportunity = require('./models/Opportunity');
async function seedData() {
    try {
        const count = await Opportunity.countDocuments();
        if (count === 0) {
            const data = [
                {
                    title: "Code for Future 2024",
                    company: "Tech Giants Inc.",
                    type: "Hackathon",
                    description: "Initial seed data for hackathon...",
                    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
                    reward: "$10,000",
                },
                {
                    title: "Frontend Developer",
                    company: "StartUp Hub",
                    type: "Job",
                    description: "Initial seed data for job...",
                    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    reward: "Competitive Salary",
                },
                {
                    title: "Data Science Intern",
                    company: "DataFlow",
                    type: "Internship",
                    description: "Initial seed data for internship...",
                    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                    reward: "$1,000/mo",
                },
                {
                    title: "Design Clallenge",
                    company: "Creative Studio",
                    type: "Competition",
                    description: "Initial seed data for design challenge...",
                    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
                    reward: "Swag & Cash",
                },
            ];
            await Opportunity.insertMany(data);
            console.log("Database Seeded!");
        }
    } catch (err) {
        console.error("Seeding Error:", err);
    }
}
