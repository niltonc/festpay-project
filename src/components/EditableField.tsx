import React, { useState } from "react";
import { Check, Pencil, X } from "lucide-react";

interface EditableFieldProps {
  value: string | number;
  type?: "text" | "number" | "date";
  onSave: (value: string | number) => void;
  displayFormatter?: (value: string | number) => string;
  className?: string;
  inputClassName?: string;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  type = "text",
  onSave,
  displayFormatter,
  className = "",
  inputClassName = "",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string>(String(value));

  const startEditing = () => {
    setDraft(String(value));
    setIsEditing(true);
  };

  const commit = () => {
    if (type === "number") {
      const parsed = Number(draft);
      if (draft.trim() === "" || Number.isNaN(parsed)) {
        setIsEditing(false);
        return;
      }
      onSave(parsed);
    } else {
      if (draft.trim() === "") {
        setIsEditing(false);
        return;
      }
      onSave(draft);
    }
    setIsEditing(false);
  };

  const cancel = () => setIsEditing(false);

  if (isEditing) {
    return (
      <span className="inline-flex items-center gap-1">
        <input
          autoFocus
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
          className={`rounded border border-indigo-300 px-1 py-0.5 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 ${inputClassName}`}
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={commit}
          className="text-emerald-600 hover:text-emerald-800"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={cancel}
          className="text-rose-500 hover:text-rose-700"
        >
          <X className="h-4 w-4" />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      title="Clique para editar"
      className={`group inline-flex items-center gap-1.5 text-left ${className}`}
    >
      <span>{displayFormatter ? displayFormatter(value) : value}</span>
      <Pencil className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
    </button>
  );
};
