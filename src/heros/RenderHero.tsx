type HeroMedia = {
  alt?: string | null
  url?: string | null
}

type HeroData = {
  type?: 'none' | 'highImpact' | 'mediumImpact' | 'lowImpact' | null
  heading?: string | null
  subheading?: string | null
  media?: HeroMedia | string | number | null
}

const heroClasses: Record<NonNullable<HeroData['type']>, string> = {
  none: '',
  highImpact: 'min-h-[70vh] justify-center text-center text-white',
  mediumImpact: 'py-16',
  lowImpact: 'py-10',
}

export function RenderHero({ hero }: { hero?: HeroData | null }) {
  if (!hero?.type || hero.type === 'none') return null

  const media = typeof hero.media === 'object' ? hero.media : null
  const hasImage = Boolean(media?.url)

  return (
    <section
      className={`relative flex overflow-hidden px-6 ${heroClasses[hero.type]}`}
      style={
        hasImage && hero.type === 'highImpact'
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url(${media?.url})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }
          : undefined
      }
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {hero.heading && <h1 className="text-4xl font-bold md:text-6xl">{hero.heading}</h1>}
        {hero.subheading && <p className="max-w-3xl text-lg opacity-80">{hero.subheading}</p>}
        {hasImage && hero.type === 'mediumImpact' && (
          <img
            alt={media?.alt ?? ''}
            className="mt-4 max-h-[480px] w-full rounded-lg object-cover"
            src={media?.url ?? ''}
          />
        )}
      </div>
    </section>
  )
}
