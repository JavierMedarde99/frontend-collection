import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import BookListPage from './pages/BookListPage'
import BookCreatePage from './pages/BookCreatePage'
import BookEditPage from './pages/BookEditPage'
import GameListPage from './pages/GameListPage'
import GameCreatePage from './pages/GameCreatePage'
import GameEditPage from './pages/GameEditPage'
import GameAchievementsPage from './pages/GameAchievementsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="max-w-content mx-auto px-5 md:px-20 py-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/coleccion" element={<BookListPage />} />
          <Route path="/nuevo" element={<BookCreatePage />} />
          <Route path="/editar/:id" element={<BookEditPage />} />
          <Route path="/juegos" element={<GameListPage />} />
          <Route path="/juegos/nuevo" element={<GameCreatePage />} />
          <Route path="/juegos/editar/:id" element={<GameEditPage />} />
          <Route path="/juegos/:id/logros" element={<GameAchievementsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
