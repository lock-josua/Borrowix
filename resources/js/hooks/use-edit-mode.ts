import { useState, useCallback } from 'react';

/**
 * A simple hook to manage "Edit Mode" for forms.
 *
 * Returns the editing state and functions to start, stop, or cancel editing.
 */
export function useEditMode(initialState = false) {
    const [isEditing, setIsEditing] = useState(initialState);

    const startEditing = useCallback(() => setIsEditing(true), []);
    const stopEditing = useCallback(() => setIsEditing(false), []);

    const toggleEditing = useCallback(() => {
        setIsEditing((prev) => !prev);
    }, []);

    return {
        isEditing,
        startEditing,
        stopEditing,
        toggleEditing,
    };
}
