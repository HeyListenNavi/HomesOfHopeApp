import { useState } from "react";

export function useEditableList<T>(items: T[], onChange: (items: T[]) => void) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const initialItem = editingIndex !== null ? items[editingIndex] : undefined;

    const add = () => {
        setEditingIndex(null);
    };

    const edit = (index: number) => {
        setEditingIndex(index);
    };

    const remove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const save = (item: T) => {
        const updated =
            editingIndex === null
                ? [...items, item]
                : items.map((v, i) => (i === editingIndex ? item : v));

        onChange(updated);
        setEditingIndex(null);
    };

    return {
        items,
        editingIndex,
        initialItem,
        add,
        edit,
        remove,
        save,
        isEditing: editingIndex !== null,
    };
}
