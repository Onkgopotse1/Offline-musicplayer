import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

import { useMediaDB } from '../../../hooks/useMediaDB.ts';
import type { StoredFile } from '../../../type/media.ts';



describe("useMediaDB", () => {
test("rendering useMediaDB hook", () => {
 const { result } = renderHook(() => useMediaDB());
 expect(result.current.loaded).toBe(false);
 });
    test("useMediaDB allows updating loaded state", async () => {
        const {result} = renderHook(() => useMediaDB());
        await waitFor(() => {
        expect(result.current.loaded).toBe(true);
        });
        
    })
 });
