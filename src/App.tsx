import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import AuthNavigator from './components/AuthNavigator'
import ProtectedRoute from './components/ProtectedRoute'
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
import BoardGameListPage from './pages/BoardGameListPage'
import BoardGameCreatePage from './pages/BoardGameCreatePage'
import BoardGameDetailPage from './pages/BoardGameDetailPage'
import BoardGameEditPage from './pages/BoardGameEditPage'
import MovieShowListPage from './pages/MovieShowListPage'
import MovieShowCreatePage from './pages/MovieShowCreatePage'
import MovieShowDetailPage from './pages/MovieShowDetailPage'
import MovieShowEditPage from './pages/MovieShowEditPage'
import DeckListPage from './pages/DeckListPage'
import DeckCreatePage from './pages/DeckCreatePage'
import DeckDetailPage from './pages/DeckDetailPage'
import DeckEditPage from './pages/DeckEditPage'

function Shell() {
  return (
    <ToastProvider>
      <AuthNavigator />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[70] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-brand focus:text-white focus:font-semibold"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" tabIndex={-1} className="max-w-content mx-auto px-5 md:px-20 py-10 focus:outline-none">
        <Outlet />
      </main>
    </ToastProvider>
  )
}

const router = createBrowserRouter([
  {
    element: <Shell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/coleccion', element: <BookListPage /> },
      { path: '/coleccion/:id', element: <BookDetailPage /> },
      { path: '/nuevo', element: <ProtectedRoute><BookCreatePage /></ProtectedRoute> },
      { path: '/editar/:id', element: <ProtectedRoute><BookEditPage /></ProtectedRoute> },
      { path: '/juegos', element: <GameListPage /> },
      { path: '/juegos/nuevo', element: <ProtectedRoute><GameCreatePage /></ProtectedRoute> },
      { path: '/juegos/editar/:id', element: <ProtectedRoute><GameEditPage /></ProtectedRoute> },
      { path: '/juegos/:id/logros', element: <GameAchievementsPage /> },
      { path: '/juegos/:id', element: <GameDetailPage /> },
      { path: '/magic', element: <MagicListPage /> },
      { path: '/magic/nuevo', element: <ProtectedRoute><MagicCreatePage /></ProtectedRoute> },
      { path: '/magic/:id', element: <MagicDetailPage /> },
      { path: '/magic/mazos', element: <DeckListPage /> },
      { path: '/magic/mazos/nuevo', element: <ProtectedRoute><DeckCreatePage /></ProtectedRoute> },
      { path: '/magic/mazos/:id', element: <DeckDetailPage /> },
      { path: '/magic/mazos/:id/editar', element: <ProtectedRoute><DeckEditPage /></ProtectedRoute> },
      { path: '/boardgames', element: <BoardGameListPage /> },
      { path: '/boardgames/nuevo', element: <ProtectedRoute><BoardGameCreatePage /></ProtectedRoute> },
      { path: '/boardgames/:id', element: <BoardGameDetailPage /> },
      { path: '/boardgames/:id/editar', element: <ProtectedRoute><BoardGameEditPage /></ProtectedRoute> },
      { path: '/movieshows', element: <MovieShowListPage /> },
      { path: '/movieshows/nuevo', element: <ProtectedRoute><MovieShowCreatePage /></ProtectedRoute> },
      { path: '/movieshows/editar/:id', element: <ProtectedRoute><MovieShowEditPage /></ProtectedRoute> },
      { path: '/movieshows/:id', element: <MovieShowDetailPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
