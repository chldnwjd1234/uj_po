// 플래시라이트 요소
const flashlight = document.querySelector('.flashlight');
const starsContainer = document.querySelector('.stars-container');

// 마우스 위치 추적
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// 부드러운 움직임을 위한 변수
let currentX = mouseX;
let currentY = mouseY;

// 마우스 이동 이벤트
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// 플래시라이트 부드럽게 따라가기
function updateFlashlight() {
    // 부드러운 따라가기 효과 (easing)
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;

    flashlight.style.left = currentX + 'px';
    flashlight.style.top = currentY + 'px';

    requestAnimationFrame(updateFlashlight);
}

// 애니메이션 시작
updateFlashlight();

// 별/빛 효과 생성
function createStars() {
    // 큰 빛 (오른쪽 상단 근처)
    const mainLight = document.createElement('div');
    mainLight.className = 'star main-light';
    mainLight.style.right = '15%';
    mainLight.style.top = '35%';
    starsContainer.appendChild(mainLight);

    // 별들의 위치 배열 (화면 전체에 분산)
    const starPositions = [
        { x: '10%', y: '15%', size: 'large' },
        { x: '15%', y: '45%', size: 'medium' },
        { x: '8%', y: '70%', size: 'small' },
        { x: '25%', y: '25%', size: 'medium' },
        { x: '35%', y: '10%', size: 'large' },
        { x: '45%', y: '30%', size: 'medium' },
        { x: '55%', y: '15%', size: 'large' },
        { x: '65%', y: '35%', size: 'medium' },
        { x: '75%', y: '18%', size: 'large' },
        { x: '85%', y: '25%', size: 'small' },
        { x: '80%', y: '55%', size: 'medium' },
        { x: '90%', y: '45%', size: 'small' },
        { x: '20%', y: '80%', size: 'medium' },
        { x: '40%', y: '75%', size: 'small' },
        { x: '60%', y: '85%', size: 'medium' },
        { x: '12%', y: '60%', size: 'small' },
        { x: '88%', y: '70%', size: 'large' },
        { x: '30%', y: '50%', size: 'small' },
        { x: '70%', y: '60%', size: 'medium' },
        { x: '50%', y: '40%', size: 'small' },
    ];

    // 별 생성
    starPositions.forEach((pos, index) => {
        const star = document.createElement('div');
        star.className = `star ${pos.size}`;
        star.style.left = pos.x;
        star.style.top = pos.y;
        star.style.animationDelay = `${index * 0.2}s`;
        starsContainer.appendChild(star);
    });

    // 추가 작은 별들 (배경)
    for (let i = 0; i < 30; i++) {
        const miniStar = document.createElement('div');
        miniStar.className = 'star small';
        miniStar.style.left = Math.random() * 100 + '%';
        miniStar.style.top = Math.random() * 100 + '%';
        miniStar.style.animationDelay = Math.random() * 3 + 's';
        miniStar.style.opacity = Math.random() * 0.5 + 0.2;
        starsContainer.appendChild(miniStar);
    }
}

// 페이지 로드 시 별 생성
createStars();

// 터치 디바이스 지원
document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
}, { passive: true });

// 초기 위치 설정
flashlight.style.left = currentX + 'px';
flashlight.style.top = currentY + 'px';

// 윈도우 리사이즈 대응
window.addEventListener('resize', () => {
    // 별 위치 재조정은 자동으로 퍼센트 단위로 처리됨
});

// 텍스트가 플래시라이트에 반응하도록 (선택사항)
const titleParts = document.querySelectorAll('.title-part');
const subtitleParts = document.querySelectorAll('.subtitle span');

function updateTextBrightness() {
    const contentElement = document.querySelector('.content');
    const contentRect = contentElement.getBoundingClientRect();
    const contentCenterX = contentRect.left + contentRect.width / 2;
    const contentCenterY = contentRect.top + contentRect.height / 2;

    // 플래시라이트와 콘텐츠 중심 사이의 거리
    const distance = Math.sqrt(
        Math.pow(currentX - contentCenterX, 2) +
        Math.pow(currentY - contentCenterY, 2)
    );

    // 거리에 따라 밝기 조정 (거리가 가까울수록 밝게)
    const maxDistance = 500;
    const brightness = Math.max(0, 1 - distance / maxDistance);

    // 텍스트에 밝기 적용
    titleParts.forEach(part => {
        if (part.classList.contains('dark')) {
            const opacity = 0.15 + (brightness * 0.3);
            part.style.color = `rgba(255, 255, 255, ${opacity})`;
        }
    });

    subtitleParts.forEach(part => {
        if (part.classList.contains('subtitle-dark')) {
            const opacity = 0.25 + (brightness * 0.3);
            part.style.color = `rgba(255, 255, 255, ${opacity})`;
        }
    });

    requestAnimationFrame(updateTextBrightness);
}

// 텍스트 밝기 업데이트 시작
updateTextBrightness();

console.log('Portfolio loaded successfully!');