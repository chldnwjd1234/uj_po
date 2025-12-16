console.log('Script loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    window.scrollTo(0, 0);
    document.body.classList.add('scroll_locked');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    create_stars();
    setup_custom_cursor();
    setup_svg_spotlight();
    setup_scroll_effects();
    setup_works_transition();
    setup_project_slider();
    setup_about_animations();
    setup_contact_transition();
    setup_contact_icons(); // ✅ Contact 아이콘 추가
});

function create_stars() {
    const stars_containers = document.querySelectorAll('.stars_container');

    stars_containers.forEach((container, index) => {
        let star_count;
        if (index === 0) {
            star_count = 15; // Hero
        } else if (index === 3) {
            // Contact 섹션 (4번째) - 별을 더 많이
            star_count = 40;
        } else {
            star_count = 10 + (20 * index);
            star_count = Math.min(star_count, 85);
        }

        for (let i = 0; i < star_count; i++) {
            const star = document.createElement('div');
            star.className = 'star';

            let x = Math.random() * 100;
            let y = Math.random() * 100;

            if (index === 0) {
                if (Math.random() < 0.5) {
                    x = Math.random() * 30;
                    y = Math.random() * 40;
                } else {
                    x = 70 + Math.random() * 30;
                    y = Math.random() * 50;
                }
            }

            const size = Math.random() * 2.5 + 0.8;
            const delay = Math.random() * 3;

            star.style.left = `${x}%`;
            star.style.top = `${y}%`;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.animationDelay = `${delay}s`;

            container.appendChild(star);
        }
    });
}

function setup_custom_cursor() {
    const cursor = document.querySelector('.custom_cursor');
    if (!cursor) return;

    document.addEventListener('mousemove', (e) => {
        if (typeof gsap !== 'undefined') {
            gsap.to(cursor, {
                duration: 0.3,
                left: e.clientX,
                top: e.clientY,
                ease: "power2.out"
            });
        }
    });

    document.querySelectorAll('a, button, .contact_link, .project_btn, .slide_dot').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

function setup_svg_spotlight() {
    const spotlight = document.getElementById('spotlight_circle');
    const light = document.querySelector('.mouse_light');
    const hero = document.querySelector('.hero_section');

    if (!spotlight || !light || !hero) return;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    spotlight.setAttribute('cx', centerX);
    spotlight.setAttribute('cy', centerY);
    light.style.left = `${centerX}px`;
    light.style.top = `${centerY}px`;

    hero.addEventListener('mousemove', (e) => {
        if (typeof gsap !== 'undefined') {
            const animationProps = {
                duration: 0.5,
                ease: "power2.out"
            };

            gsap.to(spotlight, {
                ...animationProps,
                attr: { cx: e.clientX, cy: e.clientY }
            });

            gsap.to(light, {
                ...animationProps,
                left: e.clientX,
                top: e.clientY
            });
        }
    });
}

function setup_scroll_effects() {
    const indicator = document.querySelector('.scroll_indicator');
    const cursor = document.querySelector('.custom_cursor');
    const light = document.querySelector('.mouse_light');
    const spotlight = document.getElementById('spotlight_circle');
    const heroSection = document.querySelector('.hero_section');
    let revealed = false;

    window.addEventListener('wheel', (e) => {
        if (revealed || !spotlight) return;

        if (e.deltaY > 0) {
            revealed = true;
            document.body.classList.remove('scroll_locked');

            if (cursor) cursor.classList.add('small');
            if (light) light.classList.add('small');

            if (typeof gsap !== 'undefined') {
                const tl = gsap.timeline({
                    onComplete: () => {
                        if (indicator) indicator.style.display = 'none';
                    }
                });

                tl.to(spotlight, {
                    duration: 2,
                    attr: { r: 5200 },
                    ease: "power3.out"
                }).to(indicator, {
                    duration: 2,
                    opacity: 0,
                    ease: "power2.out"
                }, 0);
            }
        }
    }, { passive: true });

    // Hero 섹션을 벗어나면 mouse_light 숨기고 커서는 정상 크기로
    if (heroSection && cursor && light) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    // Hero 섹션을 벗어남 - mouse_light 완전히 숨김
                    cursor.classList.remove('small');
                    light.style.display = 'none';
                } else if (revealed) {
                    // Hero 섹션으로 돌아옴 - mouse_light 다시 표시
                    light.style.display = 'block';
                }
            });
        }, { threshold: 0.1 });

        observer.observe(heroSection);
    }
}

function setup_works_transition() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const worksSection = document.querySelector('.works_section');
    const worksTitle = document.querySelector('.works_section .section_title');
    const lightOverlay = document.querySelector('.light_overlay');
    const worksContent = document.querySelector('.works_content');

    if (!worksSection || !worksTitle || !lightOverlay || !worksContent) return;

    // Works 진입 시 nav active 변경
    ScrollTrigger.create({
        trigger: worksSection,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            document.querySelector('nav a[href="#works"]')?.classList.add('active');
        },
        onLeaveBack: () => {
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            document.querySelector('nav .home_dot')?.classList.add('active');
        }
    });

    // 4단계 전환: gsap.set으로 즉시 적용
    ScrollTrigger.create({
        trigger: worksSection,
        start: "top top",
        end: "+=500vh",
        pin: true,
        scrub: 3,
        onUpdate: (self) => {
            const progress = self.progress;

            // === 1단계: Works 타이틀 등장 및 유지 (0% ~ 20%) ===
            if (progress < 0.20) {
                const titleProgress = Math.min(progress / 0.12, 1);

                gsap.set(worksTitle, { opacity: titleProgress });
                gsap.set(lightOverlay, {
                    opacity: 0,
                    width: '0px',
                    height: '0px',
                    display: 'none'
                });
                gsap.set(worksContent, { opacity: 0 });
            }

            // === 2단계: 빛이 점차 밝아짐 (20% ~ 50%) ===
            else if (progress >= 0.20 && progress < 0.50) {
                const lightProgress = (progress - 0.20) / 0.30;

                // 타이틀은 30% 지점까지만 유지
                let titleOpacity;
                if (progress < 0.30) {
                    titleOpacity = 1;
                } else {
                    titleOpacity = 1 - ((progress - 0.30) / 0.15);
                }

                gsap.set(worksTitle, { opacity: titleOpacity });

                // 빛이 점점 커지고 밝아짐
                const maxSize = Math.max(window.innerWidth, window.innerHeight) * 3.5;
                const currentSize = maxSize * lightProgress;

                // sine easing으로 부드럽게
                const easedProgress = Math.sin((lightProgress * Math.PI) / 2);

                gsap.set(lightOverlay, {
                    opacity: easedProgress * 0.45,
                    width: `${currentSize}px`,
                    height: `${currentSize}px`,
                    display: 'block'
                });

                gsap.set(worksContent, { opacity: 0 });
            }

            // === 3단계: 빛이 천천히 사라짐 (50% ~ 75%) ===
            else if (progress >= 0.50 && progress < 0.75) {
                gsap.set(worksTitle, { opacity: 0 });

                // 빛이 천천히 사라짐
                const lightFade = (progress - 0.50) / 0.25;
                const easedFade = 1 - Math.sin((lightFade * Math.PI) / 2);

                gsap.set(lightOverlay, {
                    opacity: 0.45 * easedFade,
                    width: `${Math.max(window.innerWidth, window.innerHeight) * 3.5}px`,
                    height: `${Math.max(window.innerWidth, window.innerHeight) * 3.5}px`,
                    display: 'block'
                });

                gsap.set(worksContent, { opacity: 0 });
            }

            // === 4단계: 프로젝트 즉시 등장 (75% ~ 100%) ===
            else if (progress >= 0.75) {
                gsap.set(worksTitle, { opacity: 0 });

                // 빛을 완전히 제거
                gsap.set(lightOverlay, {
                    opacity: 0,
                    width: '0px',
                    height: '0px',
                    display: 'none',
                    visibility: 'hidden',
                    pointerEvents: 'none'
                });

                // ✅ 프로젝트 즉시 밝게 표시
                gsap.set(worksContent, {
                    opacity: 1,
                    filter: 'brightness(1) contrast(1)',
                    clearProps: 'filter'
                });
            }
        }
    });
}

function setup_project_slider() {
    const slides = document.querySelectorAll('.project_slide');
    const dots = document.querySelectorAll('.slide_dot');
    const currentCounter = document.querySelector('.slide_counter .current');

    const worksSection = document.querySelector('.works_section');
    const worksContent = document.querySelector('.works_content');

    let currentIndex = 0;

    // 휠 설정
    let wheelLock = false;
    let wheelAcc = 0;
    const WHEEL_THRESHOLD = 50;
    const WHEEL_COOLDOWN = 400;

    // GSAP 전환 설정
    let isAnimating = false;

    function updateCounter(index) {
        if (currentCounter) currentCounter.textContent = String(index + 1).padStart(2, '0');
    }

    // 부드러운 슬라이드 전환
    function showSlide(index, dir = 1) {
        if (isAnimating) return;
        if (index === currentIndex) return;

        const prev = slides[currentIndex];
        const next = slides[index];

        isAnimating = true;

        // dots/카운터 즉시 업데이트
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index]?.classList.add('active');
        updateCounter(index);

        // ✅ 모든 슬라이드를 먼저 숨김 (전환할 두 개 제외)
        slides.forEach(slide => {
            if (slide !== prev && slide !== next) {
                slide.classList.remove('active');
            }
        });

        // 다음 슬라이드 준비
        next.classList.add('active');
        gsap.set(next, {
            opacity: 0,
            xPercent: dir > 0 ? 5 : -5
        });

        const tl = gsap.timeline({
            defaults: { duration: 0.5, ease: "power2.out" },
            onComplete: () => {
                // 이전 슬라이드 제거
                prev.classList.remove('active');

                currentIndex = index;
                isAnimating = false;
            }
        });

        // 부드러운 페이드 전환
        tl.to(prev, { opacity: 0, xPercent: dir > 0 ? -5 : 5 }, 0)
            .to(next, { opacity: 1, xPercent: 0 }, 0);
    }

    function nextSlide() {
        const next = (currentIndex + 1) % slides.length;
        showSlide(next, +1);
    }

    function prevSlide() {
        const prev = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(prev, -1);
    }

    // Works 섹션이 활성화되어 있는지 확인
    function isWorksActive() {
        if (!worksSection) return false;

        const rect = worksSection.getBoundingClientRect();
        const inView = rect.top <= 0 && rect.bottom >= window.innerHeight;

        const contentVisible = worksContent
            ? parseFloat(getComputedStyle(worksContent).opacity || '0') > 0.5
            : true;

        return inView && contentVisible;
    }

    // 휠 이벤트
    function onWheel(e) {
        if (!isWorksActive()) return;
        if (isAnimating) {
            e.preventDefault();
            return;
        }

        const goingDown = e.deltaY > 0;
        const atFirst = currentIndex === 0;
        const atLast = currentIndex === slides.length - 1;

        const shouldIntercept = (goingDown && !atLast) || (!goingDown && !atFirst);

        if (!shouldIntercept) return;

        e.preventDefault();

        if (wheelLock) return;

        wheelAcc += e.deltaY;

        if (Math.abs(wheelAcc) < WHEEL_THRESHOLD) return;

        wheelLock = true;

        if (wheelAcc > 0) nextSlide();
        else prevSlide();

        wheelAcc = 0;

        setTimeout(() => {
            wheelLock = false;
        }, WHEEL_COOLDOWN);
    }

    // ✅ 키보드 이벤트 추가
    function onKeyDown(e) {
        if (!isWorksActive()) return;
        if (isAnimating) return;

        // 화살표 키로 슬라이드 이동
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            nextSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            prevSlide();
        }
        // 숫자 키로 직접 이동
        else if (e.key >= '1' && e.key <= '4') {
            e.preventDefault();
            const targetIndex = parseInt(e.key) - 1;
            if (targetIndex < slides.length) {
                const dir = targetIndex > currentIndex ? +1 : -1;
                showSlide(targetIndex, dir);
            }
        }
    }

    // dot 클릭
    dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isAnimating) return;
            const dir = index > currentIndex ? +1 : -1;
            showSlide(index, dir);
        });
    });

    // ✅ 모든 버튼 링크가 정상 작동하도록 이벤트 전파 방지
    document.querySelectorAll('.project_btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // 슬라이드 이벤트 방지
            // 링크는 자동으로 작동
        });
    });

    // 이벤트 등록
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);

    // 기본 커서 스타일
    if (worksContent) {
        worksContent.style.cursor = 'default';
    }

    // 초기 상태 세팅
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    slides[0]?.classList.add('active');
    dots[0]?.classList.add('active');
    updateCounter(0);
}

function setup_about_animations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const aboutSection = document.querySelector('.about_section');
    const aboutTitle = document.querySelector('.about_section .section_title');
    const lightOverlay = document.querySelector('.about_section .light_overlay');
    const aboutContent = document.querySelector('.about_content');
    const keywordCards = document.querySelectorAll('.keyword_card');

    if (!aboutSection || !aboutTitle || !lightOverlay) return;

    // Nav active 변경
    ScrollTrigger.create({
        trigger: aboutSection,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            document.querySelector('nav a[href="#about"]')?.classList.add('active');
        },
        onLeaveBack: () => {
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            document.querySelector('nav a[href="#works"]')?.classList.add('active');
        }
    });

    // 3D 애니메이션 - 카드 하나씩 천천히 등장
    ScrollTrigger.create({
        trigger: aboutSection,
        start: "top top",
        end: "+=1000vh",
        pin: true,
        scrub: 4,
        onUpdate: (self) => {
            const progress = self.progress;

            // 1단계: ABOUT 타이틀 등장 (0% ~ 18%)
            if (progress < 0.18) {
                const titleProgress = Math.min(progress / 0.10, 1);
                gsap.set(aboutTitle, { opacity: titleProgress });
                gsap.set(lightOverlay, { opacity: 0, width: '0px', height: '0px' });
                if (aboutContent) gsap.set(aboutContent, { opacity: 0 });
            }

            // 2단계: 빛 확산 (18% ~ 40%)
            else if (progress >= 0.18 && progress < 0.40) {
                const lightProgress = (progress - 0.18) / 0.22;
                let titleOpacity = progress < 0.28 ? 1 : 1 - ((progress - 0.28) / 0.12);

                gsap.set(aboutTitle, { opacity: titleOpacity });

                const maxSize = Math.max(window.innerWidth, window.innerHeight) * 3.5;
                const easedProgress = Math.sin((lightProgress * Math.PI) / 2);

                gsap.set(lightOverlay, {
                    opacity: easedProgress * 0.45,
                    width: `${maxSize * lightProgress}px`,
                    height: `${maxSize * lightProgress}px`
                });
                if (aboutContent) gsap.set(aboutContent, { opacity: 0 });
            }

            // 3단계: 빛 천천히 소멸 (40% ~ 55%)
            else if (progress >= 0.40 && progress < 0.55) {
                gsap.set(aboutTitle, { opacity: 0 });

                const lightFade = (progress - 0.40) / 0.15;
                const easedFade = 1 - Math.sin((lightFade * Math.PI) / 2);

                gsap.set(lightOverlay, {
                    opacity: 0.45 * easedFade,
                    width: `${Math.max(window.innerWidth, window.innerHeight) * 3.5}px`,
                    height: `${Math.max(window.innerWidth, window.innerHeight) * 3.5}px`
                });
                if (aboutContent) gsap.set(aboutContent, { opacity: 0 });
            }

            // 4단계: Keywords 타이틀 (55% ~ 58%)
            else if (progress >= 0.55 && progress < 0.58) {
                gsap.set(aboutTitle, { opacity: 0 });
                gsap.set(lightOverlay, { opacity: 0 });

                const keywordsSubtitle = document.querySelector('.keywords_subtitle');
                const titleProgress = (progress - 0.55) / 0.03;
                const easedTitle = Math.sin((titleProgress * Math.PI) / 2);

                if (aboutContent) gsap.set(aboutContent, { opacity: 1 });
                if (keywordsSubtitle) gsap.set(keywordsSubtitle, { opacity: easedTitle });

                keywordCards.forEach(card => {
                    gsap.set(card, { opacity: 0, scale: 0.15, rotationY: -200, z: -700 });
                });
            }

            // 5단계: 카드 하나씩 순차적으로 천천히 등장 (58% ~ 100%)
            else if (progress >= 0.58) {
                gsap.set(aboutTitle, { opacity: 0 });
                gsap.set(lightOverlay, { opacity: 0 });
                if (aboutContent) gsap.set(aboutContent, { opacity: 1 });

                const keywordsSubtitle = document.querySelector('.keywords_subtitle');
                if (keywordsSubtitle) gsap.set(keywordsSubtitle, { opacity: 1 });

                const cardProgress = (progress - 0.58) / 0.42;

                keywordCards.forEach((card, index) => {
                    const cardStart = index * 0.20;
                    const cardDuration = 0.22;

                    if (cardProgress < cardStart) {
                        gsap.set(card, {
                            opacity: 0,
                            scale: 0.15,
                            rotationY: -200,
                            z: -700
                        });
                    } else if (cardProgress < cardStart + cardDuration) {
                        const cardAnim = (cardProgress - cardStart) / cardDuration;
                        const eased = cardAnim * cardAnim * (3 - 2 * cardAnim);

                        gsap.set(card, {
                            opacity: eased,
                            scale: 0.15 + (eased * 0.85),
                            rotationY: -200 + (eased * 200),
                            z: -700 + (eased * 700)
                        });
                    } else {
                        gsap.set(card, {
                            opacity: 1,
                            scale: 1,
                            rotationY: 0,
                            z: 0
                        });
                    }
                });
            }
        }
    });

    setupKeywordCards();
}

function setupKeywordCards() {
    const cards = document.querySelectorAll('.keyword_card');
    if (cards.length === 0) return;

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { scale: 1.2, duration: 0.4, ease: "power2.out" });
            card.classList.add('active');
            cards.forEach(c => { if (c !== card) c.classList.remove('active'); });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, { scale: 1, duration: 0.4, ease: "power2.out" });
            card.classList.remove('active');
        });

        card.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.toggle('active');
            gsap.to(card, {
                scale: card.classList.contains('active') ? 1.3 : 1,
                duration: 0.4,
                ease: card.classList.contains('active') ? "back.out(1.4)" : "power2.out"
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.keyword_card')) {
            cards.forEach(card => {
                card.classList.remove('active');
                gsap.to(card, { scale: 1, duration: 0.4, ease: "power2.out" });
            });
        }
    });
}

// ========== About Me to Contact 전환 애니메이션 ==========
function setup_contact_transition() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const aboutmeSection = document.querySelector('.aboutme_section');
    const contactSection = document.querySelector('.contact_section');
    const contactContent = document.querySelector('.contact_content');
    const cityBg = document.querySelector('.contact_section .city_background');

    if (!aboutmeSection || !contactSection) {
        console.log('Missing elements for contact transition');
        return;
    }

    // Contact 진입 시 nav active 변경
    ScrollTrigger.create({
        trigger: contactSection,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            document.querySelector('nav a[href="#contact"]')?.classList.add('active');
        },
        onLeaveBack: () => {
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            document.querySelector('nav a[href="#about"]')?.classList.add('active');
        }
    });

    // Contact 섹션 fade in 효과
    ScrollTrigger.create({
        trigger: contactSection,
        start: "top 50%", // ✅ 화면 중앙에 도달했을 때 시작
        onEnter: () => {
            contactSection.classList.add('visible');
            if (cityBg) {
                gsap.to(cityBg, {
                    opacity: 0.25,
                    duration: 2,
                    ease: "power2.out"
                });
            }
        },
        onLeaveBack: () => {
            contactSection.classList.remove('visible');
            if (cityBg) {
                gsap.to(cityBg, {
                    opacity: 0,
                    duration: 0.5
                });
            }
        }
    });
}

// ========== Contact 아이콘 떨어지기 ==========
function setup_contact_icons() {
    const contactSection = document.querySelector('.contact_section');
    if (!contactSection) return;

    let iconsStarted = false;

    // Contact 섹션이 visible 클래스를 받으면 2초 후 아이콘 시작
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                if (contactSection.classList.contains('visible') && !iconsStarted) {
                    iconsStarted = true;
                    // 2초 후 아이콘 떨어지기 시작 (타이틀 애니메이션 완료 후)
                    setTimeout(() => {
                        createContactIcons();
                    }, 2000);
                }
            }
        });
    });

    observer.observe(contactSection, { attributes: true });
}

function createContactIcons() {
    const contactSection = document.querySelector('.contact_section');
    if (!contactSection) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '5';
    canvas.style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))';

    contactSection.appendChild(canvas);

    const iconPaths = [];
    for (let i = 1; i <= 17; i++) {
        iconPaths.push(`./asset/img/sk${i}.png`);
    }

    const objects = [];
    let imagesLoaded = 0;
    const gravity = 0.8; // ✅ 0.4 → 0.8 (2배 더 빠르게!)
    const bounce = 0.6; // ✅ 0.5 → 0.6 (더 통통 튀게)
    const friction = 0.96; // ✅ 0.97 → 0.96

    // 아이콘 로드
    iconPaths.forEach((path, index) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === iconPaths.length) {
                startFalling();
            }
        };
        img.onerror = () => {
            imagesLoaded++;
            if (imagesLoaded === iconPaths.length) {
                startFalling();
            }
        };

        const size = 40 + Math.random() * 25;
        objects.push({
            type: 'icon',
            img: img,
            x: Math.random() * canvas.width,
            y: -100 - (index * 30), // ✅ 간격 더 좁힘
            size: size,
            velocityX: (Math.random() - 0.5) * 3, // ✅ 2 → 3 (좌우 속도 증가)
            velocityY: Math.random() * 4 + 3, // ✅ 3~7 속도로 빠르게 시작!
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.15, // ✅ 0.12 → 0.15
            opacity: 0.8 + Math.random() * 0.2
        });
    });

    // Orb 추가 (더 적게)
    const orbCount = 15;
    for (let i = 0; i < orbCount; i++) {
        const size = 50 + Math.random() * 40;
        objects.push({
            type: 'orb',
            x: Math.random() * canvas.width,
            y: -100 - (i * 25), // ✅ 간격 더 좁힘
            size: size,
            velocityX: (Math.random() - 0.5) * 3, // ✅ 2 → 3
            velocityY: Math.random() * 4 + 3, // ✅ 3~7 속도로 빠르게!
            opacity: 0.4 + Math.random() * 0.3,
            twinklePhase: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.04 + Math.random() * 0.04 // ✅ 0.03 → 0.04
        });
    }

    function drawOrb(ctx, orb) {
        orb.twinklePhase += orb.twinkleSpeed;
        const twinkle = Math.sin(orb.twinklePhase) * 0.25 + 0.75;

        ctx.save();
        ctx.globalAlpha = orb.opacity * twinkle;

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.size / 2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.size / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function startFalling() {
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            objects.forEach((obj) => {
                // 물리 계산
                obj.velocityY += gravity;
                obj.velocityX *= friction;
                obj.velocityY *= friction;

                obj.x += obj.velocityX;
                obj.y += obj.velocityY;

                if (obj.type === 'icon') {
                    obj.rotation += obj.rotationSpeed;
                }

                // 바닥 충돌
                if (obj.y + obj.size / 2 > canvas.height) {
                    obj.y = canvas.height - obj.size / 2;
                    obj.velocityY *= -bounce;
                    obj.velocityX *= 0.98;
                }

                // 벽 충돌
                if (obj.x - obj.size / 2 < 0) {
                    obj.x = obj.size / 2;
                    obj.velocityX *= -bounce;
                }
                if (obj.x + obj.size / 2 > canvas.width) {
                    obj.x = canvas.width - obj.size / 2;
                    obj.velocityX *= -bounce;
                }

                // 그리기
                if (obj.type === 'icon') {
                    ctx.save();
                    ctx.globalAlpha = obj.opacity;
                    ctx.translate(obj.x, obj.y);
                    ctx.rotate(obj.rotation);

                    if (obj.img.complete && obj.img.naturalHeight !== 0) {
                        ctx.drawImage(obj.img, -obj.size / 2, -obj.size / 2, obj.size, obj.size);
                    }

                    ctx.restore();
                } else if (obj.type === 'orb') {
                    drawOrb(ctx, obj);
                }
            });

            requestAnimationFrame(animate);
        }

        animate();
    }
}