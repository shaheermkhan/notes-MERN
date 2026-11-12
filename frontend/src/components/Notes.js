import { useEffect, useRef, useState } from 'react';
import './styles/Notes.css';

const Notes = ({ note, onNoteDeleted, onNoteUpdated }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(note.title);
    const [description, setDescription] = useState(note.description);
    const [user, setUser] = useState(note.user);
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [editError, setEditError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const cardRef = useRef(null);
    const dialogRef = useRef(null);
    const closeButtonRef = useRef(null);
    const deleteButtonRef = useRef(null);
    const noteDate = note.createdAt && new Date(note.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    useEffect(() => {
        if (!isOpen) return undefined;

        closeButtonRef.current?.focus();
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                setIsEditing(false);
                cardRef.current?.focus();
            } else if (event.key === 'Tab') {
                const focusableElements = dialogRef.current?.querySelectorAll(
                    'button:not(:disabled), input:not(:disabled), textarea:not(:disabled)'
                );
                const firstElement = focusableElements?.[0];
                const lastElement = focusableElements?.[focusableElements.length - 1];

                if (event.shiftKey && document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement?.focus();
                } else if (!event.shiftKey && document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const closePopup = () => {
        setIsOpen(false);
        setIsEditing(false);
        cardRef.current?.focus();
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setDeleteError('');

        try {
            const response = await fetch(`http://localhost:4000/api/notes/${note._id}`, {
                method: 'DELETE',
            });
            const contentType = response.headers.get('content-type') || '';
            const result = contentType.includes('application/json')
                ? await response.json()
                : {};

            if (!response.ok) {
                throw new Error(result.error || `Unable to delete note (${response.status}).`);
            }

            onNoteDeleted?.(note._id);
        } catch (requestError) {
            setDeleteError(requestError.message || 'Unable to delete note. Check your connection and try again.');
            setIsDeleting(false);
        }
    };

    const handleUpdate = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setEditError('');

        try {
            const response = await fetch(`http://localhost:4000/api/notes/${note._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description }),
            });
            const contentType = response.headers.get('content-type') || '';
            const result = contentType.includes('application/json')
                ? await response.json()
                : {};

            if (!response.ok) {
                throw new Error(result.error || `Unable to update note (${response.status}).`);
            }

            onNoteUpdated?.(result);
            setIsEditing(false);
        } catch (requestError) {
            setEditError(requestError.message || 'Unable to update note. Check your connection and try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <article
                ref={cardRef}
                className="note-card"
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(true)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setIsOpen(true);
                    }
                }}
            >
                <h2 className="note-card__title">{note.title}</h2>
                <p className="note-card__description">{note.description}</p>
                <time className="note-card__date" dateTime={note.createdAt}>
                    {noteDate}
                </time>
            </article>

            {isOpen && (
                <div
                    className="note-popup__backdrop"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) closePopup();
                    }}
                >
                    <section
                        ref={dialogRef}
                        className="note-popup"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={`note-popup-title-${note._id}`}
                        aria-describedby={!isEditing ? `note-popup-description-${note._id}` : undefined}
                    >
                        <button
                            ref={closeButtonRef}
                            className="note-popup__close"
                            type="button"
                            aria-label="Close note"
                            onClick={closePopup}
                        >
                            <span aria-hidden="true">×</span>
                        </button>
                        {isEditing ? (
                            <form className="note-popup__edit-form" onSubmit={handleUpdate}>
                                <h2 className="note-popup__title" id={`note-popup-title-${note._id}`}>Edit note</h2>
                                <label className="note-popup__label" htmlFor={`note-title-${note._id}`}>Title</label>
                                <input
                                    className="note-popup__input"
                                    id={`note-title-${note._id}`}
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    required
                                />
                                <label className="note-popup__label" htmlFor={`note-description-${note._id}`}>Description</label>
                                <textarea
                                    className="note-popup__input note-popup__textarea"
                                    id={`note-description-${note._id}`}
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    required
                                    rows="5"
                                />
                                {editError && <p className="note-popup__error" role="alert">{editError}</p>}
                                <div className="note-popup__actions">
                                    <button className="note-popup__save" type="submit" disabled={isSaving}>
                                        {isSaving ? 'Saving…' : 'Save changes'}
                                    </button>
                                    <button
                                        className="note-popup__cancel"
                                        type="button"
                                        onClick={() => {
                                            setTitle(note.title);
                                            setDescription(note.description);
                                            setEditError('');
                                            setIsEditing(false);
                                        }}
                                        disabled={isSaving}
                                    >Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h2 className="note-popup__title" id={`note-popup-title-${note._id}`}>
                                    {note.title}
                                </h2>
                                <p className="note-popup__description" id={`note-popup-description-${note._id}`}>
                                    {note.description}
                                </p>
                                {noteDate && <time className="note-popup__date" dateTime={note.createdAt}>{noteDate}</time>}
                                {editError && <p className="note-popup__error" role="alert">{editError}</p>}
                                <button
                                    className="note-popup__edit"
                                    type="button"
                                    onClick={() => {
                                        setTitle(note.title);
                                        setDescription(note.description);
                                        setEditError('');
                                        setIsEditing(true);
                                    }}
                                >Edit note</button>
                            </>
                        )}
                        {deleteError && <p className="note-popup__error" role="alert">{deleteError}</p>}
                        <button
                            ref={deleteButtonRef}
                            className="note-popup__delete"
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting…' : 'Delete note'}
                        </button>
                    </section>
                </div>
            )}
        </>
    );
}

export default Notes