import Lenis from "lenis";
import {
	ArrowRight,
	Globe,
	Mail,
	Menu,
	ShieldCheck,
	X,
	Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Preloader from "./components/Preloader";
import "./App.css";

function App() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [preloaderFinished, setPreloaderFinished] = useState(false);
	const lenisRef = useRef<Lenis | null>(null);

	useEffect(() => {
		// Initialize Lenis for smooth scrolling
		lenisRef.current = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)), // https://www.desmos.com/calculator/brs54l4xou
			orientation: "vertical",
			gestureOrientation: "vertical",
			autoRaf: true,
		});

		if (!preloaderFinished) {
			lenisRef.current.stop();
		}

		// Scroll event listener for navbar
		const onScroll = () => {
			setScrolled(window.scrollY > window.innerHeight - 60);
		};

		// Using Lenis's scroll event
		lenisRef.current.on("scroll", onScroll);

		// Initial scroll check
		onScroll();

		return () => {
			if (lenisRef.current) {
				lenisRef.current.off("scroll", onScroll);
				lenisRef.current.destroy();
			}
		};
	}, [preloaderFinished]);

	const handleNavClick = (id: string) => {
		setMenuOpen(false);
		// Lenis will handle the smooth scrolling
		const element = document.getElementById(id);
		if (element && lenisRef.current) {
			lenisRef.current.scrollTo(element);
		}
	};

	// Handle preloader finish
	useEffect(() => {
		if (preloaderFinished && lenisRef.current) {
			lenisRef.current.start();
		}
	}, [preloaderFinished]);

	// Prevent scrolling while preloader is active
	useEffect(() => {
		if (!preloaderFinished) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [preloaderFinished]);


	return (
		<>
			<Preloader onFinished={() => setPreloaderFinished(true)} />
			<div className="app-container">
				{/* Minimal Navbar — transparent, floating */}
			<nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
				<img src="/logo.svg" alt="Liming" className="brand-logo" />
				<button
					type="button"
					className="menu-trigger"
					onClick={() => setMenuOpen(!menuOpen)}
					aria-label="Toggle menu"
				>
					{menuOpen ? <X size={28} /> : <Menu size={28} />}
				</button>
			</nav>

			{/* Fullscreen slide-in menu */}
			<div className={`fullscreen-menu ${menuOpen ? "open" : ""}`}>
				<div className="menu-inner">
					<button
						type="button"
						className="menu-link"
						onClick={() => handleNavClick("about")}
					>
						About
					</button>
					<button
						type="button"
						className="menu-link"
						onClick={() => handleNavClick("vehicles")}
					>
						Vehicles
					</button>
					<button
						type="button"
						className="menu-link"
						onClick={() => handleNavClick("parts")}
					>
						Parts
					</button>
					<button
						type="button"
						className="menu-link"
						onClick={() => handleNavClick("global")}
					>
						Global Network
					</button>
					<button
						type="button"
						className="menu-link"
						onClick={() => handleNavClick("contact")}
					>
						Contact
					</button>
				</div>
			</div>

			<main>
				{/* Hero — full-screen immersive video with centered messaging */}
				<section className="hero">
					<video autoPlay loop muted playsInline className="hero-video-bg">
						<source src="/hero.webm" type="video/webm" />
					</video>
					<div className="hero-overlay"></div>

					<div className="hero-content">
						<p className="hero-tagline">Liming Global Export</p>
						<h1 className="hero-title">
							Exporting the Best
							<br />
							of China, Globally
						</h1>
						<p className="hero-subtitle">
							Premium cars · High-performance motorcycles · Quality parts
						</p>
						<div className="hero-actions">
							<button type="button" className="primary-btn">
								Explore <ArrowRight className="icon-ml" size={18} />
							</button>
						</div>
					</div>

					{/* Scroll indicator */}
					<div className="scroll-indicator">
						<span className="scroll-text">Scroll</span>
						<div className="scroll-line"></div>
					</div>
				</section>

				{/* Features */}
				<section className="features" id="about">
					<div className="section-label">What We Do</div>
					<div className="features-grid">
						<div className="feature-card">
							<Globe className="feature-icon" />
							<h3>Global Reach</h3>
							<p>
								We deliver excellence across borders with seamless, secure
								logistics and worldwide compliance.
							</p>
						</div>
						<div className="feature-card">
							<Zap className="feature-icon" />
							<h3>High Performance</h3>
							<p>
								Curated selection of the most advanced EV and ICE vehicles
								available on the market.
							</p>
						</div>
						<div className="feature-card">
							<ShieldCheck className="feature-icon" />
							<h3>Premium Parts</h3>
							<p>
								Authentic, high-quality OEM and aftermarket components for
								long-lasting durability.
							</p>
						</div>
					</div>
				</section>

				{/* Inventory */}
				<section className="inventory-preview" id="vehicles">
					<div className="section-label">Our Specialties</div>
					<div className="inventory-grid">
						<div className="inventory-item">
							<div className="item-image-wrapper">
								<img
									src="/car.webp"
									alt="Premium Cars"
									className="item-image"
								/>
							</div>
							<div className="item-content">
								<h3>Premium Cars</h3>
								<p>Next-generation electric and luxury vehicles.</p>
							</div>
						</div>
						<div className="inventory-item">
							<div className="item-image-wrapper">
								<img
									src="/motorcycle.webp"
									alt="Motorcycles"
									className="item-image"
								/>
							</div>
							<div className="item-content">
								<h3>Motorcycles</h3>
								<p>High-performance bikes for every terrain.</p>
							</div>
						</div>
						<div className="inventory-item" id="parts">
							<div className="item-image-wrapper">
								<img
									src="/parts.webp"
									alt="Parts & Accessories"
									className="item-image"
								/>
							</div>
							<div className="item-content">
								<h3>Parts &amp; Accessories</h3>
								<p>Quality guaranteed replacement components.</p>
							</div>
						</div>
					</div>
				</section>
			</main>

			<footer className="footer" id="contact">
				<div className="footer-content">
					<div className="footer-logo-container">
						<img src="/logo.svg" alt="Liming" className="footer-logo" />
						<div className="footer-logo-text">Liming Global Export</div>
					</div>

					<div className="footer-section">
						<h4>Company</h4>
						<button
							type="button"
							className="footer-link"
							onClick={() => handleNavClick("about")}
						>
							About
						</button>
						<button
							type="button"
							className="footer-link"
							onClick={() => handleNavClick("vehicles")}
						>
							Vehicles
						</button>
						<button
							type="button"
							className="footer-link"
							onClick={() => handleNavClick("parts")}
						>
							Parts &amp; Accessories
						</button>
						<button
							type="button"
							className="footer-link"
							onClick={() => handleNavClick("contact")}
						>
							Contact
						</button>
					</div>

					<div className="footer-section">
						<h4>Follow Us</h4>
						<div className="footer-social">
							<a
								href="https://www.instagram.com/liming_chinasourcing/"
								target="_blank"
								rel="noopener noreferrer"
								className="social-link"
								aria-label="Instagram"
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
								>
									<title>Instagram icon</title>
									<rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
									<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
									<line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
								</svg>
								<span className="sr-only">Instagram</span>
							</a>
							<a
								href="mailto:yang@limingcn.com"
								className="social-link"
								aria-label="Email"
							>
								<Mail size={20} aria-hidden="true" />
								<span className="sr-only">Email</span>
							</a>
							<a
								href="https://www.limingcn.com"
								target="_blank"
								rel="noopener noreferrer"
								className="social-link"
								aria-label="Website"
							>
								<Globe size={20} aria-hidden="true" />
								<span className="sr-only">Website</span>
							</a>
						</div>
					</div>
				</div>
				<div className="footer-bottom">
					© {new Date().getFullYear()} Liming Global Export
				</div>
			</footer>
		</div>
		</>
	);
}

export default App;
