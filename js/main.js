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
    setup_skills_drop_trigger();
    setup_contact_transition();
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

    document.querySelectorAll('a, button').forEach(el => {
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

    // 3단계 전환: gsap.set으로 즉시 적용 (여러 원 방지)
    ScrollTrigger.create({
        trigger: worksSection,
        start: "top top",
        end: "+=800vh", // 스크롤 거리 대폭 증가 (500vh → 800vh)
        pin: true,
        scrub: 5, // 더욱 부드럽고 천천히 (2.5 → 5)
        onUpdate: (self) => {
            const progress = self.progress;

            // === 1단계: Works 타이틀 등장 및 유지 (0% ~ 20%) ===
            if (progress < 0.20) {
                const titleProgress = Math.min(progress / 0.12, 1);

                gsap.set(worksTitle, { opacity: titleProgress });
                gsap.set(lightOverlay, { opacity: 0, width: '0px', height: '0px' });
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

                // 빛이 점점 커지고 밝아짐 - 천천히, 부드럽게
                const maxSize = Math.max(window.innerWidth, window.innerHeight) * 3.5;
                const currentSize = maxSize * lightProgress;

                // sine easing으로 부드럽게
                const easedProgress = Math.sin((lightProgress * Math.PI) / 2);

                gsap.set(lightOverlay, {
                    opacity: easedProgress * 0.45, // 최대 밝기를 더 낮춤 (0.6 → 0.45)
                    width: `${currentSize}px`,
                    height: `${currentSize}px`
                });

                gsap.set(worksContent, { opacity: 0 });
            }

            // === 3단계: 빛이 천천히 사라짐 (50% ~ 70%) ===
            else if (progress >= 0.50 && progress < 0.70) {
                gsap.set(worksTitle, { opacity: 0 });

                // 빛이 천천히 사라짐
                const lightFade = (progress - 0.50) / 0.20;
                // 부드러운 fade out
                const easedFade = 1 - Math.sin((lightFade * Math.PI) / 2);

                gsap.set(lightOverlay, {
                    opacity: 0.45 * easedFade,
                    width: `${Math.max(window.innerWidth, window.innerHeight) * 3.5}px`,
                    height: `${Math.max(window.innerWidth, window.innerHeight) * 3.5}px`
                });

                gsap.set(worksContent, { opacity: 0 });
            }

            // === 4단계: 프로젝트 천천히 등장 (70% ~ 100%) ===
            else if (progress >= 0.70) {
                gsap.set(worksTitle, { opacity: 0 });
                gsap.set(lightOverlay, { opacity: 0 });

                const projectProgress = (progress - 0.70) / 0.30;
                // 부드러운 fade in
                const easedProject = Math.sin((projectProgress * Math.PI) / 2);
                gsap.set(worksContent, { opacity: easedProject });
            }
        }
    });
}

function setup_project_slider() {
    const slides = document.querySelectorAll('.project_slide');
    const dots = document.querySelectorAll('.slide_dot');
    const currentCounter = document.querySelector('.slide_counter .current');

    const worksSection = document.querySelector('.works_section'); // #works
    const worksContent = document.querySelector('.works_content');

    let currentIndex = 0;

    // ✅ 휠 과민 반응(트랙패드) 방지용 (조금 둔하게)
    let wheelLock = false;
    let wheelAcc = 0;
    const WHEEL_THRESHOLD = 140;  // 기존 80 → 140 (민감하면 160~200)
    const WHEEL_COOLDOWN = 850;  // 기존 650 → 850

    // ✅ GSAP 전환 중복 방지
    let isAnimating = false;

    // ✅ 드래그/스와이프 변수
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    const SWIPE_THRESHOLD = 50;

    function updateCounter(index) {
        if (currentCounter) currentCounter.textContent = String(index + 1).padStart(2, '0');
    }

    // ✅ GSAP 스와이프 전환 적용
    function showSlide(index, dir = 1) {
        if (isAnimating) return;
        if (index === currentIndex) return;

        const prev = slides[currentIndex];
        const next = slides[index];

        isAnimating = true;

        // dots/카운터 업데이트
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index]?.classList.add('active');
        updateCounter(index);

        // 다음 슬라이드 준비(살짝 옆에서 들어오게)
        gsap.set(next, {
            opacity: 0,
            xPercent: dir > 0 ? 10 : -10,
            pointerEvents: 'none'
        });

        // 두 장을 겹쳐서 애니메이션
        prev.classList.add('active');
        next.classList.add('active');

        const tl = gsap.timeline({
            defaults: { duration: 0.6, ease: "power3.out" },
            onComplete: () => {
                // 이전 정리
                prev.classList.remove('active');
                gsap.set(prev, { opacity: 0, xPercent: 0, clearProps: "transform" });

                // 다음 확정
                gsap.set(next, { opacity: 1, xPercent: 0, clearProps: "transform" });
                next.style.pointerEvents = 'auto';

                currentIndex = index;
                isAnimating = false;
            }
        });

        tl.to(prev, { opacity: 0, xPercent: dir > 0 ? -10 : 10 }, 0)
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

    // ✅ Works 섹션이 화면에 "걸려있고" + 콘텐츠가 보일 때만
    function isWorksActive() {
        if (!worksSection) return false;

        const rect = worksSection.getBoundingClientRect();
        const inView = rect.top <= 0 && rect.bottom >= window.innerHeight;

        const contentVisible = worksContent
            ? parseFloat(getComputedStyle(worksContent).opacity || '0') > 0.2
            : true;

        return inView && contentVisible;
    }

    function onWheel(e) {
        if (!isWorksActive()) return;

        // 애니 중이면 스크롤 막고(튐 방지) 무시
        if (isAnimating) {
            e.preventDefault();
            return;
        }

        const goingDown = e.deltaY > 0;
        const atFirst = currentIndex === 0;
        const atLast = currentIndex === slides.length - 1;

        // 중간 슬라이드일 때만 가로채기
        const shouldIntercept =
            (goingDown && !atLast) || (!goingDown && !atFirst);

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

    // dot 클릭 (클릭도 애니메이션 적용)
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const dir = index > currentIndex ? +1 : -1;
            showSlide(index, dir);
        });
    });

    // ✅ 키보드 이벤트 제거 (요청사항)

    // ✅ 휠 이벤트
    window.addEventListener('wheel', onWheel, { passive: false });
    // ✅ 드래그/스와이프 이벤트
    function onDragStart(e) {
        if (!isWorksActive() || isAnimating) return;
        isDragging = true;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        currentX = startX;
        if (worksContent) worksContent.style.cursor = 'grabbing';
    }

    function onDragMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    }

    function onDragEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        if (worksContent) worksContent.style.cursor = '';
        const deltaX = currentX - startX;
        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
            if (deltaX > 0) prevSlide();
            else nextSlide();
        }
        startX = 0;
        currentX = 0;
    }

    if (worksContent) {
        worksContent.addEventListener('mousedown', onDragStart);
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', onDragEnd);
        worksContent.addEventListener('touchstart', onDragStart, { passive: false });
        window.addEventListener('touchmove', onDragMove, { passive: false });
        window.addEventListener('touchend', onDragEnd);
    }


    // 초기 상태 세팅
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[0]?.classList.add('active');
    dots[0]?.classList.add('active');
    updateCounter(0);

    // 혹시 기존 CSS transition(opacity)과 충돌하면, GSAP가 우선이지만
    // "푑" 느낌 남으면 CSS의 transition을 약하게(또는 제거)해줘.
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
        end: "+=1000vh", // 스크롤 거리 조정 (1500vh → 1000vh)
        pin: true,
        scrub: 4, // scrub 값도 약간 줄임 (5 → 4)
        onUpdate: (self) => {
            const progress = self.progress;

            // 1단계: ABOUT 타이틀 등장 및 유지 (0% ~ 18%)
            if (progress < 0.18) {
                const titleProgress = Math.min(progress / 0.10, 1);
                gsap.set(aboutTitle, { opacity: titleProgress });
                gsap.set(lightOverlay, { opacity: 0, width: '0px', height: '0px' });
                if (aboutContent) gsap.set(aboutContent, { opacity: 0 });
            }

            // 2단계: 빛 확산 (18% ~ 40%)
            else if (progress >= 0.18 && progress < 0.40) {
                const lightProgress = (progress - 0.18) / 0.22;

                // 타이틀은 28%까지 유지, 이후 서서히 사라짐
                let titleOpacity = progress < 0.28 ? 1 : 1 - ((progress - 0.28) / 0.12);
                gsap.set(aboutTitle, { opacity: titleOpacity });

                const maxSize = Math.max(window.innerWidth, window.innerHeight) * 3.5;
                // sine easing으로 부드럽게
                const easedProgress = Math.sin((lightProgress * Math.PI) / 2);

                gsap.set(lightOverlay, {
                    opacity: easedProgress * 0.45, // 최대 밝기 낮춤 (0.6 → 0.45)
                    width: `${maxSize * lightProgress}px`,
                    height: `${maxSize * lightProgress}px`
                });
                if (aboutContent) gsap.set(aboutContent, { opacity: 0 });
            }

            // 3단계: 빛 천천히 소멸 (40% ~ 55%)
            else if (progress >= 0.40 && progress < 0.55) {
                gsap.set(aboutTitle, { opacity: 0 });

                const lightFade = (progress - 0.40) / 0.15;
                // 부드러운 fade out
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
                // 부드러운 fade in
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

                const cardProgress = (progress - 0.58) / 0.42; // 58% ~ 100% 구간 사용

                keywordCards.forEach((card, index) => {
                    // 4개 카드를 위한 간격 증가 (18% → 20%)
                    const cardStart = index * 0.20;
                    // 각 카드의 등장 시간 증가 (18% → 22%)
                    const cardDuration = 0.22;

                    if (cardProgress < cardStart) {
                        // 등장 전
                        gsap.set(card, {
                            opacity: 0,
                            scale: 0.15,
                            rotationY: -200,
                            z: -700
                        });
                    } else if (cardProgress < cardStart + cardDuration) {
                        // 등장 중 - 매우 천천히, 일정한 속도로
                        const cardAnim = (cardProgress - cardStart) / cardDuration;
                        // 더 부드러운 easing 적용
                        const eased = cardAnim * cardAnim * (3 - 2 * cardAnim); // smoothstep

                        gsap.set(card, {
                            opacity: eased,
                            scale: 0.15 + (eased * 0.85),
                            rotationY: -200 + (eased * 200),
                            z: -700 + (eased * 700)
                        });
                    } else {
                        // 등장 완료
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

// ========== Skills 아이콘 떨어지기 ==========
let skills_in_view = false;
let skills_icons_started = false;
let skills_icons_settled = false; // 모든 아이콘이 정착했는지

function setup_skills_drop_trigger() {
    const aboutmeSection = document.querySelector('#aboutme');
    if (!aboutmeSection) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // About Me 섹션에 진입하면 바로 시작
            if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
                skills_in_view = true;

                // 아직 시작하지 않았으면 바로 시작
                if (!skills_icons_started) {
                    skills_icons_started = true;
                    createFallingIcons();
                }
            } else {
                skills_in_view = false;
            }
        });
    }, { threshold: [0.3] }); // 0.6에서 0.3으로 낮춤

    io.observe(aboutmeSection);
}

function createFallingIcons() {
    // About Me 섹션의 falling_icons_container 사용
    const container = document.querySelector('.aboutme_section .falling_icons_container');
    if (!container) {
        console.error('falling_icons_container not found in aboutme section');
        return;
    }

    // 컨테이너 표시
    container.classList.add('active');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.transition = 'opacity 0.5s ease'; // 부드러운 전환 추가

    container.appendChild(canvas);

    // About Me와 Contact 섹션 정보
    const aboutmeSection = document.querySelector('.aboutme_section');
    const contactSection = document.querySelector('.contact_section');

    // 스크롤 위치 추적
    let currentScroll = 0;

    function updateScroll() {
        currentScroll = window.pageYOffset;
    }

    updateScroll();
    window.addEventListener('scroll', updateScroll);

    // 바닥 위치를 Contact 섹션 하단으로 계산 (뷰포트 기준)
    function getGroundLevel() {
        const aboutmeTop = aboutmeSection.offsetTop;
        const contactTop = contactSection.offsetTop;
        const contactHeight = contactSection.offsetHeight;
        const contactBottom = contactTop + contactHeight;

        // Contact 섹션 하단까지의 거리를 화면 기준으로 계산
        const groundInView = contactBottom - currentScroll - 20;
        return groundInView;
    }

    // 스킬 아이콘 이미지 경로 배열 (sk1.png ~ sk17.png)
    const iconPaths = [];
    for (let i = 1; i <= 17; i++) {
        iconPaths.push(`./asset/img/sk${i}.png`);
    }

    const objects = []; // 아이콘과 오브를 함께 저장
    let imagesLoaded = 0;
    const gravity = 0.18; // 중력 (0.15 → 0.18)
    const bounce = 0.4; // 바운스
    const friction = 0.98; // 마찰

    // 스킬 아이콘 생성
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
            console.warn(`Failed to load: ${path}`);
            imagesLoaded++;
            if (imagesLoaded === iconPaths.length) {
                startFalling();
            }
        };

        const size = 50 + Math.random() * 30;
        objects.push({
            type: 'icon',
            img: img,
            x: Math.random() * (canvas.width - size),
            y: -100 - Math.random() * 500 - (index * 80),
            size: size,
            velocityX: (Math.random() - 0.5) * 1.5,
            velocityY: 0,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            opacity: 0.85 + Math.random() * 0.15,
            isSettled: false,
            isDragging: false
        });
    });

    // 가짜 오브 생성 (20~25개로 증가)
    const orbCount = 20 + Math.floor(Math.random() * 6);
    for (let i = 0; i < orbCount; i++) {
        const size = 60 + Math.random() * 50;
        objects.push({
            type: 'orb',
            x: Math.random() * (canvas.width - size),
            y: -100 - Math.random() * 700 - (i * 60),
            size: size,
            velocityX: (Math.random() - 0.5) * 1.5,
            velocityY: 0,
            rotation: 0,
            rotationSpeed: 0,
            opacity: 0.45 + Math.random() * 0.35,
            isSettled: false,
            twinklePhase: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.03 + Math.random() * 0.03,
            isDragging: false
        });
    }

    function checkCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (obj1.size + obj2.size) / 2;
        return distance < minDistance;
    }

    function resolveCollision(obj1, obj2) {
        const dx = obj2.x - obj1.x;
        const dy = obj2.y - obj1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return;

        const minDistance = (obj1.size + obj2.size) / 2;
        const overlap = minDistance - distance;

        const nx = dx / distance;
        const ny = dy / distance;

        obj1.x -= nx * overlap * 0.5;
        obj1.y -= ny * overlap * 0.5;
        obj2.x += nx * overlap * 0.5;
        obj2.y += ny * overlap * 0.5;

        const relativeVelocityX = obj2.velocityX - obj1.velocityX;
        const relativeVelocityY = obj2.velocityY - obj1.velocityY;
        const speed = relativeVelocityX * nx + relativeVelocityY * ny;

        if (speed < 0) return;

        const impulse = 2 * speed / 2;
        obj1.velocityX += impulse * nx * 0.5;
        obj1.velocityY += impulse * ny * 0.5;
        obj2.velocityX -= impulse * nx * 0.5;
        obj2.velocityY -= impulse * ny * 0.5;
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

        const coreGradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.size / 4);
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.size / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function startFalling() {
        let draggedObject = null;
        let mouseX = 0;
        let mouseY = 0;
        let offsetX = 0;
        let offsetY = 0;
        let lastMouseX = 0;
        let lastMouseY = 0;

        // 마우스 이벤트
        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            lastMouseX = mouseX;
            lastMouseY = mouseY;

            for (let i = objects.length - 1; i >= 0; i--) {
                const obj = objects[i];
                const dx = mouseX - obj.x;
                const dy = mouseY - obj.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < obj.size / 2) {
                    draggedObject = obj;
                    obj.isDragging = true;
                    obj.isSettled = false;
                    offsetX = dx;
                    offsetY = dy;
                    break;
                }
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            lastMouseX = mouseX;
            lastMouseY = mouseY;
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;

            if (draggedObject) {
                const newX = mouseX - offsetX;
                const newY = mouseY - offsetY;

                const groundLevel = getGroundLevel();
                draggedObject.x = Math.max(draggedObject.size / 2, Math.min(canvas.width - draggedObject.size / 2, newX));
                draggedObject.y = Math.max(draggedObject.size / 2, Math.min(Math.max(groundLevel, canvas.height) - draggedObject.size / 2, newY));

                draggedObject.velocityX = (mouseX - lastMouseX) * 0.3;
                draggedObject.velocityY = (mouseY - lastMouseY) * 0.3;
            }
        });

        canvas.addEventListener('mouseup', () => {
            if (draggedObject) {
                draggedObject.isDragging = false;
                draggedObject.velocityX = Math.max(-10, Math.min(10, draggedObject.velocityX));
                draggedObject.velocityY = Math.max(-10, Math.min(10, draggedObject.velocityY));
            }
            draggedObject = null;
        });

        canvas.addEventListener('mouseleave', () => {
            if (draggedObject) {
                draggedObject.isDragging = false;
                draggedObject.velocityX = 0;
                draggedObject.velocityY = 0;
            }
            draggedObject = null;
        });

        // 터치 이벤트
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            mouseX = touch.clientX - rect.left;
            mouseY = touch.clientY - rect.top;
            lastMouseX = mouseX;
            lastMouseY = mouseY;

            for (let i = objects.length - 1; i >= 0; i--) {
                const obj = objects[i];
                const dx = mouseX - obj.x;
                const dy = mouseY - obj.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < obj.size / 2) {
                    draggedObject = obj;
                    obj.isDragging = true;
                    obj.isSettled = false;
                    offsetX = dx;
                    offsetY = dy;
                    break;
                }
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            lastMouseX = mouseX;
            lastMouseY = mouseY;
            mouseX = touch.clientX - rect.left;
            mouseY = touch.clientY - rect.top;

            if (draggedObject) {
                const newX = mouseX - offsetX;
                const newY = mouseY - offsetY;

                const groundLevel = getGroundLevel();
                draggedObject.x = Math.max(draggedObject.size / 2, Math.min(canvas.width - draggedObject.size / 2, newX));
                draggedObject.y = Math.max(draggedObject.size / 2, Math.min(Math.max(groundLevel, canvas.height) - draggedObject.size / 2, newY));

                draggedObject.velocityX = (mouseX - lastMouseX) * 0.3;
                draggedObject.velocityY = (mouseY - lastMouseY) * 0.3;
            }
        }, { passive: false });

        canvas.addEventListener('touchend', () => {
            if (draggedObject) {
                draggedObject.isDragging = false;
                draggedObject.velocityX = Math.max(-10, Math.min(10, draggedObject.velocityX));
                draggedObject.velocityY = Math.max(-10, Math.min(10, draggedObject.velocityY));
            }
            draggedObject = null;
        });

        function animate() {
            // About Me 섹션 도달 여부 확인
            const aboutmeTop = aboutmeSection.offsetTop;
            const aboutmeBottom = aboutmeTop + aboutmeSection.offsetHeight;

            // ✅ 수정: About Me 섹션을 벗어나면 캔버스 즉시 숨기기
            // About Me 섹션이 화면 아래로 벗어났을 때 (스크롤을 올렸을 때) - 더 빨리 반응
            const isAboveAboutMe = currentScroll < aboutmeTop - window.innerHeight * 0.2;

            // Contact 섹션을 지나쳤을 때 (스크롤을 내렸을 때)
            const contactTop = contactSection.offsetTop;
            const contactBottom = contactTop + contactSection.offsetHeight;
            const isBelowContact = currentScroll > contactBottom + window.innerHeight * 0.2;

            // About Me 구간 밖이면 캔버스 완전히 숨기기
            if (isAboveAboutMe || isBelowContact) {
                canvas.style.opacity = '0';
                canvas.style.pointerEvents = 'none';
                requestAnimationFrame(animate);
                return;
            } else {
                canvas.style.opacity = '1';
                canvas.style.pointerEvents = 'auto';
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const groundLevel = getGroundLevel();

            objects.forEach((obj, i) => {
                if (!obj.isSettled && !obj.isDragging) {

                    // 중력 적용
                    obj.velocityY += gravity;
                    obj.velocityX *= friction;
                    obj.velocityY *= friction;

                    // 위치 업데이트
                    obj.x += obj.velocityX;
                    obj.y += obj.velocityY;
                    obj.rotation += obj.rotationSpeed;

                    // 바닥 충돌 - groundLevel이 화면 밖이면 계속 떨어지게
                    const effectiveGround = Math.max(groundLevel, canvas.height - 20);

                    if (obj.y + obj.size / 2 > effectiveGround) {
                        obj.y = effectiveGround - obj.size / 2;
                        obj.velocityY *= -bounce;
                        obj.velocityX *= 0.98;

                        // Contact 섹션에 도착했을 때만 정착
                        if (groundLevel < canvas.height) {
                            if (Math.abs(obj.velocityY) < 0.3 && Math.abs(obj.velocityX) < 0.3) {
                                obj.velocityY = 0;
                                obj.velocityX = 0;
                                obj.isSettled = true;
                            }
                        }
                    }

                    // 좌우 벽 충돌
                    if (obj.x - obj.size / 2 < 0) {
                        obj.x = obj.size / 2;
                        obj.velocityX *= -bounce;
                    }
                    if (obj.x + obj.size / 2 > canvas.width) {
                        obj.x = canvas.width - obj.size / 2;
                        obj.velocityX *= -bounce;
                    }

                    // 다른 객체와 충돌 체크
                    for (let j = i + 1; j < objects.length; j++) {
                        if (!objects[j].isDragging && checkCollision(obj, objects[j])) {
                            resolveCollision(obj, objects[j]);
                            obj.isSettled = false; // 충돌 후 다시 움직이도록
                            objects[j].isSettled = false;
                        }
                    }

                    obj.rotationSpeed *= 0.98;
                } else if (obj.isDragging) {
                    // 드래그 중일 때는 계속 처리
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

            // 항상 애니메이션 계속 실행 (드래그 가능하게)
            requestAnimationFrame(animate);
        }

        animate();
    }
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

    // ✅ Contact 진입 시 nav active 변경 - href="#contact"로 수정
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
        start: "top 80%",
        onEnter: () => {
            contactSection.classList.add('visible');
            if (cityBg) {
                gsap.to(cityBg, {
                    opacity: 0.25, // 살짝만 보이도록 (0.8에서 0.25로 변경)
                    duration: 1,
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