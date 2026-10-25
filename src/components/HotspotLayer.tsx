import { goToChapter, useActiveChapter } from '../scroll/scrollStore'
import { hotspots, labelElements, useHovered } from '../three/hotspots'

/**
 * Labels for the clickable objects. On the intro view they all show as tappable
 * hotspots so touch users know what to try; elsewhere only the hovered one shows.
 */
export function HotspotLayer() {
  const onIntro = useActiveChapter() === 0
  const hovered = useHovered()

  return (
    <div className="hotspots">
      {hotspots.map(({ chapter, label }) => (
        <button
          key={chapter}
          ref={(el) => {
            if (el) labelElements.set(chapter, el)
            else labelElements.delete(chapter)
          }}
          type="button"
          className="hotspot"
          data-visible={onIntro || hovered === chapter}
          tabIndex={onIntro ? 0 : -1}
          aria-hidden={!onIntro}
          onClick={() => goToChapter(chapter)}
        >
          <span className="hotspot__dot" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  )
}
