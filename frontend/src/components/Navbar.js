import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './styles/Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const handleSignOut = () => {
        document.cookie = 'user=; max-age=0; path=/; SameSite=Lax';
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        const userCookie = document.cookie
            .split('; ')
            .find((cookie) => cookie.startsWith('user='));
        const userId = userCookie ? decodeURIComponent(userCookie.substring(5)) : '';

        if (!userId) {
            setDeleteError('Your session was not found. Please sign in again.');
            return;
        }

        setIsDeleting(true);
        setDeleteError('');

        try {
            const response = await fetch(`http://localhost:4000/api/account/${encodeURIComponent(userId)}`, {
                method: 'DELETE',
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Unable to delete your account. Please try again.');
            }

            document.cookie = 'user=; max-age=0; path=/; SameSite=Lax';
            setIsDeleteDialogOpen(false)
            navigate('/');
        } catch (requestError) {
            setDeleteError(requestError.message || 'Unable to reach the server. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <header className="navbar">
            <Link className="navbar__brand" to="/" aria-label="Notes home">
                <span className="navbar__brand-mark" aria-hidden="true">N</span>
                <span>Notes</span>
            </Link>
            {location.pathname === '/home' && (
                <nav className="navbar__actions" aria-label="Account actions">
                    <button className="navbar__sign-out" type="button" onClick={handleSignOut}>
                        Sign out
                    </button>
                    <button
                        className="navbar__delete"
                        type="button"
                        onClick={() => {
                            setDeleteError('');
                            setIsDeleteDialogOpen(true);
                        }}
                    >
                        Delete account
                    </button>
                </nav>
            )}
            {isDeleteDialogOpen && (
                <div
                    className="delete-account__backdrop"
                    onClick={(event) => {
                        if (event.target === event.currentTarget && !isDeleting) {
                            setIsDeleteDialogOpen(false);
                        }
                    }}
                >
                    <section
                        className="delete-account__dialog"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-account-title"
                        aria-describedby="delete-account-description"
                    >
                        <h2 id="delete-account-title">Delete your account?</h2>
                        <p id="delete-account-description">
                            This permanently deletes your account and all of its notes. This action cannot be undone.
                        </p>
                        {deleteError && <p className="delete-account__error" role="alert">{deleteError}</p>}
                        <div className="delete-account__actions">
                            <button
                                className="delete-account__cancel"
                                type="button"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="delete-account__confirm"
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting…' : 'Delete account'}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </header>
    );
};

export default Navbar;