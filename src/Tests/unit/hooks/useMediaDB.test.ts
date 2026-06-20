import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

import { useMediaDB } from '../../../hooks/useMediaDB.ts';
import type { StoredFile } from '../../../type/media.ts';

function createFakeIndexedDB() {
  const stores: Record<string, Map<string, any>> = {
    media: new Map(),
    thumbnails: new Map(),
  };

  const createRequest = (result: any) => {
    const request: any = { onsuccess: null, onerror: null, result, error: null };
    queueMicrotask(() => {
      request.onsuccess?.({ target: request });
    });
    return request;
  };

  const createObjectStore = (name: string) => {
    let store = stores[name];
    if (!store) {
      store = new Map<string, any>();
      stores[name] = store;
    }

    return {
      get: (key: string) => createRequest(store.get(key)),
      getAll: () => createRequest(Array.from(store.values())),
      add: (value: any) => {
        store.set(value.id, value);
        return createRequest(undefined);
      },
      put: (value: any) => {
        store.set(value.id, value);
        return createRequest(undefined);
      },
    };
  };

  const db = {
    objectStoreNames: {
      contains: (name: string) => Object.prototype.hasOwnProperty.call(stores, name),
    },
    createObjectStore: (name: string) => createObjectStore(name),
    transaction: (_names: string[], _mode: string) => ({
      objectStore: (name: string) => createObjectStore(name),
    }),
    close: () => {},
  };

  return {
    open: (_name: string, _version: number) => {
      const request: any = { onsuccess: null, onerror: null, onupgradeneeded: null, result: db };
      queueMicrotask(() => {
        request.onupgradeneeded?.({ target: request });
        request.onsuccess?.({ target: request });
      });
      return request;
    },
    internalStores: stores,
  };
}

describe('useMediaDB', () => {
  let fakeIDB: ReturnType<typeof createFakeIndexedDB>;

  beforeEach(() => {
    fakeIDB = createFakeIndexedDB();
    (globalThis as any).indexedDB = fakeIDB;
  });

  afterEach(() => {
    delete (globalThis as any).indexedDB;
  });

  test('initializes the database and loads an empty file list', async () => {
    const { result } = renderHook(() => useMediaDB());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current.files).toEqual([]);
  });

  test('saveFile stores metadata and later returns data with loadFileData', async () => {
    const { result } = renderHook(() => useMediaDB());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    const data = new Uint8Array([1, 2, 3]).buffer;
    const file: StoredFile = {
      id: 'file-1',
      name: 'test.mp3',
      type: 'audio/mpeg',
      lastModified: 1,
      size: data.byteLength,
      data,
      album: 'Test Album',
      year: 2024,
      uploadedAt: '2026-06-20T00:00:00.000Z',
    };

    act(() => {
      result.current.saveFile(file);
    });

    expect(result.current.files).toEqual([expect.objectContaining({ id: 'file-1', name: 'test.mp3' })]);

    const loadedData = await result.current.loadFileData('file-1');
    expect(new Uint8Array(loadedData)).toEqual(new Uint8Array(data));
  });

  test('saveThumbnail persists thumbnails and loadThumbnails returns them', async () => {
    const { result } = renderHook(() => useMediaDB());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    const thumbnail = 'data:image/jpeg;base64,abc123';

    act(() => {
      result.current.saveThumbnail('thumb-1', thumbnail);
    });

    const thumbnails = await result.current.loadThumbnails();
    expect(thumbnails).toEqual({ 'thumb-1': thumbnail });
  });

  test('loadFileData rejects when file does not exist', async () => {
    const { result } = renderHook(() => useMediaDB());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    await expect(result.current.loadFileData('missing-file')).rejects.toThrow('File not found');
  });
});
