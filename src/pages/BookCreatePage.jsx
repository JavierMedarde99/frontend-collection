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
    <section className="max-w-3xl flex flex-col gap-8">
      <div>
        <h1 className="text-headline-lg mb-1">Añadir libro</h1>
        <p className="text-body-md text-on-surface-variant">
          Añade un libro a tu colección buscándolo o introduciendo sus datos manualmente.
        </p>
      </div>

      <div role="tablist" className="flex items-center gap-2" aria-label="Método de alta">
        {MODES.map((m) => (
          <button
            key={m.key}
            role="tab"
            aria-selected={mode === m.key}
            className={`btn-ghost !h-10 ${mode === m.key ? '!bg-charcoal !text-white' : ''}`}
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
