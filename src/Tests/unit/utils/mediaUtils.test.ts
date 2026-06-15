import { describe, test, expect, beforeEach, afterEach,vi } from "vitest";
import { fireEvent, render, waitFor, renderHook, act } from "@testing-library/react";
import { useEffect, useRef } from "react";

import {
  parseFileName,
  sortFiles,
  getGradient,
  formatDuration,
  loadPlaylists,
  createStoredFile,
  useUrlCache,
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

    test("sorts by date and falls back to lastModified when uploadedAt is missing", () => {
      const filesWithoutUploadedAt: StoredFile[] = [
        { id: '1', name: 'Song A.mp3', type: 'audio/mpeg', lastModified: 3000, size: 0, data: new ArrayBuffer(0), album: 'X', year: 2000, uploadedAt: '' },
        { id: '2', name: 'Song B.mp3', type: 'audio/mpeg', lastModified: 1000, size: 0, data: new ArrayBuffer(0), album: 'Y', year: 2001, uploadedAt: '' },
        { id: '3', name: 'Song C.mp3', type: 'audio/mpeg', lastModified: 2000, size: 0, data: new ArrayBuffer(0), album: 'Z', year: 2002, uploadedAt: '' },
      ];
      const sorted = sortFiles(filesWithoutUploadedAt, 'date');
      expect(sorted.map(f => f.id)).toEqual(['1', '3', '2']);
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

//UrlCache------------------------------

describe('useUrlCache', () => {
  // Mock the URL APIs before each test
  beforeEach(() => {
    URL.createObjectURL = vi.fn(
      () => `blob:mock-${Math.random().toString(36).slice(2)}`
    );
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Helper to create a minimal StoredFile
  const mockFile = (overrides: Partial<StoredFile> = {}): StoredFile => ({
    id: 'file-1',
    data: new ArrayBuffer(8),
    type: 'audio/mpeg',
    ...overrides,
  } as StoredFile);

  test('returns a function that generates a URL', () => {
    const { result } = renderHook(() => useUrlCache());
    expect(typeof result.current).toBe('function');
    const url = result.current(mockFile());
    expect(url).toMatch(/^blob:mock-/);
  });

  test('creates a blob URL once per file id and caches it', () => {
    const { result } = renderHook(() => useUrlCache());
    const getUrl = result.current;
    const file = mockFile();

    const url1 = getUrl(file);
    const url2 = getUrl(file);

    // Same object URL returned
    expect(url1).toBe(url2);
    // createObjectURL was called exactly once
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  test('returns a string URL for any valid file', () => {
    const { result } = renderHook(() => useUrlCache());
    const url = result.current(mockFile());
    expect(typeof url).toBe('string');
  });

  test('revokes all created object URLs on unmount', () => {
    const { result, unmount } = renderHook(() => useUrlCache());
    const getUrl = result.current;

    const file1 = mockFile({ id: 'a' });
    const file2 = mockFile({ id: 'b' });

    const url1 = getUrl(file1);
    const url2 = getUrl(file2);

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(url1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(url2);
  });

  test('isolates cache per component instance', () => {
    const { result: result1 } = renderHook(() => useUrlCache());
    const { result: result2 } = renderHook(() => useUrlCache());

    const file = mockFile({ id: 'shared-id' });

    const url1 = result1.current(file);
    const url2 = result2.current(file);

    // Each instance should create its own URL
    expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
    expect(url1).not.toBe(url2);

    // First instance returns the same cached URL on subsequent calls
    expect(result1.current(file)).toBe(url1);
  });

  test('does not cause re-renders when getUrl is called', () => {
    let renderCount = 0;

    const { result } = renderHook(() => {
      renderCount++;
      return useUrlCache();
    });

    // First render after mount
    expect(renderCount).toBe(1);

    const getUrl = result.current;
    act(() => {
      getUrl(mockFile({ id: 'x' }));
      getUrl(mockFile({ id: 'y' }));
      getUrl(mockFile({ id: 'x' })); // cached
    });

    // Still only one render
    expect(renderCount).toBe(1);
  });

  test('works when file.type is undefined or empty', () => {
    const { result } = renderHook(() => useUrlCache());
    const getUrl = result.current;

    const fileWithoutType = mockFile({ id: 'no-type' });
    const url = getUrl(fileWithoutType);
    expect(url).toMatch(/^blob:mock-/);

    // createObjectURL was still called
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);

    // (Optional) Check that the Blob constructor receives the correct fallback
    const originalBlob = globalThis.Blob;
    const blobMock = vi.fn();
    try {
      globalThis.Blob = blobMock as any;
      getUrl(mockFile({ id: 'with-empty-type', type: '' }));
      expect(blobMock).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ type: '' })
      );
    } finally {
      globalThis.Blob = originalBlob;
    }
  });
});


// getGradient ---------------------------------------------------------------
describe('getGradient', () => {
  test('returns a CSS linear-gradient string', () => {
    const result = getGradient('Hello');
    expect(result).toMatch(/^linear-gradient\(135deg, hsl\(\d+, 60%, 25%\), hsl\(\d+, 70%, 15%\)\)$/);
  });

  test('h1 and h2 are derived from the hash of the name', () => {
    const result = getGradient('Test');
    // extract the hue values
    const match = result.match(/hsl\((\d+), 60%, 25%\), hsl\((\d+), 70%, 15%\)/);
    expect(match).not.toBeNull();
    const h1 = parseInt(match![1]!, 10);
    const h2 = parseInt(match![2]!, 10);
    expect(h1).toBeGreaterThanOrEqual(0);
    expect(h1).toBeLessThan(360);
    expect(h2).toBe((h1 + 40) % 360);
  });

  test('same input produces identical gradient', () => {
    const a = getGradient('Adele');
    const b = getGradient('Adele');
    expect(a).toBe(b);
  });

  test('different strings usually give different gradients', () => {
    const grad1 = getGradient('Hello');
    const grad2 = getGradient('World');
    // Not a strict requirement, but it's very unlikely they collide
    expect(grad1).not.toBe(grad2);
  });

  test('empty string returns default gradient', () => {
    const empty = getGradient('');
    // h1 = 0, h2 = 40
    expect(empty).toBe('linear-gradient(135deg, hsl(0, 60%, 25%), hsl(40, 70%, 15%))');
  });

  test('handles strings with spaces and special characters', () => {
    const result = getGradient('ÄÖÜ !@#$%');
    // should still be a valid gradient
    expect(result).toMatch(/^linear-gradient\(135deg, hsl\(\d+, 60%, 25%\), hsl\(\d+, 70%, 15%\)\)$/);
  });

  test('hue values stay within 0–359 for many inputs', () => {
    const testStrings = ['a', 'ab', 'abc', '123', '!', 'very long string with spaces'];
    for (const str of testStrings) {
      const result = getGradient(str);
      const match = result.match(/hsl\((\d+), 60%, 25%\), hsl\((\d+), 70%, 15%\)/);
      expect(match).not.toBeNull();
      const h1 = parseInt(match![1]!, 10);
      const h2 = parseInt(match![2]!, 10);
      expect(h1).toBeGreaterThanOrEqual(0);
      expect(h1).toBeLessThan(360);
      expect(h2).toBeGreaterThanOrEqual(0);
      expect(h2).toBeLessThan(360);
    }
  });
});


// loadPlaylists ---------------------------------------------------------------
describe('loadPlaylists', () => {
  beforeEach(() => {
    // Mock localStorage.getItem
    globalThis.localStorage = {
      getItem: vi.fn(),
      // we don't need setItem or removeItem for this test
    } as unknown as Storage;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('returns empty array when no "playlists" key exists', () => {
    // getItem returns null by default
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    expect(loadPlaylists()).toEqual([]);
  });

  test('returns empty array when stored value is null', () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    expect(loadPlaylists()).toEqual([]);
  });

  test('returns parsed array when valid JSON array of strings is stored', () => {
    const playlists = ['Chill', 'Workout'];
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(JSON.stringify(playlists));
    expect(loadPlaylists()).toEqual(playlists);
  });

  test('works with an empty array stored as "[]"', () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('[]');
    expect(loadPlaylists()).toEqual([]);
  });

  test('throws SyntaxError if stored value is invalid JSON', () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('not-json');
    expect(() => loadPlaylists()).toThrow(SyntaxError);
  });

  test('returns parsed value even if JSON is not an array (e.g., object or string)', () => {
    // This tests runtime behavior: loadPlaylists returns whatever JSON.parse returns
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('{}');
    const result = loadPlaylists();
    expect(result).toEqual({});

    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('"single-string"');
    const result2 = loadPlaylists();
    expect(result2).toBe('single-string');
  });
});


// formatDuration ---------------------------------------------------------------
describe('formatDuration', () => {
  test('returns "--:--" for undefined', () => {
    expect(formatDuration(undefined)).toBe('--:--');
  });

  test('returns "--:--" for 0', () => {
    expect(formatDuration(0)).toBe('--:--');
  });

  test('returns "--:--" for null', () => {
    // @ts-expect-error - testing runtime behaviour
    expect(formatDuration(null)).toBe('--:--');
  });

  test('returns "--:--" for NaN', () => {
    expect(formatDuration(NaN)).toBe('--:--');
  });

  test('formats 65 seconds as "1:05"', () => {
    expect(formatDuration(65)).toBe('1:05');
  });

  test('formats 60 seconds as "1:00"', () => {
    expect(formatDuration(60)).toBe('1:00');
  });

  test('formats 3661 seconds as "61:01"', () => {
    expect(formatDuration(3661)).toBe('61:01');
  });

  test('formats less than 10 seconds with leading zero', () => {
    expect(formatDuration(5)).toBe('0:05');
  });

  test('truncates fractional seconds', () => {
    expect(formatDuration(65.9)).toBe('1:05');
    expect(formatDuration(65.1)).toBe('1:05');
  });

  test('handles large numbers', () => {
    const seconds = 10000;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    expect(formatDuration(seconds)).toBe(`${mins}:${secs}`);
  });

  test('negative seconds produce negative minutes', () => {
    expect(formatDuration(-65)).toBe('-1:05');
  });
});


// createStoredFile ---------------------------------------------------------------
describe('createStoredFile', () => {
  // Mock crypto.randomUUID
  beforeEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: vi.fn(() => 'mock-uuid-1234'),
      },
      writable: true,
    });
    // Freeze the system time to a known date
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // Helper to create a mock File
  const mockFile = (overrides: Partial<File> = {}): File =>
    ({
      name: 'test.mp3',
      type: 'audio/mpeg',
      lastModified: 1718400000000,
      size: 1024,
      ...overrides,
    } as File);

  test('returns a complete StoredFile with correct defaults', () => {
    const file = mockFile();
    const data = new ArrayBuffer(128);
    const result = createStoredFile(file, data);

    expect(result).toEqual({
      id: 'mock-uuid-1234',
      name: 'test.mp3',
      type: 'audio/mpeg',
      lastModified: 1718400000000,
      size: 1024,
      uploadedAt: '2024-06-15T12:00:00.000Z',
      data: data,
    });
  });

  test('generates a unique ID using crypto.randomUUID', () => {
    const result = createStoredFile(mockFile(), new ArrayBuffer(0));
    expect(result.id).toBe('mock-uuid-1234');
    expect(globalThis.crypto.randomUUID).toHaveBeenCalledTimes(1);
  });

  test('sets uploadedAt to the current ISO timestamp', () => {
    const result = createStoredFile(mockFile(), new ArrayBuffer(0));
    expect(result.uploadedAt).toBe('2024-06-15T12:00:00.000Z');
  });

  test('copies name, type, lastModified, size from the File', () => {
    const customFile = mockFile({
      name: 'song.wav',
      type: 'audio/wav',
      lastModified: 9999999,
      size: 4096,
    });
    const result = createStoredFile(customFile, new ArrayBuffer(0));
    expect(result.name).toBe('song.wav');
    expect(result.type).toBe('audio/wav');
    expect(result.lastModified).toBe(9999999);
    expect(result.size).toBe(4096);
  });

  test('stores the exact data ArrayBuffer', () => {
    const buf = new ArrayBuffer(256);
    const result = createStoredFile(mockFile(), buf);
    expect(result.data).toBe(buf);
  });

  test('merges extras and overrides defaults', () => {
    const file = mockFile();
    const data = new ArrayBuffer(0);
    const extras = {
      id: 'custom-id',
      album: 'Greatest Hits',
      year: 2021,
      uploadedAt: '1999-12-31T23:59:59.000Z',
    };
    const result = createStoredFile(file, data, extras);

    // Extras should override id and uploadedAt, and add album/year
    expect(result.id).toBe('custom-id');
    expect(result.uploadedAt).toBe('1999-12-31T23:59:59.000Z');
    expect(result).toMatchObject({
      name: 'test.mp3',
      album: 'Greatest Hits',
      year: 2021,
    });
    // Default fields that weren't overridden remain
    expect(result.type).toBe('audio/mpeg');
  });

  test('does not mutate the original File object', () => {
    const file = mockFile();
    const original = { ...file };
    createStoredFile(file, new ArrayBuffer(0));
    expect(file).toEqual(original);
  });
});