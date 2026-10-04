import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBook } from '../api/booksApi'
import type { BookFormData } from '../types'
import BookForm from '../components/BookForm'
import BookSearch from '../components/BookSearch'
import BookIsbnScan from '../components/BookIsbnScan'
import CreateShell from '../components/CreateShell'
import { COLLECTIONS_BY_KEY } from '../constants/collections'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../hooks/usePageTitle'

type Mode = 'search' | 'manual' | 'barcode'

const MODES: { value: Mode; label: string }[] = [
  { value: 'search', label: 'Buscar libro' },
  { value: 'manual', label: 'Alta manual' },
  { value: 'barcode', label: 'Código de barras' },
]

export default function BookCreatePage() {
  usePageTitle('Añadir libro')
  const navigate = useNavigate()
  const notify = useToast()
  const [mode, setMode] = useState<Mode>('manual')

  async function handleSubmit(payload: BookFormData) {
    await createBook(payload)
    notify('Libro guardado.')
    navigate('/coleccion', { replace: true })
  }

  return (
    <section
      className="max-w-3xl flex flex-col gap-12"
      style={{ '--sc': COLLECTIONS_BY_KEY.books.accent.spine, '--c': COLLECTIONS_BY_KEY.books.accent.niche } as CSSProperties}
    >
      <CreateShell
        crumbs={[{ label: "Inicio", to: "/" }, { label: "Libros", to: "/coleccion" }, { label: "Añadir" }]}
        eyebrow="Libros"
        title="Añadir libro"
        subtitle="Añade un libro a tu colección buscándolo, escaneando su código de barras o introduciendo sus datos manualmente."
        tabs={MODES}
        activeTab={mode}
        onTabChange={(v) => setMode(v as Mode)}
      >
        {mode === 'search' ? (
          <BookSearch />
        ) : mode === 'barcode' ? (
          <BookIsbnScan />
        ) : (
          <BookForm isCreate submitLabel="Guardar libro" onSubmit={handleSubmit} />
        )}
      </CreateShell>
    </section>
  )
}