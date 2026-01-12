import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Manually mock localStorage if it's missing
if (typeof window !== 'undefined' && !window.localStorage) {
    Object.defineProperty(window, 'localStorage', {
        value: {
            getItem: vi.fn(),
            setItem: vi.fn(),
            clear: vi.fn(),
            removeItem: vi.fn(),
        },
        writable: true
    });
}