// SongList.tsx
import type { StoredFile } from "../type/media.ts";
import { parseFileName, formatDuration } from "../utils/mediaUtils.ts";

function DurationCell({ duration }: { duration: number | undefined }) {
  return <>{formatDuration(duration)}</>;
}

type SongListProps = {
  files: StoredFile[];
  checkedIds?: string[];
  onToggleCheckbox?: (id: string) => void;
  onPlay?: (id: string) => void;
  currentMediaId?: string | null;
  showCheckbox?: boolean;
  showPlayButton?: boolean;
};

export default function SongList({
  files,
  checkedIds = [],
  onToggleCheckbox,
  onPlay,
  currentMediaId,
  showCheckbox = true,
  showPlayButton = true,
}: SongListProps) {
  return (
    <>
      {files
        .filter(f => f.type.startsWith("audio/"))
        .map((item) => {
          const { artist, song } = parseFileName(item);

          return (
            <div
              key={item.id}
              className={`horizontal-divs ${item.id === currentMediaId ? "playing" : ""}`}
            >
              {showCheckbox && (
                <div className="check-box">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={checkedIds.includes(item.id)}
                    onChange={() => onToggleCheckbox?.(item.id)}
                  />
                </div>
              )}
              {showPlayButton && (
                <div className="play">
                  <button onClick={() => onPlay?.(item.id)} className="play-buttons">
                    ▶
                  </button>
                </div>
              )}
              <div className="song-name">
                <p className="text">{song}</p>
              </div>
              <div className="artist-name">
                <p className="text">{artist}</p>
              </div>
              <div className="album-name">
                <p className="text">album's name</p>
              </div>
              <div className="genre">
                <p className="text">genre name</p>
              </div>
              <div className="time">
                <p className="text"><DurationCell duration={item.duration} /></p>
              </div>
            </div>
          );
        })}
    </>
  );
}