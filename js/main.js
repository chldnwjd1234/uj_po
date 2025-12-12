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
    const home_dot = document.querySelector('.home_dot');
    const keyword_cards = document.querySelectorAll('.keyword_card');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });

    links.forEach(link => {
        link.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        link.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    if (home_dot) {
        home_dot.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        home_dot.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    }

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

        spotlight_circle.setAttribute('cx', mouse_x);
        spotlight_circle.setAttribute('cy', mouse_y);

        mouse_light.style.left = `${mouse_x}px`;
        mouse_light.style.top = `${mouse_y}px`;
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

        let shrink_progress = 0;
        const shrink_duration = 300;

        const shrink_interval = setInterval(() => {
            shrink_progress += 10;
            const progress = shrink_progress / shrink_duration;
            const current_radius = 200 - (50 * progress);

            spotlight_circle.setAttribute('r', current_radius);

            if (shrink_progress >= shrink_duration) {
                clearInterval(shrink_interval);

                let expand_progress = 0;
                const expand_duration = 800;

                const expand_interval = setInterval(() => {
                    expand_progress += 10;
                    const progress = expand_progress / expand_duration;

                    let current_radius;
                    if (progress < 0.5) {
                        const half_progress = progress * 2;
                        current_radius = 150 + (850 * half_progress);
                    } else {
                        const half_progress = (progress - 0.5) * 2;
                        current_radius = 1000 - (800 * half_progress);
                    }

                    spotlight_circle.setAttribute('r', current_radius);

                    if (expand_progress >= expand_duration) {
                        clearInterval(expand_interval);
                        spotlight_circle.setAttribute('r', 200);
                        click_done = false;
                    }
                }, 10);
            }
        }, 10);
    });

    window.addEventListener('wheel', (e) => {
        if (mask_revealed || !spotlight_circle) return;

        if (e.deltaY > 0) {
            mask_revealed = true;

            body.classList.remove('scroll_locked');
            if (cursor) cursor.classList.add('small');
            if (mouse_light) mouse_light.classList.add('small');

            let start_time = null;
            const duration = 2000;

            function animate(current_time) {
                if (!start_time) start_time = current_time;
                const elapsed = current_time - start_time;
                const progress = Math.min(elapsed / duration, 1);

                const eased = 1 - Math.pow(1 - progress, 3);
                const radius = 200 + (5000 * eased);
                spotlight_circle.setAttribute('r', radius);

                if (scroll_indicator) scroll_indicator.style.opacity = 1 - eased;

                if (progress < 1) requestAnimationFrame(animate);
                else if (scroll_indicator) scroll_indicator.style.display = 'none';
            }

            requestAnimationFrame(animate);
        }
    }, { passive: true });
}

// ========== 홈 도트 클릭 ==========
const home_dot = document.querySelector('.home_dot');
if (home_dot) {
    home_dot.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
        home_dot.classList.add('active');

        // 맨 위로 스크롤
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========== 네비게이션 클릭 ==========
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        if (href.startsWith('#')) {
            e.preventDefault();

            const home_dot = document.querySelector('.home_dot');
            if (home_dot) home_dot.classList.remove('active');

            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');

            const target_id = href.substring(1);
            const target_element = document.getElementById(target_id);

            if (target_element) {
                target_element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

// ========== 스크롤에 따른 네비게이션 활성화 ==========
function setup_nav_active() {
    const sections = document.querySelectorAll('section[id]');
    const nav_links = document.querySelectorAll('nav a');
    const home_dot = document.querySelector('.home_dot');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const section_top = section.offsetTop;
            if (window.scrollY >= section_top - 200) current = section.getAttribute('id');
        });

        if (window.scrollY < 100) {
            if (home_dot) home_dot.classList.add('active');
            nav_links.forEach(link => link.classList.remove('active'));
        } else {
            if (home_dot) home_dot.classList.remove('active');

            nav_links.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
            });
        }
    });
}

// ========== ✅ 키워드 카드 인터랙션 (클릭/호버만) ==========
function setupKeywordCards() {
    const cards = document.querySelectorAll('.keyword_card');
    if (cards.length === 0) return;

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();

            // 다른 카드들 닫기
            cards.forEach(c => {
                if (c !== card) c.classList.remove('active');
            });

            // 현재 카드 토글
            card.classList.toggle('active');
        });
    });

    // 카드 외부 클릭 시 모두 닫기
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.keyword_card')) {
            cards.forEach(card => card.classList.remove('active'));
        }
    });
}

/* =========================================================================
   ✅ Skills: "2페이지 도착 후, 한 번 더 스크롤"에서 아이콘 떨어지기 시작
   ========================================================================= */
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

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
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
    mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

    const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
            stiffness: 0.15,
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