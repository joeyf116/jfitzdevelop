import { goToChapter, useActiveChapter } from '../scroll/scrollStore'
import { hotspots, labelElements, useHovered, type HotspotId } from '../three/hotspots'

/**
 * Labels for the clickable objects. On the intro view they all show as tappable
 * hotspots so touch users know what to try; elsewhere only the hovered one shows.
 */
export function HotspotLayer() {
  const onIntro = useActiveChapter() === 0
  const hovered = useHovered()

  const register = (id: HotspotId) => (el: HTMLElement | null) => {
    if (el) labelElements.set(id, el)
    else labelElements.delete(id)
  }

  return (
    <div className="hotspots">
      {hotspots.map(({ id, label, chapter, href }) => {
        const common = {
          className: 'hotspot',
          'data-visible': onIntro || hovered === id,
          tabIndex: onIntro ? 0 : -1,
          'aria-hidden': !onIntro,
        }
        const content = (
          <>
            <span className="hotspot__dot" aria-hidden="true" />
            {label}
          </>
        )
        return chapter ? (
          <button key={id} ref={register(id)} type="button" {...common} onClick={() => goToChapter(chapter)}>
            {content}
          </button>
        ) : (
          <a key={id} ref={register(id)} href={href} target="_blank" rel="noopener noreferrer" {...common}>
            {content}
          </a>
        )
      })}
    </div>
  )
}
