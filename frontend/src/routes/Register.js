import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Register.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const setCookie = (name, value, daysToLive) => {
        const maxAge = daysToLive * 24 * 60 * 60;
        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
    }

    const getCookie = (name) => {
        const target = encodeURIComponent(name) + "=";
        const cookies = document.cookie.split("; ");
        for (const cookie of cookies) {
            if (cookie.startsWith(target)) {
                return decodeURIComponent(cookie.substring(target.length));
            }
        }
        return null;
    }

    useEffect(()=>{
        if (getCookie('user')) {
            navigate('/home')
        }
    })

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:4000/api/account/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Unable to create your account. Please try again.');
            }
            if (!result.user?.id) {
                throw new Error('Registration succeeded, but the server did not return a user ID.');
            }

            setCookie('user', result.user.id, 7);
            setSuccess('Your account has been created. You can now sign in.');
            setUsername('');
            setPassword('');
            navigate('/home');
        } catch (requestError) {
            setError(requestError.message || 'Unable to reach the server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="register-page">
            <section className="register-card" aria-labelledby="register-title">
                <div className="register-card__eyebrow">GET STARTED</div>
                <h1 id="register-title">Create your account</h1>
                <p className="register-card__description">
                    Sign up to keep your notes organized and accessible.
                </p>

                <form className="register-form" onSubmit={handleSubmit}>
                    <label htmlFor="register-username">Username</label>
                    <input
                        id="register-username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                    />

                    <label htmlFor="register-password">Password</label>
                    <input
                        id="register-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Choose a password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        minLength={8}
                        required
                    />
                    <p className="register-form__hint">Use at least 8 characters.</p>

                    {error && <p className="register-message register-message--error" role="alert">{error}</p>}
                    {success && <p className="register-message register-message--success" role="status">{success}</p>}

                    <button className="register-form__submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <p className="register-card__footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </section>
        </main>
    );
};

export default Register;