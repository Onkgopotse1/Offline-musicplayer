import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

import { useMediaDB } from '../../../hooks/useMediaDB.ts';
import type { StoredFile } from '../../../type/media.ts';



describe("useMediaDB", () => {

  afterEach(() => {
    vi.restoreAllMocks();

    // Remove our fake IndexedDB after every test
    delete (globalThis as any).indexedDB;
  });

  // ---------------------------------------------
  //----- TEST 1
  // ---------------------------------------------
  test("rendering useMediaDB hook", () => {

    const fakeOpenRequest = {
        result: {},
        onsuccess: null,
        onupgradeneeded: null,
    };

    (globalThis as any).indexedDB = {
        open: vi.fn(() => fakeOpenRequest),
    };

    const { result } = renderHook(() => useMediaDB());

    expect(result.current.loaded).toBe(false);
    });


  // ---------------------------------------------
  // TEST 2
  // ---------------------------------------------

  test("loaded becomes true after database opens", async () => {

    // ---------------------------------------------
    // 1. FAKE getAll REQUEST
    // ---------------------------------------------

    const fakeGetAllRequest = {
      result: [],

      onsuccess: null as null | (() => void),
    };

    // ---------------------------------------------
    // 2. FAKE OBJECT STORE
    // ---------------------------------------------

    const fakeObjectStore = {
      getAll: vi.fn(() => fakeGetAllRequest),
    };


    // ---------------------------------------------
    // 3. FAKE TRANSACTION
    // ---------------------------------------------

    const fakeTransaction = {
      objectStore: vi.fn(() => fakeObjectStore),
    };


    // ---------------------------------------------
    // 4. FAKE DATABASE
    // ---------------------------------------------

    const fakeDB = {
      transaction: vi.fn(() => fakeTransaction),
      close: vi.fn(),
    };


    // ---------------------------------------------
    // 5. FAKE OPEN REQUEST
    // ---------------------------------------------

    const fakeOpenRequest = {

      result: fakeDB,

      onsuccess: null as null | (() => void),

      onupgradeneeded: null as null | (() => void),
    };


    // ---------------------------------------------
    // 6. CREATE FAKE indexedDB
    // ---------------------------------------------

    (globalThis as any).indexedDB = {

      open: vi.fn(() => fakeOpenRequest),

    };


    // ---------------------------------------------
    // 7. RENDER HOOK
    // ---------------------------------------------

    const { result } = renderHook(() => useMediaDB());


    // ---------------------------------------------
    // 8. PRETEND DATABASE FINISHED OPENING
    // ---------------------------------------------

    fakeOpenRequest.onsuccess?.();


    // ---------------------------------------------
    // 9. PRETEND getAll() FINISHED
    // ---------------------------------------------

    fakeGetAllRequest.onsuccess?.();


    // ---------------------------------------------
    // 10. WAIT FOR REACT STATE UPDATE
    // ---------------------------------------------

    await waitFor(() => {

      expect(result.current.loaded).toBe(true);

    });


    // ---------------------------------------------
    // 11. VERIFY indexedDB.open()
    // ---------------------------------------------

    expect(globalThis.indexedDB.open).toHaveBeenCalledWith(
      "MediaDB",
      3
    );


    // ---------------------------------------------
    // 12. VERIFY DATABASE CHAIN
    // ---------------------------------------------

    expect(fakeDB.transaction).toHaveBeenCalledWith(
      ["media"],
      "readonly"
    );

    expect(fakeTransaction.objectStore).toHaveBeenCalledWith(
      "media"
    );

    expect(fakeObjectStore.getAll).toHaveBeenCalled();
  });

});

