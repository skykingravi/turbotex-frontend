import "./styles/style.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Home } from "./pages/home.js";
import { Auth } from "./pages/auth.js";
import { Navbar } from "./components/navbar.js";
import NotFound from "./pages/notFound.js";
import Dashboard from "./pages/dashboard.js";
import { Templates } from "./pages/Templates.js";
import IDE from "./pages/ide.js";
import { Contact } from "./pages/contact.js";
import { About } from "./pages/about.js";

function App() {
    const [cookies] = useCookies(["access_token"]);

    return (
        <>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    {cookies.access_token && (
                        <Route path="/dashboard" element={<Dashboard />} />
                    )}
                    {cookies.access_token && (
                        <Route path="/document/:id" element={<IDE />} />
                    )}
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
