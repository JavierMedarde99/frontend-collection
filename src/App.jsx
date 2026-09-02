import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import BookListPage from './pages/BookListPage'
import BookCreatePage from './pages/BookCreatePage'
import BookEditPage from './pages/BookEditPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="max-w-[1440px] mx-auto px-5 md:px-20 py-10">
        <Routes>
          <Route path="/" element={<BookListPage />} />
          <Route path="/nuevo" element={<BookCreatePage />} />
          <Route path="/editar/:id" element={<BookEditPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
