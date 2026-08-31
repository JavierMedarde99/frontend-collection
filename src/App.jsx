import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import BookSearchPage from './pages/BookSearchPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="max-w-[1440px] mx-auto px-5 md:px-20 py-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/buscar" element={<BookSearchPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
