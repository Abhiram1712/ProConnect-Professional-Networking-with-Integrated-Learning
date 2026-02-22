import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Compete from './pages/Compete';
import Home from './pages/Home';

import Learn from './pages/Learn';
import Practice from './pages/Practice';
import Mentorship from './pages/Mentorship';
import Blogs from './pages/Blogs';
import Jobs from './pages/Jobs';
import Host from './pages/Host';
import Notifications from './pages/Notifications';
import Feed from './pages/Feed';
import Network from './pages/Network';
import RecruiterDashboard from './pages/RecruiterDashboard';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Apply from './pages/Apply';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <main className="main-content" style={{ minHeight: '64px', paddingTop: '64px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/compete" element={<Compete />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/host" element={<Host />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/network" element={<Network />} />
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/apply/:id" element={<Apply />} />
            <Route path="*" element={<div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}><h2>404 - Not Found</h2><p>The page you are looking for does not exist.</p></div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
