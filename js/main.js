document.addEventListener('DOMContentLoaded', () => {
    // 페이지 로드 시 최상단 고정
    window.scrollTo(0, 0);
    document.body.classList.add('scroll_locked');

    create_stars();
    setup_custom_cursor();
    setup_svg_spotlight();
    setup_scroll_effects();
});

function create_stars() {
    const stars_container = document.querySelector('.stars_container');
    const star_count = 80;

    for (let i = 0; i < star_count; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 2 + 1;
        const delay = Math.random() * 3;

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDelay = `${delay}s`;

        stars_container.appendChild(star);
    }
}

function setup_custom_cursor() {
    const cursor = document.querySelector('.custom_cursor');
    const links = document.querySelectorAll('a');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });

    links.forEach(link => {
        link.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        link.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

function setup_svg_spotlight() {
    const spotlight_circle = document.getElementById('spotlight_circle');
    const mouse_light = document.querySelector('.mouse_light');
    const hero_section = document.querySelector('.hero_section');

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

function setup_scroll_effects() {
    const nav = document.querySelector('nav');
    const svg_text = document.querySelector('.svg_text');
    const scroll_indicator = document.querySelector('.scroll_indicator');
    const cursor = document.querySelector('.custom_cursor');
    const mouse_light = document.querySelector('.mouse_light');
    const spotlight_circle = document.getElementById('spotlight_circle');
    const skills_items = document.querySelectorAll('.skill_item');
    const body = document.body;

    let mask_progress = 0;
    let mask_revealed = false;
    let skills_shown = false;
    let animating = false;

    // 휠 이벤트로 마스크 애니메이션 제어
    window.addEventListener('wheel', (e) => {
        if (mask_revealed) return;

        if (e.deltaY > 0 && !animating) {
            animating = true;
            body.classList.add('scroll_locked');

            // 마스크 확대 애니메이션
            let start_time = null;
            const duration = 1500; // 1.5초

            function animate(current_time) {
                if (!start_time) start_time = current_time;
                const elapsed = current_time - start_time;
                const progress = Math.min(elapsed / duration, 1);

                // easeOutCubic
                const eased = 1 - Math.pow(1 - progress, 3);

                const radius = 200 + (5000 * eased);
                spotlight_circle.setAttribute('r', radius);

                svg_text.style.opacity = 1 - (eased * 0.9);
                scroll_indicator.style.opacity = 1 - eased;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    mask_revealed = true;
                    svg_text.classList.add('fade_out');
                    scroll_indicator.classList.add('fade_out');

                    setTimeout(() => {
                        body.classList.remove('scroll_locked');
                        nav.classList.remove('hidden');
                        cursor.classList.add('small');
                        mouse_light.classList.add('small');

                        // Skills 섹션으로 스크롤
                        document.getElementById('skills').scrollIntoView({
                            behavior: 'smooth'
                        });

                        if (!skills_shown) {
                            skills_shown = true;
                            setTimeout(() => {
                                skills_items.forEach((item, index) => {
                                    const delay = parseFloat(item.dataset.delay) * 1000;
                                    setTimeout(() => {
                                        item.classList.add('falling');
                                    }, delay);
                                });
                            }, 500);
                        }
                    }, 1200);
                }
            }

            requestAnimationFrame(animate);
        }
    }, { passive: true });
}

document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        if (href.startsWith('#')) {
            e.preventDefault();

            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');

            const target_id = href.substring(1);
            const target_element = document.getElementById(target_id);

            if (target_element) {
                target_element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});