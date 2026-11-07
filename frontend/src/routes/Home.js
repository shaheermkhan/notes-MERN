import { useEffect, useState } from "react";
import Notes from '../components/Notes'
import NotesForm from '../components/NotesForm'

function Home() {
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState('');

    const handleNoteCreated = (note) => {
        setNotes((currentNotes) => [note, ...currentNotes]);
    };

    const handleNoteDeleted = (noteId) => {
        setNotes((currentNotes) => currentNotes.filter((note) => note._id !== noteId));
    };

    const handleNoteUpdated = (updatedNote) => {
        setNotes((currentNotes) => currentNotes.map((note) => (
            note._id === updatedNote._id ? updatedNote : note
        )));
    };

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/notes');
                const contentType = response.headers.get('content-type') || '';

                console.log(response)

                if (!contentType.includes('application/json')) {
                    throw new Error(
                        'The notes API returned a non-JSON response. Check that the backend is running and the frontend proxy is configured.'
                    );
                }

                const json = await response.json();
                if (!response.ok) {
                    throw new Error(json.error || `Request failed (${response.status})`);
                }

                setNotes(json);
            } catch (requestError) {
                setError(requestError.message || 'Unable to load notes.');
            }
        };

        fetchNotes();
    }, []);

    return (
        <>
            <NotesForm onNoteCreated={handleNoteCreated} />
            <div className="notes">
                {error && <p role="alert">{error}</p>}
                {notes.map((note) => (
                    <Notes
                        key={note._id}
                        note={note}
                        onNoteDeleted={handleNoteDeleted}
                        onNoteUpdated={handleNoteUpdated}
                    />
                ))}
            </div>
        </>
    )
}

export default Home;