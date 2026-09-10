import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import BookListPage from './pages/BookListPage'
import BookCreatePage from './pages/BookCreatePage'
import BookEditPage from './pages/BookEditPage'
import BookDetailPage from './pages/BookDetailPage'
import GameListPage from './pages/GameListPage'
import GameCreatePage from './pages/GameCreatePage'
import GameEditPage from './pages/GameEditPage'
import GameAchievementsPage from './pages/GameAchievementsPage'
import GameDetailPage from './pages/GameDetailPage'
import MagicListPage from './pages/MagicListPage'
import MagicDetailPage from './pages/MagicDetailPage'
import MagicCreatePage from './pages/MagicCreatePage'
import MagicEditPage from './pages/MagicEditPage'
import BoardGameListPage from './pages/BoardGameListPage'
import BoardGameCreatePage from './pages/BoardGameCreatePage'
import BoardGameDetailPage from './pages/BoardGameDetailPage'
import BoardGameEditPage from './pages/BoardGameEditPage'
import DeckListPage from './pages/DeckListPage'
import DeckCreatePage from './pages/DeckCreatePage'
import DeckDetailPage from './pages/DeckDetailPage'
import DeckEditPage from './pages/DeckEditPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="max-w-content mx-auto px-5 md:px-20 py-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/coleccion" element={<BookListPage />} />
          <Route path="/coleccion/:id" element={<BookDetailPage />} />
          <Route path="/nuevo" element={<BookCreatePage />} />
          <Route path="/editar/:id" element={<BookEditPage />} />
          <Route path="/juegos" element={<GameListPage />} />
          <Route path="/juegos/nuevo" element={<GameCreatePage />} />
          <Route path="/juegos/editar/:id" element={<GameEditPage />} />
          <Route path="/juegos/:id/logros" element={<GameAchievementsPage />} />
          <Route path="/juegos/:id" element={<GameDetailPage />} />
          <Route path="/magic" element={<MagicListPage />} />
          <Route path="/magic/nuevo" element={<MagicCreatePage />} />
          <Route path="/magic/:id" element={<MagicDetailPage />} />
          <Route path="/magic/:id/editar" element={<MagicEditPage />} />
          <Route path="/magic/mazos" element={<DeckListPage />} />
          <Route path="/magic/mazos/nuevo" element={<DeckCreatePage />} />
          <Route path="/magic/mazos/:id" element={<DeckDetailPage />} />
          <Route path="/magic/mazos/:id/editar" element={<DeckEditPage />} />
          <Route path="/boardgames" element={<BoardGameListPage />} />
          <Route path="/boardgames/nuevo" element={<BoardGameCreatePage />} />
          <Route path="/boardgames/:id" element={<BoardGameDetailPage />} />
          <Route path="/boardgames/:id/editar" element={<BoardGameEditPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
