import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const setCookie = (name, value, daysToLive) => {
        const maxAge = daysToLive * 24 * 60 * 60;
        document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
    };

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

    useEffect(() => {
        if (getCookie('user')) {
            navigate('/home')
        }
    })

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:4000/api/account/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Unable to sign in. Please try again.');
            }
            if (!result.user?.id) {
                throw new Error('Sign-in succeeded, but the server did not return a user ID.');
            }

            setCookie('user', result.user.id, 7);
            navigate('/home');
        } catch (requestError) {
            setError(requestError.message || 'Unable to reach the server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="login-page">
            <section className="login-card" aria-labelledby="login-title">
                <div className="login-card__eyebrow">WELCOME BACK</div>
                <h1 id="login-title">Sign in to Notes</h1>
                <p className="login-card__description">
                    Enter your account details to continue to your notes.
                </p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="login-username">Username</label>
                    <input
                        id="login-username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        placeholder="Your username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                    />

                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />

                    {error && <p className="login-message" role="alert">{error}</p>}

                    <button className="login-form__submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <p className="login-card__footer">
                    Don’t have an account? <Link to="/">Create one</Link>
                </p>
            </section>
        </main>
    );
};

export default Login;