const SCRYFALL_API = 'https://api.scryfall.com'

interface ScryfallFace {
  oracle_text?: string
}

interface ScryfallCard {
  oracle_text?: string
  card_faces?: ScryfallFace[]
}

/**
 * Devuelve el texto oracle de una carta de Scryfall (todas sus caras).
 * Se usa como fallback para comprobar si una carta no legendaria/criatura
 * puede ser comandante ("can be your commander").
 */
export async function getScryfallOracleText(scryfallId: string): Promise<string> {
  const res = await fetch(`${SCRYFALL_API}/cards/${encodeURIComponent(scryfallId)}`)
  if (!res.ok) {
    throw new Error(`Error ${res.status}`)
  }
  const card = (await res.json()) as ScryfallCard
  const faces = card.card_faces?.map((f) => f.oracle_text || '') || []
  return [card.oracle_text || '', ...faces].join('\n')
}

/** Comprueba si el texto oracle permite usar la carta como comandante. */
export function allowsAsCommander(oracleText: string): boolean {
  return /can be your commander/i.test(oracleText)
}
