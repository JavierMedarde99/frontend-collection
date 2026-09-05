import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBook } from '../api/booksApi'
import BookForm from '../components/BookForm'
import BookSearch from '../components/BookSearch'

const MODES = [
  { key: 'search', label: 'Buscar libro' },
  { key: 'manual', label: 'Alta manual' },
]

export default function BookCreatePage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('manual')

  async function handleSubmit(payload) {
    const created = await createBook(payload)
    navigate(`/editar/${created.id}`, { replace: true })
  }

  return (
    <section className="max-w-3xl flex flex-col gap-24">
      <div>
        <h1 className="font-display text-heading-lg mb-2">Añadir libro</h1>
        <p className="text-body text-slate">
          Añade un libro a tu colección buscándolo o introduciendo sus datos manualmente.
        </p>
      </div>

      <div role="tablist" className="flex items-center gap-1 p-1 rounded-pill bg-white border border-silver w-fit" aria-label="Método de alta">
        {MODES.map((m) => (
          <button
            key={m.key}
            role="tab"
            aria-selected={mode === m.key}
            className={`rounded-pill px-4 py-2 text-sm font-semibold transition-all duration-200 ease-smooth ${
              mode === m.key
                ? 'bg-brand text-white shadow-brand-glow'
                : 'text-graphite hover:text-ink'
            }`}
            onClick={() => setMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'search' ? (
        <BookSearch />
      ) : (
        <BookForm isCreate submitLabel="Guardar libro" onSubmit={handleSubmit} />
      )}
    </section>
  )
}