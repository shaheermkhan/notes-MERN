import { useState } from "react"
import './styles/NotesForm.css';

const NotesForm = ({ onNoteCreated, userId }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:4000/api/notes', {
                method: 'POST',
                body: JSON.stringify({ title, description, user: userId }),
                headers: { 'Content-Type': 'application/json' },
            });
            const contentType = response.headers.get('content-type') || '';
            const result = contentType.includes('application/json')
                ? await response.json()
                : {};

            if (!response.ok) {
                throw new Error(result.error || `Unable to create note (${response.status}).`);
            }

            setTitle('')
            setDescription('')
            setError('')
            onNoteCreated?.(result)
        } catch (requestError) {
            setError(requestError.message || 'Unable to create note. Check your connection and try again.');
        }
    }

    return (
        <form className="notes-form" onSubmit={handleSubmit}>
            <div className="notes-form__heading">
                <h1 className="notes-form__title">Create a note</h1>
                <p className="notes-form__intro">Capture an idea before it slips away.</p>
            </div>

            <div className="notes-form__field">
                <label htmlFor="note-title">Note title</label>
                <input
                    id="note-title"
                    type="text"
                    placeholder="Give your note a title"
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                />
            </div>

            <div className="notes-form__field">
                <label htmlFor="note-description">Description</label>
                <textarea
                    id="note-description"
                    rows="3"
                    placeholder="Write down your thoughts..."
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                />
            </div>

            {error && <p className="notes-form__error" role="alert">{error}</p>}

            <button className="notes-form__submit" type="submit">Add note <span aria-hidden="true">↗</span></button>
        </form>
    )
}

export default NotesForm