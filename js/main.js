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
});

function create_stars() {
    const stars_containers = document.querySelectorAll('.stars_container');
    stars_containers.forEach((container, index) => {
        for (let i = 0; i < 15; i++) {
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

            star.style.cssText = `left:${x}%;top:${y}%;width:${size}px;height:${size}px;animation-delay:${delay}s`;
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
        end: "+=500vh",
        pin: true,
        scrub: 2.5,
        onUpdate: (self) => {
            const progress = self.progress;

            // === 1단계: Works 타이틀 등장 및 유지 (0% ~ 35%) ===
            if (progress < 0.35) {
                const titleProgress = Math.min(progress / 0.15, 1);

                gsap.set(worksTitle, { opacity: titleProgress });
                gsap.set(lightOverlay, { opacity: 0, width: '0px', height: '0px' });
                gsap.set(worksContent, { opacity: 0 });
            }

            // === 2단계: 빛이 점차 밝아짐 (35% ~ 75%) ===
            else if (progress >= 0.35 && progress < 0.75) {
                const lightProgress = (progress - 0.35) / 0.4;

                // 타이틀은 60% 지점까지만 유지
                let titleOpacity;
                if (progress < 0.6) {
                    titleOpacity = 1;
                } else {
                    titleOpacity = 1 - ((progress - 0.6) / 0.15);
                }

                gsap.set(worksTitle, { opacity: titleOpacity });

                // 빛이 점점 커지고 밝아짐 (하나의 원만)
                const maxSize = Math.max(window.innerWidth, window.innerHeight) * 3.5;
                const currentSize = maxSize * lightProgress;

                gsap.set(lightOverlay, {
                    opacity: lightProgress * 0.7, // 0.85 → 0.7로 낮춤
                    width: `${currentSize}px`,
                    height: `${currentSize}px`
                });

                gsap.set(worksContent, { opacity: 0 });
            }

            // === 3단계: 빛이 완전히 사라진 후 프로젝트 등장 (75% ~ 100%) ===
            else if (progress >= 0.75) {
                const fadeProgress = (progress - 0.75) / 0.25;

                // 타이틀 완전히 숨김
                gsap.set(worksTitle, { opacity: 0 });

                // 빛이 서서히 사라짐
                gsap.set(lightOverlay, { opacity: 0.7 - (fadeProgress * 0.7) });

                // 프로젝트는 빛이 완전히 사라진 후 천천히 등장 (82% 이후)
                if (progress < 0.82) {
                    gsap.set(worksContent, { opacity: 0 });
                } else {
                    const projectProgress = (progress - 0.82) / 0.18; // 18% 구간으로 더 천천히
                    gsap.set(worksContent, { opacity: projectProgress });
                }
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
        const next = Math.min(currentIndex + 1, slides.length - 1);
        showSlide(next, +1);
    }

    function prevSlide() {
        const prev = Math.max(currentIndex - 1, 0);
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

    // 초기 상태 세팅
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[0]?.classList.add('active');
    dots[0]?.classList.add('active');
    updateCounter(0);

    // 혹시 기존 CSS transition(opacity)과 충돌하면, GSAP가 우선이지만
    // "푝" 느낌 남으면 CSS의 transition을 약하게(또는 제거)해줘.
}
