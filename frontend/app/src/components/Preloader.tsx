import gsap from "gsap";
import { type FC, useEffect, useRef } from "react";
import MobileLogo from "./logo/MobileLogo";
import YourLogo from "./logo/YourLogo";
import "./Preloader.css";

// Animation constants
const DURATION = {
	LOGO_REVEAL: 1,
	LOGO_SLIDE: 0.4,
	COPYRIGHT_FADE: 0.6,
	COLUMN_SLIDE: 0.6,
};

const EASE = {
	LOGO_REVEAL: "circ.inOut",
	LOGO_SLIDE: "circ.in",
	COPYRIGHT_FADE: "circ.inOut",
	COLUMN_SLIDE: "circ.inOut",
};

const COLUMNS_CONFIG = [
	{ id: "col-1", visibleMobile: true },
	{ id: "col-2", visibleMobile: true },
	{ id: "col-3", visibleMobile: false },
	{ id: "col-4", visibleMobile: false },
];

interface PreloaderProps {
	onFinished?: () => void;
}

/**
 * A modern, production-ready preloader component replicated from solid-start.
 * Now matching the source logic: plays on every load/refresh.
 */
const Preloader: FC<PreloaderProps> = ({ onFinished }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const logoContainerRef = useRef<HTMLDivElement>(null);
	const copyrightRef = useRef<HTMLDivElement>(null);

	// Use Ref to keep callback reference stable
	const onFinishedRef = useRef(onFinished);
	onFinishedRef.current = onFinished;

	useEffect(() => {
		if (typeof window === "undefined" || !containerRef.current) return;

		const ctx = gsap.context(() => {
			// Select elements within the context of containerRef
			const columns = gsap.utils.toArray<HTMLDivElement>(".column");
			const columns2 = gsap.utils.toArray<HTMLDivElement>(".column2");
			const grayLogo =
				logoContainerRef.current?.querySelector<SVGSVGElement>(
					"svg:first-child",
				);
			const whiteLogo =
				logoContainerRef.current?.querySelector<SVGSVGElement>(
					"svg:last-child",
				);

			if (
				!whiteLogo ||
				!grayLogo ||
				columns.length === 0 ||
				columns2.length === 0 ||
				!copyrightRef.current
			) {
				console.warn("Preloader: Animation targets not found, skipping.");
				onFinishedRef.current?.();
				return;
			}

			let hasTriggeredReveal = false;
			const targets =
				".hero-tagline, .hero-title, .hero-subtitle, .hero-actions, .scroll-indicator";

			// GSAP Timeline
			const tl = gsap.timeline({
				onComplete: () => {
					gsap.set([...columns, ...columns2], { display: "none" });

					// Final cleanup: ensure hero content is revealed even if update missed it
					gsap.set(targets, {
						y: 0,
						opacity: (i) => [0.7, 1, 0.75, 1, 1][i],
						visibility: "visible",
					});

					onFinishedRef.current?.();
				},
			});

			// Animation Sequence
			tl.add(animateLogoReveal(whiteLogo))
				.add(animateLogoSlide(grayLogo, whiteLogo), "-=0.2")
				.add(animateCopyright(copyrightRef.current), "<")
				.add(
					animateColumns(columns, { y: "-100vh", rotate: -6, stagger: 0.03 }),
					"<0.2",
				)
				.add(
					animateColumns(columns2, {
						y: "-100vh",
						rotate: 6,
						stagger: 0.03,
						onStart: () => {
							// Prepare hero elements for reveal
							gsap.set(targets, {
								y: 50,
								opacity: 0,
								visibility: "visible",
							});
						},
						onUpdate: () => {
							if (hasTriggeredReveal) return;

							const heroContent = document.querySelector(".hero-content");
							if (heroContent) {
								const rect = heroContent.getBoundingClientRect();
								let maxBottom = 0;
								columns2.forEach((col) => {
									const colRect = col.getBoundingClientRect();
									if (colRect.bottom > maxBottom) maxBottom = colRect.bottom;
								});

								// When columns move up past the top of the hero content, trigger staggered reveal
								if (maxBottom < rect.top + 200) {
									hasTriggeredReveal = true;
									gsap.to(".hero-tagline", {
										y: 0,
										opacity: 0.7,
										duration: 1,
										ease: "power3.out",
									});
									gsap.to(".hero-title", {
										y: 0,
										opacity: 1,
										duration: 1,
										ease: "power3.out",
										delay: 0.15,
									});
									gsap.to(".hero-subtitle", {
										y: 0,
										opacity: 0.75,
										duration: 1,
										ease: "power3.out",
										delay: 0.3,
									});
									gsap.to(".hero-actions", {
										y: 0,
										opacity: 1,
										duration: 1,
										ease: "power3.out",
										delay: 0.45,
									});
									gsap.to(".scroll-indicator", {
										y: 0,
										opacity: 1,
										duration: 1,
										ease: "power3.out",
										delay: 0.6,
									});
								}
							}
						},
					}),
					">-0.4",
				);
		}, containerRef);

		return () => ctx.revert();
	}, []); // Empty dependency array as all referenced functions are now stable/outside

	return (
		<div
			ref={containerRef}
			className="preloader-root"
			aria-live="polite"
			aria-busy="true"
		>
			{/* Background columns - First layer */}
			<div className="loading-container">
				{COLUMNS_CONFIG.map((config) => (
					<div
						key={config.id}
						className={`column loading-screen ${
							config.visibleMobile ? "" : "last"
						}`}
					/>
				))}

				<div ref={logoContainerRef} className="logo">
					<YourLogo className="h-auto w-full text-gray/25" />
					<YourLogo className="h-auto w-full text-gray absolute invisible" />
				</div>

				<div ref={copyrightRef} className="copyright-row">
					<div className="liming-copyright">
						<MobileLogo className="brand-mark" />
						<div className="brand-identity">
							<span className="brand-part">LIMING</span>
							<div className="brand-separator" />
							<span className="brand-part">GLOBAL EXPORT</span>
						</div>
						<div className="brand-footer">
							<span className="footer-item">2026 © ALL RIGHTS RESERVED</span>
							<span className="footer-divider">/</span>
							<span className="footer-item">
								PREMIUM VEHICLE EXPORTS FROM CHINA
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Transition columns - Second layer that reveals the page */}
			<div className="transition-container">
				{COLUMNS_CONFIG.map((config) => (
					<div
						key={`transition-${config.id}`}
						className={`column2 transition-screen ${
							config.visibleMobile ? "" : "last"
						}`}
					/>
				))}
			</div>
		</div>
	);
};

// --- Animation Helpers (Moved outside to ensure stable references) ---

const animateLogoReveal = (target: SVGSVGElement) => {
	gsap.set(target, { clipPath: "inset(0 100% 0 0)", visibility: "visible" });
	return gsap.to(target, {
		clipPath: "inset(0 0% 0 0)",
		duration: DURATION.LOGO_REVEAL,
		ease: EASE.LOGO_REVEAL,
	});
};

const animateLogoSlide = (target1: SVGSVGElement, target2: SVGSVGElement) => {
	return gsap.to([target1, target2], {
		rotation: 2,
		transformOrigin: "100% 100%",
		y: "-100%",
		duration: DURATION.LOGO_SLIDE,
		ease: EASE.LOGO_SLIDE,
	});
};

const animateCopyright = (target: HTMLDivElement) => {
	return gsap.to(target, {
		scale: 0.9,
		opacity: 0,
		duration: DURATION.COPYRIGHT_FADE,
		ease: EASE.COPYRIGHT_FADE,
	});
};

const animateColumns = (targets: HTMLDivElement[], vars: gsap.TweenVars) => {
	const { y, rotate, stagger, onUpdate, onStart } = vars;
	const isFirstSet = rotate === -6;

	gsap.set(targets, {
		scaleX: 1.1,
		scaleY: 1.05,
		transformOrigin: isFirstSet ? "0% 100%" : "100% 100%",
	});

	return gsap.to(targets, {
		y,
		rotate,
		duration: DURATION.COLUMN_SLIDE,
		ease: EASE.COLUMN_SLIDE,
		stagger,
		onUpdate,
		onStart,
	});
};

export default Preloader;
