import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// הסר את AuthProvider מכאן כי הוא כבר ב-main.jsx

// Components
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import CrosswordSolver from './pages/CrosswordSolver'
import CrosswordCreator from './pages/CrosswordCreator'
import MyCrosswords from './pages/MyCrosswords'
import MyWordLists from './pages/MyWordLists'
import WordListsBrowser from './pages/WordListsBrowser'
import WordListCreator from './pages/WordListCreator'
import ProtectedRoute from './components/auth/ProtectedRoute'
import CrosswordEditor from './pages/CrosswordEditor'
import WordListEditor from './pages/WordListEditor'
import WordListView from './pages/WordListView'
import Footer from './components/layout/Footer'
import About from './pages/About'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FavoriteCrosswords from './pages/FavoriteCrosswords'
import FavoriteWordLists from './pages/FavoriteWordLists'

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar />
        <main className="container-fluid flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/crossword/:id" element={<CrosswordSolver />} />
            <Route path="/wordlist/:id" element={<WordListView />} />
            <Route path="/favorite-crosswords" element={<FavoriteCrosswords />} />
            <Route path="/favorite-wordlists" element={<FavoriteWordLists />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/create-crossword" element={
              <ProtectedRoute>
                <CrosswordCreator />
              </ProtectedRoute>
            } />

            <Route path="/edit-crossword/:id" element={
              <ProtectedRoute>
                <CrosswordEditor />
              </ProtectedRoute>
            } />

            <Route path="/my-crosswords" element={
              <ProtectedRoute>
                <MyCrosswords />
              </ProtectedRoute>
            } />

            <Route path="/my-wordlists" element={
              <ProtectedRoute>
                <MyWordLists />
              </ProtectedRoute>
            } />

            <Route path="/edit-wordlist/:id" element={
              <ProtectedRoute>
                <WordListEditor />
              </ProtectedRoute>
            } />

            <Route path="/wordlists" element={<WordListsBrowser />} />

            <Route path="/create-wordlist" element={
              <ProtectedRoute>
                <WordListCreator />
              </ProtectedRoute>
            } />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={true} // For Hebrew
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App