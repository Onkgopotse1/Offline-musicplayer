import { describe, test, expect, beforeEach } from "vitest";

import {
  parseFileName,
  sortFiles,
  getGradient,
  formatDuration,
  loadPlaylists,
  createStoredFile,
} from "../../../utils/mediaUtils.ts";
import type { StoredFile } from "../../../type/media.ts";

//parseFileName -----------------------------------------------------------------

describe('parseFileName', () => {
  // Happy path: artist starts with a letter
  test('typical pattern: Artist - Song', () => {
    const result = parseFileName({ name: 'Adele - Hello.mp3' });
    expect(result).toEqual({ artist: 'Adele', song: 'Hello' });
  });

  // Happy path reversed: first part starts with a number
  test('pattern where first part is the song (starts with number)', () => {
    const result = parseFileName({ name: '01 - Highway to Hell.mp3' });
    expect(result).toEqual({ song: '01', artist: 'Highway to Hell' });
  });

  // No dash at all
  test('no dash – returns unknown artist', () => {
    const result = parseFileName({ name: 'Bohemian Rhapsody.mp3' });
    expect(result).toEqual({ artist: 'Unknown Artist', song: 'Bohemian Rhapsody.mp3' });
  });
});



  // Multiple dashes – only the first split is used
  test('multiple dashes – only first dash splits artist/song', () => {
    const result = parseFileName({ name: 'Pink Floyd - Wish - You Were Here.mp3' });
    expect(result).toEqual({ artist: 'Pink Floyd', song: 'Wish - You Were Here' });
  });

  // File without extension
  test('file without extension', () => {
    const result = parseFileName({ name: 'Queen - Bohemian Rhapsody' });
    expect(result).toEqual({ artist: 'Queen', song: 'Bohemian Rhapsody' });
  });

  // Leading/trailing spaces should be trimmed
  test('trims spaces around artist and song', () => {
    const result = parseFileName({ name: '   Beatles   -   Let It Be   .mp3' });
    expect(result).toEqual({ artist: 'Beatles', song: 'Let It Be' });
  });

  // Empty string after trimming the artist part
  test('first part becomes empty after trim (e.g., " - Song")', () => {
    // firstPart = "" → /^[A-Za-z]/.test("") is false
    // so song = "", artist = "Song"
    const result = parseFileName({ name: '   - Song.mp3' });
    expect(result).toEqual({ song: '', artist: 'Song' });
  });

  // Accented first letter – regex only matches ASCII letters, so it’s treated as song
  test('non-ASCII first character (accented)', () => {
    const result = parseFileName({ name: 'Édith Piaf - La Vie en Rose.mp3' });
    // Because 'É' is not in [A-Za-z], the function thinks the first part is the song
    expect(result).toEqual({ song: 'Édith Piaf', artist: 'La Vie en Rose' });
  });

  //--------------


 // sortFiles ---------------------------------------------------------------------

const mockFiles: StoredFile[] = [
  { id: '1', name: 'Adele - Hello.mp3', type: 'audio/mpeg', lastModified: 1000, size: 0, data: new ArrayBuffer(0), album: '25', year: 2015, uploadedAt: '2023-01-01T00:00:00.000Z' },
  { id: '2', name: 'Queen - Bohemian Rhapsody.mp3', type: 'audio/mpeg', lastModified: 2000, size: 0, data: new ArrayBuffer(0), album: 'A Night at the Opera', year: 1975, uploadedAt: '2023-01-01T00:00:00.000Z' },
  { id: '3', name: '01 - Intro.mp3', type: 'audio/mpeg', lastModified: 3000, size: 0, data: new ArrayBuffer(0), album: 'Unknown', year: 2007, uploadedAt: '2023-01-01T00:00:00.000Z' },
  { id: '4', name: 'Beyoncé - Halo.mp3', type: 'audio/mpeg', lastModified: 1500, size: 0, data: new ArrayBuffer(0), album: 'I Am... Sasha Fierce', year: 2008, uploadedAt: '2022-05-05T00:00:00.000Z' },
  { id: '5', name: 'No Dash Song.mp3', type: 'audio/mpeg', lastModified: 500, size: 0, data: new ArrayBuffer(0), album: 'Unknown', year: 0, uploadedAt: '2023-01-01T00:00:00.000Z' },
];

describe('sortFiles', () => {
  test('does not mutate the original array', () => {
    const original = [...mockFiles];
    sortFiles(mockFiles, 'az');
    expect(mockFiles).toEqual(original);
  });

  test('sorts by "az" (song name)', () => {
    const sorted = sortFiles(mockFiles, 'az');
    const songs = sorted.map(f => parseFileName(f).song);
    expect(songs).toEqual([
      '01',
      'Bohemian Rhapsody',
      'Halo',
      'Hello',
      'No Dash Song.mp3'
    ]);
  });


  test("sorts by artist",() => {
    const sorted = sortFiles(mockFiles, "artist");
    const artists = sorted.map(f => parseFileName(f ).artist);
    expect(artists).toEqual([
      'Adele',
      'Beyoncé',
      'Intro',
      'Queen',
      'Unknown Artist',
    ]);
  })


    test("sorts by album",() => {
    const sorted = sortFiles(mockFiles, "album");
    const albums = sorted.map(f => (f ).album);
    expect(albums).toEqual([
    "25",
    "A Night at the Opera",
    "I Am... Sasha Fierce",
    "Unknown",
    "Unknown",
    ]);
  })


    test("sorts by year",() => {
    const sorted = sortFiles(mockFiles, "year");
    const year = sorted.map(f => (f ).year);
    expect(year).toEqual([
    2015,
    2008,
    2007,
    1975,
    0,
    ]);
  })

    test("sorts by date",() => {
    const sorted = sortFiles(mockFiles, "date");
    const uploadedAt = sorted.map(f => (f ).uploadedAt);
    expect(uploadedAt).toEqual([
    "2023-01-01T00:00:00.000Z",
    "2023-01-01T00:00:00.000Z",
    "2023-01-01T00:00:00.000Z",
    "2023-01-01T00:00:00.000Z",
    "2022-05-05T00:00:00.000Z"
    ]);
  })
 
      test('defaults to last-modified descending for unknown or missing sortBy', () => {
      const byUnknown = sortFiles(mockFiles, 'unknown');
      expect(byUnknown.map(f => f.lastModified)).toEqual([3000, 2000, 1500, 1000, 500]);

      const byMissing = sortFiles(mockFiles, undefined as unknown as string);
      expect(byMissing.map(f => f.lastModified)).toEqual([3000, 2000, 1500, 1000, 500]);
    });

    test('stable sort preserves original order for ties (equal compare values)', () => {
      const tieFiles: StoredFile[] = [
        { id: 'a', name: 'A - 1.mp3', type: 'audio/mpeg', lastModified: 1000, size: 0, data: new ArrayBuffer(0), album: 'X', year: 2000, uploadedAt: '2023-01-01T00:00:00.000Z' },
        { id: 'b', name: 'B - 2.mp3', type: 'audio/mpeg', lastModified: 1000, size: 0, data: new ArrayBuffer(0), album: 'Y', year: 2001, uploadedAt: '2023-01-01T00:00:00.000Z' },
        { id: 'c', name: 'C - 3.mp3', type: 'audio/mpeg', lastModified: 500, size: 0, data: new ArrayBuffer(0), album: 'Z', year: 2002, uploadedAt: '2023-01-01T00:00:00.000Z' },
      ];

      // Original insertion order is [a, b, c]. a and b tie on lastModified (1000).
      const sorted = sortFiles(tieFiles, ''); // unknown/empty sortBy -> default lastModified numeric sort
      expect(sorted.map(f => f.id)).toEqual(['a', 'b', 'c']);
    });

    test('handles empty files array without error and returns empty array', () => {
      const result = sortFiles([], 'az');
      expect(result).toEqual([]);
    });

    test('uses parseFileName for artist/song-based sorting', () => {
      const files: StoredFile[] = [
        { id: '1', name: '01 - Intro.mp3', type: 'audio/mpeg', lastModified: 100, size: 0, data: new ArrayBuffer(0), album: 'X', year: 2000, uploadedAt: '2023-01-01T00:00:00.000Z' },
        { id: '2', name: 'Beatles - Let It Be.mp3', type: 'audio/mpeg', lastModified: 200, size: 0, data: new ArrayBuffer(0), album: 'Y', year: 1970, uploadedAt: '2023-01-01T00:00:00.000Z' },
        { id: '3', name: '2 - Another Song.mp3', type: 'audio/mpeg', lastModified: 300, size: 0, data: new ArrayBuffer(0), album: 'Z', year: 2001, uploadedAt: '2023-01-01T00:00:00.000Z' },
      ];

      // parseFileName results: '01 - Intro' -> artist: 'Intro'
      // 'Beatles - Let It Be' -> artist: 'Beatles'
      // '2 - Another Song' -> artist: 'Another Song'
      const sortedByArtist = sortFiles(files, 'artist');
      const artists = sortedByArtist.map(f => parseFileName(f).artist);
      expect(artists).toEqual(['Another Song', 'Beatles', 'Intro']);

      
      const sortedBySong = sortFiles(files, 'az');
      const songs = sortedBySong.map(f => parseFileName(f).song);
      expect(songs).toEqual(['01', '2', 'Let It Be']);
    });
});

//-----------------------------