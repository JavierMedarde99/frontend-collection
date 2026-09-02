import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBook } from '../api/booksApi'
import BookForm from '../components/BookForm'

export default function BookCreatePage() {
  const navigate = useNavigate()

  async function handleSubmit(payload) {
    const created = await createBook(payload)
    navigate(`/editar/${created.id}`, { replace: true })
  }

  return (
    <section className="max-w-3xl flex flex-col gap-8">
      <div>
        <h1 className="text-headline-lg mb-1">Añadir libro</h1>
        <p className="text-body-md text-on-surface-variant">
          Introduce los datos del libro y añádelo a tu colección.
        </p>
      </div>

      <BookForm isCreate submitLabel="Guardar libro" onSubmit={handleSubmit} />
    </section>
  )
}
