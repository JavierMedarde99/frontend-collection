import type { ReactNode } from 'react'

interface FormSectionProps {
  title: string
  children: ReactNode
}

/** Agrupa campos relacionados con un encabezado sutil. */
export default function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className="border-t border-silver/60 pt-5 first:border-t-0 first:pt-0 flex flex-col gap-6" aria-label={title}>
      <h3 className="text-caption font-semibold uppercase tracking-wide text-stone">
        {title}
      </h3>
      {children}
    </section>
  )
}
