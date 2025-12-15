console.log('Script loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');

    window.scrollTo(0, 0);
    document.body.classList.add('scroll_locked');

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    create_stars();
    setup_custom_cursor();
    setup_svg_spotlight();
    setup_scroll_effects();
    setup_nav_active();
    setup_gsap_transitions();
});

// ========== 별 생성 ==========
function create_stars() {
    const stars_containers = document.querySelectorAll('.stars_container');
    console.log('Stars containers found:', stars_containers.length);

    stars_containers.forEach((container, index) => {
        let star_count = 15;

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
    const buttons = document.querySelectorAll('button');

    if (!cursor) {
        console.warn('Cursor element not found');
        return;
    }

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

    links.forEach(link => {
        link.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        link.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        btn.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// ========== SVG Spotlight ==========
function setup_svg_spotlight() {
    const spotlight_circle = document.getElementById('spotlight_circle');
    const mouse_light = document.querySelector('.mouse_light');
    const hero_section = document.querySelector('.hero_section');

    if (!spotlight_circle || !mouse_light || !hero_section) {
        console.warn('Spotlight elements not found');
        return;
    }

    let mouse_x = window.innerWidth / 2;
    let mouse_y = window.innerHeight / 2;

    hero_section.addEventListener('mousemove', (e) => {
        mouse_x = e.clientX;
        mouse_y = e.clientY;

        if (typeof gsap !== 'undefined') {
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
        }
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

    if (!hero_section) {
        console.warn('Hero section not found');
        return;
    }

    let mask_revealed = false;

    window.addEventListener('wheel', (e) => {
        if (mask_revealed || !spotlight_circle) return;

        if (e.deltaY > 0) {
            mask_revealed = true;

            body.classList.remove('scroll_locked');
            if (cursor) cursor.classList.add('small');
            if (mouse_light) mouse_light.classList.add('small');

            if (typeof gsap !== 'undefined') {
                const tl = gsap.timeline({
                    onComplete: () => {
                        // Hero 애니메이션 완료
                        if (scroll_indicator) scroll_indicator.style.display = 'none';
                    }
                });

                tl.to(spotlight_circle, {
                    duration: 2,
                    attr: { r: 5200 },
                    ease: "power3.out"
                })
                    .to(scroll_indicator, {
                        duration: 2,
                        opacity: 0,
                        ease: "power2.out"
                    }, 0);
            }
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

            if (target_element && typeof gsap !== 'undefined') {
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

    if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
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
    }

    function updateNav() {
        nav_links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    updateNav();
}

// ========== GSAP 트랜지션 설정 ==========
function setup_gsap_transitions() {
    const works_section = document.querySelector('.works_section');
    const light_overlay = document.querySelector('.light_overlay');
    const works_title = document.querySelector('.works_section .section_title');
    const works_content = document.querySelector('.works_content');

    console.log('Works section:', works_section);

    if (!works_section || !works_title || !works_content || !light_overlay) {
        console.error('Required elements not found');
        return;
    }

    if (typeof gsap === 'undefined' || !gsap.registerPlugin) {
        console.error('GSAP not loaded properly');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);
    console.log('GSAP registered');

    // 초기 상태 설정 - 완전히 숨김
    gsap.set(works_title, { opacity: 0, visibility: 'hidden' });
    gsap.set(works_content, { opacity: 0 });
    gsap.set(light_overlay, { width: 0, height: 0, opacity: 0 });

    // 타이틀 등장 애니메이션 - Works 섹션 거의 도달했을 때
    gsap.to(works_title, {
        opacity: 1,
        visibility: 'visible',
        scrollTrigger: {
            trigger: works_section,
            start: "top 20%",
            end: "top top",
            scrub: 1,
            onEnter: () => console.log('Title appearing'),
            onLeaveBack: () => {
                gsap.set(works_title, { visibility: 'hidden' });
            }
        }
    });

    // Works 섹션 pin 및 메인 애니메이션 - 속도 느리게
    ScrollTrigger.create({
        trigger: works_section,
        start: "top top",
        end: "+=400vh",
        pin: true,
        scrub: 2,
        onUpdate: (self) => {
            const progress = self.progress;
            console.log('Progress:', progress.toFixed(2));

            // 0 ~ 0.5: 빛 퍼짐 + 타이틀 사라짐 (더 길게)
            if (progress < 0.5) {
                const stepProgress = progress / 0.5;

                // 빛 퍼짐 - 최대 불투명도 0.6으로 낮춤
                gsap.to(light_overlay, {
                    width: `${stepProgress * 200}vw`,
                    height: `${stepProgress * 200}vw`,
                    opacity: stepProgress * 0.6,
                    duration: 0.1
                });

                // 타이틀 사라짐
                gsap.to(works_title, {
                    opacity: 1 - stepProgress,
                    duration: 0.1
                });

                // 프로젝트는 숨김
                gsap.to(works_content, {
                    opacity: 0,
                    duration: 0.1
                });
            }
            // 0.5 ~ 1: 빛 사라짐 + 프로젝트 등장 (더 길게)
            else {
                const stepProgress = (progress - 0.5) / 0.5;

                // 빛 사라짐
                gsap.to(light_overlay, {
                    width: `${200 * (1 - stepProgress)}vw`,
                    height: `${200 * (1 - stepProgress)}vw`,
                    opacity: 0.6 * (1 - stepProgress),
                    duration: 0.1
                });

                // 프로젝트 등장
                gsap.to(works_content, {
                    opacity: stepProgress,
                    duration: 0.1
                });

                // 타이틀 완전히 숨김
                gsap.to(works_title, {
                    opacity: 0,
                    duration: 0.1
                });
            }
        },
        onEnter: () => {
            // Momentum Slider 초기화
            setup_momentum_slider();
        }
    });
}

// ========== Momentum Slider 설정 ==========
function setup_momentum_slider() {
    if (typeof MomentumSlider === 'undefined') {
        console.error('MomentumSlider not loaded');
        return;
    }

    const slidersContainer = document.querySelector('.sliders-container');
    if (!slidersContainer) {
        console.error('Sliders container not found');
        return;
    }

    // 프로젝트 데이터
    const projects = [
        {
            number: '01',
            category: 'WEB DESIGN / DEVELOPMENT',
            title: 'Urban Design',
            link: 'View Project'
        },
        {
            number: '02',
            category: 'MOBILE APP / UI DESIGN',
            title: 'Digital Experience',
            link: 'View Project'
        },
        {
            number: '03',
            category: 'BRANDING / IDENTITY',
            title: 'Creative Vision',
            link: 'View Project'
        },
        {
            number: '04',
            category: 'INTERFACE DESIGN',
            title: 'Modern Interface',
            link: 'View Project'
        }
    ];

    // Numbers Slider
    const msNumbers = new MomentumSlider({
        el: slidersContainer,
        cssClass: 'ms--numbers',
        range: [0, 3],
        rangeContent: function (i) {
            return projects[i].number;
        },
        style: {
            transform: [{ scale: [0.4, 1] }],
            opacity: [0, 1]
        },
        interactive: false
    });

    // Categories Slider
    const msCategories = new MomentumSlider({
        el: slidersContainer,
        cssClass: 'ms--categories',
        range: [0, 3],
        rangeContent: function (i) {
            return projects[i].category;
        },
        vertical: true,
        reverse: true,
        style: {
            opacity: [0, 1]
        },
        interactive: false
    });

    // Titles Slider
    const msTitles = new MomentumSlider({
        el: slidersContainer,
        cssClass: 'ms--titles',
        range: [0, 3],
        rangeContent: function (i) {
            return '<h3>' + projects[i].title + '</h3>';
        },
        vertical: true,
        reverse: true,
        style: {
            opacity: [0, 1]
        },
        interactive: false
    });

    // Links Slider
    const msLinks = new MomentumSlider({
        el: slidersContainer,
        cssClass: 'ms--links',
        range: [0, 3],
        rangeContent: function (i) {
            return '<a class="ms-slide__link">' + projects[i].link + '</a>';
        },
        vertical: true,
        interactive: false
    });

    // Pagination
    const pagination = document.querySelector('.pagination');
    const paginationItems = [].slice.call(pagination.children);

    // Images Slider
    const msImages = new MomentumSlider({
        el: slidersContainer,
        cssClass: 'ms--images',
        range: [0, 3],
        rangeContent: function () {
            return '<div class="ms-slide__image-container"><div class="ms-slide__image"></div></div>';
        },
        sync: [msNumbers, msCategories, msTitles, msLinks],
        style: {
            '.ms-slide__image': {
                transform: [{ scale: [1.5, 1] }]
            }
        },
        change: function (newIndex, oldIndex) {
            if (typeof oldIndex !== 'undefined') {
                paginationItems[oldIndex].classList.remove('pagination__item--active');
            }
            paginationItems[newIndex].classList.add('pagination__item--active');
        }
    });

    // Pagination Click Event
    pagination.addEventListener('click', function (e) {
        if (e.target.matches('.pagination__button')) {
            const index = paginationItems.indexOf(e.target.parentNode);
            msImages.select(index);
        }
    });

    console.log('Momentum Slider initialized');
}
