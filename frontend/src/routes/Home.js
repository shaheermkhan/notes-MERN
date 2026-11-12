import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Notes from '../components/Notes'
import NotesForm from '../components/NotesForm'
import './styles/Home.css';

function Home() {
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState('');
    const [dateOrder, setDateOrder] = useState('desc');
    const navigate = useNavigate();

    const getCookie = (name) => {
        const target = `${encodeURIComponent(name)}=`;
        const cookie = document.cookie.split('; ').find((entry) => entry.startsWith(target));
        return cookie ? decodeURIComponent(cookie.substring(target.length)) : null;
    };

    const sortedNotes = [...notes].sort((first, second) => {
        const firstDate = new Date(first.createdAt).getTime() || 0;
        const secondDate = new Date(second.createdAt).getTime() || 0;
        return dateOrder === 'asc' ? firstDate - secondDate : secondDate - firstDate;
    });

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
        const userId = getCookie('user');

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

                setNotes(json.filter((note) => String(note.user) === userId));
            } catch (requestError) {
                setError(requestError.message || 'Unable to load notes.');
            }
        };

        if (userId) {
            fetchNotes();
        } else {
            navigate('/');
        }

    }, [navigate]);

    return (
        <main className="home-page">
            <NotesForm userId={getCookie('user')} onNoteCreated={handleNoteCreated} />
            <div className="home-page__notes-toolbar">
                <label htmlFor="notes-date-order">Sort by date</label>
                <select
                    id="notes-date-order"
                    value={dateOrder}
                    onChange={(event) => setDateOrder(event.target.value)}
                >
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                </select>
            </div>
            <div className="notes">
                {error && <p role="alert">{error}</p>}
                {sortedNotes.map((note) => (
                    <Notes
                        key={note._id}
                        note={note}
                        onNoteDeleted={handleNoteDeleted}
                        onNoteUpdated={handleNoteUpdated}
                    />
                ))}
            </div>
        </main>
    )
}

export default Home;