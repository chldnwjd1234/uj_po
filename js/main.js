document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
    document.body.classList.add('scroll_locked');

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    create_stars();
    setup_custom_cursor();
    setup_svg_spotlight();
    setup_scroll_effects();
    setup_nav_active();
    setup_skills_drop_trigger();
    setup_gsap_transitions();
    setup_project_slider();

    setTimeout(() => setupKeywordCards(), 100);
});

// ========== 별 생성 ==========
function create_stars() {
    const stars_containers = document.querySelectorAll('.stars_container');

    stars_containers.forEach((container, index) => {
        let star_count;
        if (index === 0) star_count = 15;
        else {
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

// ========== 커스텀 커서 ==========
function setup_custom_cursor() {
    const cursor = document.querySelector('.custom_cursor');
    const links = document.querySelectorAll('a');
    const keyword_cards = document.querySelectorAll('.keyword_card');

    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            duration: 0.3,
            left: e.clientX,
            top: e.clientY,
            ease: "power2.out"
        });
    });

    links.forEach(link => {
        link.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        link.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    keyword_cards.forEach(card => {
        card.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        card.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// ========== SVG Spotlight ==========
function setup_svg_spotlight() {
    const spotlight_circle = document.getElementById('spotlight_circle');
    const mouse_light = document.querySelector('.mouse_light');
    const hero_section = document.querySelector('.hero_section');

    if (!spotlight_circle || !mouse_light || !hero_section) return;

    let mouse_x = window.innerWidth / 2;
    let mouse_y = window.innerHeight / 2;

    hero_section.addEventListener('mousemove', (e) => {
        mouse_x = e.clientX;
        mouse_y = e.clientY;

        gsap.to(spotlight_circle, {
            duration: 0.5,
            attr: { cx: mouse_x, cy: mouse_y },
            ease: "power2.out"
        });

        gsap.to(mouse_light, {
            duration: 0.5,
            left: mouse_x,
            top: mouse_y,
            ease: "power2.out"
        });
    });

    spotlight_circle.setAttribute('cx', mouse_x);
    spotlight_circle.setAttribute('cy', mouse_y);
    mouse_light.style.left = `${mouse_x}px`;
    mouse_light.style.top = `${mouse_y}px`;
}

// ========== 스크롤 효과 ==========
function setup_scroll_effects() {
    const scroll_indicator = document.querySelector('.scroll_indicator');
    const cursor = document.querySelector('.custom_cursor');
    const mouse_light = document.querySelector('.mouse_light');
    const spotlight_circle = document.getElementById('spotlight_circle');
    const body = document.body;
    const hero_section = document.querySelector('.hero_section');

    if (!hero_section) return;

    let mask_revealed = false;
    let click_done = false;

    hero_section.addEventListener('click', () => {
        if (click_done || mask_revealed || !spotlight_circle) return;

        click_done = true;

        const tl = gsap.timeline({
            onComplete: () => {
                click_done = false;
            }
        });

        tl.to(spotlight_circle, {
            duration: 0.3,
            attr: { r: 150 },
            ease: "power2.in"
        })
            .to(spotlight_circle, {
                duration: 0.4,
                attr: { r: 1000 },
                ease: "power2.out"
            })
            .to(spotlight_circle, {
                duration: 0.4,
                attr: { r: 200 },
                ease: "elastic.out(1, 0.5)"
            });
    });

    window.addEventListener('wheel', (e) => {
        if (mask_revealed || !spotlight_circle) return;

        if (e.deltaY > 0) {
            mask_revealed = true;

            body.classList.remove('scroll_locked');
            if (cursor) cursor.classList.add('small');
            if (mouse_light) mouse_light.classList.add('small');

            const tl = gsap.timeline();

            tl.to(spotlight_circle, {
                duration: 2,
                attr: { r: 5200 },
                ease: "power3.out"
            })
                .to(scroll_indicator, {
                    duration: 2,
                    opacity: 0,
                    ease: "power2.out",
                    onComplete: () => {
                        if (scroll_indicator) scroll_indicator.style.display = 'none';
                    }
                }, 0);
        }
    }, { passive: true });
}

// ========== 네비게이션 클릭 ==========
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        if (href && href.startsWith('#')) {
            e.preventDefault();
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');

            const target_id = href.substring(1);
            const target_element = document.getElementById(target_id);

            if (target_element) {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: { y: target_element, offsetY: 0 },
                    ease: "power2.inOut"
                });
            }
        }
    });
});

// ========== 스크롤에 따른 네비게이션 활성화 ==========
function setup_nav_active() {
    const sections = document.querySelectorAll('section[id]');
    const nav_links = document.querySelectorAll('nav a');

    let currentSection = 'hero';

    // ScrollTrigger를 사용한 섹션 감지
    gsap.registerPlugin(ScrollTrigger);

    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onEnter: () => {
                currentSection = section.getAttribute('id');
                updateNav();
            },
            onEnterBack: () => {
                currentSection = section.getAttribute('id');
                updateNav();
            }
        });
    });

    function updateNav() {
        nav_links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // 초기 상태
    updateNav();
}

// ========== 키워드 카드 인터랙션 ==========
function setupKeywordCards() {
    const cards = document.querySelectorAll('.keyword_card');
    if (cards.length === 0) return;

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                scale: 1.08,
                duration: 0.4,
                ease: "power2.out"
            });

            card.classList.add('active');
            cards.forEach(c => {
                if (c !== card) c.classList.remove('active');
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                scale: 1,
                duration: 0.4,
                ease: "power2.out"
            });

            card.classList.remove('active');
        });

        card.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.toggle('active');

            if (card.classList.contains('active')) {
                gsap.to(card, {
                    scale: 1.15,
                    duration: 0.4,
                    ease: "back.out(1.4)"
                });
            } else {
                gsap.to(card, {
                    scale: 1,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.keyword_card')) {
            cards.forEach(card => {
                card.classList.remove('active');
                gsap.to(card, {
                    scale: 1,
                    duration: 0.4,
                    ease: "power2.out"
                });
            });
        }
    });
}

// ========== Skills 아이콘 떨어지기 트리거 ==========
let skills_in_view = false;
let skills_icons_started = false;

function setup_skills_drop_trigger() {
    const skillsSection = document.querySelector('#skills');
    if (!skillsSection) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            skills_in_view = entry.isIntersecting && entry.intersectionRatio >= 0.6;
        });
    }, { threshold: [0.6] });

    io.observe(skillsSection);

    window.addEventListener('wheel', (e) => {
        if (skills_icons_started) return;
        if (!skills_in_view) return;
        if (e.deltaY <= 0) return;

        skills_icons_started = true;
        createFallingIcons();
    }, { passive: true });
}

// ========== GSAP 트랜지션 설정 ==========
let transition_triggered = false;
let skills_animation_done = false;

function setup_gsap_transitions() {
    const skills_section = document.querySelector('.skills_section');
    const works_section = document.querySelector('.works_section');
    const light_overlay = document.querySelector('.light_overlay');
    const falling_icons = document.querySelector('.falling_icons_container');
    const keywords_container = document.querySelector('.keywords_container');
    const works_title = document.querySelector('.works_section .section_title');
    const works_content = document.querySelector('.works_content');
    const body = document.body;

    if (!skills_section || !works_section) return;

    // ScrollTrigger 플러그인 등록
    gsap.registerPlugin(ScrollTrigger);

    // Skills 섹션 진입 시 화면 고정 & 카드 애니메이션
    ScrollTrigger.create({
        trigger: skills_section,
        start: "top top",
        onEnter: () => {
            if (skills_animation_done) return;

            // 화면 고정
            body.classList.add('scroll_locked');

            // 타이틀과 카드 순차 애니메이션
            const tl = gsap.timeline({
                onComplete: () => {
                    skills_animation_done = true;
                    // 애니메이션 완료 후 스크롤 해제
                    setTimeout(() => {
                        body.classList.remove('scroll_locked');
                    }, 500);
                }
            });

            // 1. 타이틀 등장
            const skillsTitle = document.querySelector('.skills_section .section_title');
            tl.to(skillsTitle, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out"
            });

            // 2. 카드들 순차 등장
            const cards = document.querySelectorAll('.keyword_card');
            cards.forEach((card, index) => {
                tl.to(card, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "back.out(1.5)",
                }, `-=${index === 0 ? 0 : 0.5}`);
            });
        }
    });

    // Skills -> Works 트랜지션
    let canTriggerTransition = true;

    window.addEventListener('wheel', (e) => {
        if (!skills_animation_done) return;
        if (transition_triggered) return;
        if (!canTriggerTransition) return;

        const skillsRect = skills_section.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (e.deltaY > 0 && skillsRect.bottom < windowHeight * 1.2 && skillsRect.bottom > windowHeight * 0.3) {
            transition_triggered = true;
            canTriggerTransition = false;

            body.classList.add('scroll_locked');

            const tl = gsap.timeline({
                onComplete: () => {
                    body.classList.remove('scroll_locked');
                    // 부드럽게 Works 섹션으로 이동
                    gsap.to(window, {
                        duration: 0.5,
                        scrollTo: { y: works_section, offsetY: 0 },
                        ease: "power2.inOut"
                    });
                }
            });

            tl.to(light_overlay, {
                width: "200vw",
                height: "200vw",
                opacity: 0.85,
                duration: 2.2,
                ease: "power1.inOut"
            })
                .to([falling_icons, keywords_container], {
                    opacity: 0,
                    duration: 1.5,
                    ease: "power2.inOut"
                }, 0)
                .to({}, { duration: 0.5 })
                .to(light_overlay, {
                    width: "0px",
                    height: "0px",
                    opacity: 0,
                    duration: 2,
                    ease: "power1.inOut"
                })
                .to(works_title, {
                    opacity: 1,
                    duration: 1.2,
                    ease: "power2.out"
                }, "-=1.5");
        }
    }, { passive: true });

    // Works 타이틀 → 프로젝트 슬라이드 전환 (화면 고정 with pin)
    ScrollTrigger.create({
        trigger: works_section,
        start: "top top",
        end: "+=200vh",
        pin: true, // 화면 고정!
        scrub: 1.5,
        onUpdate: (self) => {
            const progress = self.progress;

            // 타이틀 더 늦게 사라지도록 (0.3까지는 유지, 그 이후 사라짐)
            const titleOpacity = progress < 0.3 ? 1 : (1 - ((progress - 0.3) / 0.7));
            gsap.to(works_title, {
                opacity: titleOpacity,
                duration: 0.1
            });

            // 프로젝트 슬라이드는 조금 더 일찍 등장
            const contentOpacity = progress < 0.2 ? 0 : ((progress - 0.2) / 0.8);
            gsap.to(works_content, {
                opacity: contentOpacity,
                duration: 0.1
            });
        }
    });

    // 스크롤 위로 올릴 때 초기화
    ScrollTrigger.create({
        trigger: skills_section,
        start: "top bottom",
        onEnterBack: () => {
            if (!transition_triggered) return;

            transition_triggered = false;
            canTriggerTransition = true;

            gsap.to([falling_icons, keywords_container], {
                opacity: 0.7,
                duration: 0.6,
                ease: "power2.out"
            });

            gsap.to(light_overlay, {
                width: "0px",
                height: "0px",
                opacity: 0,
                duration: 0.6,
                ease: "power2.out"
            });

            gsap.to(works_title, {
                opacity: 0,
                duration: 0.6,
                ease: "power2.out"
            });

            gsap.to(works_content, {
                opacity: 0,
                duration: 0.6,
                ease: "power2.out"
            });
        }
    });
}

// ========== Matter.js 아이콘 떨어지기 ==========
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// ========== 프로젝트 슬라이더 ==========
function setup_project_slider() {
    const slides = document.querySelectorAll('.project_slide');
    const dots = document.querySelectorAll('.slide_dot');
    const prevBtn = document.querySelector('.slide_nav.prev');
    const nextBtn = document.querySelector('.slide_nav.next');
    const currentCounter = document.querySelector('.slide_counter .current');
    let currentIndex = 0;

    function updateCounter(index) {
        if (currentCounter) {
            currentCounter.textContent = String(index + 1).padStart(2, '0');
        }
    }

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        slides[index].classList.add('active');
        dots[index].classList.add('active');

        currentIndex = index;
        updateCounter(index);
    }

    function nextSlide() {
        const next = (currentIndex + 1) % slides.length;
        showSlide(next);
    }

    function prevSlide() {
        const prev = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(prev);
    }

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });

    updateCounter(0);
}

async function createFallingIcons() {
    const container = document.querySelector('.falling_icons_container');
    if (!container || typeof Matter === 'undefined') return;

    const iconCount = 17;

    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Mouse = Matter.Mouse;
    const MouseConstraint = Matter.MouseConstraint;
    const Events = Matter.Events;
    const Body = Matter.Body;

    const engine = Engine.create();
    const world = engine.world;
    world.gravity.y = 1;

    let containerWidth = container.offsetWidth;
    let containerHeight = container.offsetHeight;

    const render = Render.create({
        element: container,
        engine: engine,
        options: {
            width: containerWidth,
            height: containerHeight,
            wireframes: false,
            background: 'transparent'
        }
    });

    const wallThickness = 120;
    const groundHeight = 120;
    const bottomPadding = 20;

    let ground, ceiling, wallLeft, wallRight;
    let groundLineY = 0;

    function buildWalls() {
        if (ground) World.remove(world, ground);
        if (ceiling) World.remove(world, ceiling);
        if (wallLeft) World.remove(world, wallLeft);
        if (wallRight) World.remove(world, wallRight);

        containerWidth = container.offsetWidth;
        containerHeight = container.offsetHeight;

        groundLineY = containerHeight - bottomPadding;

        ground = Bodies.rectangle(
            containerWidth / 2,
            groundLineY + groundHeight / 2,
            containerWidth + wallThickness * 2,
            groundHeight,
            { isStatic: true, render: { visible: false } }
        );

        ceiling = Bodies.rectangle(
            containerWidth / 2,
            -groundHeight / 2,
            containerWidth + wallThickness * 2,
            groundHeight,
            { isStatic: true, render: { visible: false } }
        );

        wallLeft = Bodies.rectangle(
            -wallThickness / 2,
            containerHeight / 2,
            wallThickness,
            containerHeight + groundHeight * 2,
            { isStatic: true, render: { visible: false } }
        );

        wallRight = Bodies.rectangle(
            containerWidth + wallThickness / 2,
            containerHeight / 2,
            wallThickness,
            containerHeight + groundHeight * 2,
            { isStatic: true, render: { visible: false } }
        );

        World.add(world, [ground, ceiling, wallLeft, wallRight]);
    }

    buildWalls();

    const iconBodies = [];

    for (let i = 1; i <= iconCount; i++) {
        const src = `./asset/img/sk${i}.png`;

        let img;
        try {
            img = await loadImage(src);
        } catch (err) {
            console.warn('Failed to load image:', src, err);
            continue;
        }

        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;

        const targetSize = Math.random() * 22 + 58;
        const longSide = Math.max(w, h);
        const scale = targetSize / longSide;

        const x = Math.random() * (containerWidth - 140) + 70;
        const y = -Math.random() * 260 - 80;

        const body = Bodies.circle(x, y, targetSize / 2, {
            restitution: 0.86,
            friction: 0.03,
            frictionAir: 0.002,
            render: {
                sprite: {
                    texture: src,
                    xScale: scale,
                    yScale: scale
                }
            }
        });

        iconBodies.push(body);
        World.add(world, body);
    }

    const orbBodies = [];
    const orbCount = 18;

    for (let i = 0; i < orbCount; i++) {
        const r = Math.random() * 25 + 8;
        const x = Math.random() * (containerWidth - 200) + 100;
        const y = -Math.random() * 520 - 120;

        const orb = Bodies.circle(x, y, r, {
            restitution: 0.6,
            friction: 0.03,
            frictionAir: 0.008,
            render: { visible: false }
        });

        orbBodies.push(orb);
        World.add(world, orb);
    }

    Events.on(render, 'afterRender', () => {
        const ctx = render.context;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        iconBodies.forEach(b => {
            const { x, y } = b.position;
            const r = b.circleRadius || 20;

            ctx.shadowColor = 'rgba(255,255,255,0.7)';
            ctx.shadowBlur = 32;

            ctx.beginPath();
            ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0)';
            ctx.fill();
        });

        const t = performance.now() * 0.002;

        orbBodies.forEach((o, i) => {
            const { x, y } = o.position;
            const r = o.circleRadius || 12;

            const pulse = Math.sin(t + i * 1.7) * 0.5 + 0.5;

            const glowAlpha = 0.25 + pulse * 0.25;
            const blur = 30 + pulse * 26;

            ctx.save();
            ctx.globalCompositeOperation = 'lighter';

            ctx.shadowColor = `rgba(255,255,255,${glowAlpha})`;
            ctx.shadowBlur = blur;

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${0.04 + pulse * 0.03})`;
            ctx.fill();

            ctx.restore();
        });

        ctx.restore();
    });

    const allFallBodies = [...iconBodies, ...orbBodies];

    Events.on(engine, 'beforeUpdate', () => {
        const minX = 0;
        const maxX = containerWidth;
        const minY = 0;
        const maxY = groundLineY;

        allFallBodies.forEach(b => {
            const r = b.circleRadius || 20;

            const clampedX = Math.min(Math.max(b.position.x, minX + r), maxX - r);
            const clampedY = Math.min(Math.max(b.position.y, minY + r), maxY - r);

            const outX = (clampedX !== b.position.x);
            const outY = (clampedY !== b.position.y);

            if (outX || outY) {
                Body.setPosition(b, { x: clampedX, y: clampedY });

                const vx = outX ? b.velocity.x * 0.2 : b.velocity.x;
                const vy = outY ? b.velocity.y * 0.85 : b.velocity.y;

                Body.setVelocity(b, { x: vx, y: vy });
            }
        });
    });

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });

    World.add(world, mouseConstraint);
    render.mouse = mouse;

    Engine.run(engine);
    Render.run(render);

    window.addEventListener('resize', () => {
        const w = container.offsetWidth;
        const h = container.offsetHeight;

        render.canvas.width = w;
        render.canvas.height = h;
        render.options.width = w;
        render.options.height = h;

        buildWalls();
    });
}