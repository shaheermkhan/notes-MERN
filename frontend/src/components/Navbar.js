import { Link } from 'react-router-dom';
import './styles/Navbar.css';

const Navbar = () => {
    return (
        <header className="navbar">
            <Link className="navbar__brand" to="/" aria-label="Notes home">
                <span className="navbar__brand-mark" aria-hidden="true">N</span>
                <span>Notes</span>
            </Link>
        </header>
    );
};

export default Navbar;