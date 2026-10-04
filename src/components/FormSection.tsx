import type { ReactNode } from 'react'

interface FormSectionProps {
  title: string
  children: ReactNode
}

/** Agrupa campos relacionados con versalitas Gabinete y barrita de acento (--sc). */
export default function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className="fsec flex flex-col gap-6" aria-label={title}>
      <h3 className="fsec-cap">{title}</h3>
      {children}
    </section>
  )
}