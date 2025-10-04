const scrollElements = document.querySelectorAll('.js-scroll');
let countersAnimated = false; // Flag para garantir que a animação de contagem rode apenas uma vez

// ==========================================================
// Funções utilitárias de Scroll
// ==========================================================
const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
        elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
    );
};

const displayScrollElement = (element) => {
    element.classList.add('is-active');
};

// ==========================================================
// Funções de Contagem de Números (Counters)
// ==========================================================
const animateCountUp = (id, targetValue, duration = 2500) => {
    const element = document.getElementById(id);
    if (!element) return;

    const startTimestamp = performance.now();

    const step = (timestamp) => {
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3); // easing cúbico
        const value = Math.floor(easedProgress * targetValue);

        element.textContent = `+${value}`;

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.textContent = `+${targetValue}`;
        }
    };

    requestAnimationFrame(step);
};

const triggerCounters = () => {
    if (countersAnimated) return;

    const painelImpacto = document.getElementById('painel-impacto');
    if (!painelImpacto || !painelImpacto.classList.contains('is-active')) return;

    const counterElements = [
        { id: 'count-alunos', target: 3000 },
        { id: 'count-educadores', target: 2500 },
        { id: 'count-gerentes', target: 50 }
    ];

    counterElements.forEach(item => {
        animateCountUp(item.id, item.target);
    });

    countersAnimated = true;
};

// ==========================================================
// Lógica da Linha do Tempo (Corrigida)
// ==========================================================
const updateTimelineFill = () => {
    const timelineContainer = document.querySelector('.timeline-container');
    const timelineItems = document.querySelectorAll('.timeline-item');

    if (!timelineContainer || timelineItems.length === 0) return;

    const containerRect = timelineContainer.getBoundingClientRect();
    const containerTopAbsolute = containerRect.top + window.scrollY;

    let maxBottom = 0;

    timelineItems.forEach((item) => {
        if (item.classList.contains('is-active')) {
            const rect = item.getBoundingClientRect();
            const itemBottomAbsolute = rect.bottom + window.scrollY;
            maxBottom = Math.max(maxBottom, itemBottomAbsolute);
        }
    });

    let newHeight = 0;
    if (maxBottom > containerTopAbsolute) {
        newHeight = maxBottom - containerTopAbsolute;
    }

    timelineContainer.style.setProperty('--timeline-fill-height', `${newHeight}px`);
};

// Ativa os itens da timeline ao rolar
const activateTimelineItems = () => {
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item) => {
        if (!item.classList.contains('is-active') && elementInView(item, 1.15)) {
            item.classList.add('is-active');
        }
    });
};

// ==========================================================
// Lógica Principal de Scroll
// ==========================================================
const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
        if (!el.classList.contains('is-active') && elementInView(el, 1.25)) {
            displayScrollElement(el);
        }
    });

    activateTimelineItems();
    updateTimelineFill();

    if (!countersAnimated) {
        triggerCounters();
    }
};

window.addEventListener('scroll', handleScrollAnimation);
window.addEventListener('load', handleScrollAnimation);

// ==========================================================
// Outras Funções
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('year').textContent = new Date().getFullYear();

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
            }
        });
    }

    const searchButton = document.getElementById('search-button');
    const closeSearchButton = document.getElementById('close-search-button');
    const contentToggleContainer = document.getElementById('content-toggle-container');
    const searchInput = document.getElementById('search-bar').querySelector('input');

    const openSearchBar = () => {
        contentToggleContainer.classList.add('show-search');
        setTimeout(() => {
            searchInput.focus();
        }, 300);
    };

    const closeSearchBar = () => {
        contentToggleContainer.classList.remove('show-search');
        searchInput.value = '';
    };

    if (searchButton) {
        searchButton.addEventListener('click', openSearchBar);
    }
    if (closeSearchButton) {
        closeSearchButton.addEventListener('click', closeSearchBar);
    }

    document.addEventListener('click', (event) => {
        if (contentToggleContainer && !contentToggleContainer.contains(event.target) && contentToggleContainer.classList.contains('show-search')) {
            closeSearchBar();
        }
    });
});

// ==========================================================
// Carrossel de Logos (Automático e Contínuo)
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('carousel-track');
    const container = document.getElementById('carousel-track-container');
    if (!track || !container) return;

    const slides = Array.from(track.children);
    let totalSlidesWidth = 0;

    function duplicateSlides() {
        const slidesToDuplicate = track.innerHTML;
        track.innerHTML += slidesToDuplicate;
    }

    function calculateTotalWidth() {
        totalSlidesWidth = 0;
        const allSlides = Array.from(track.children);
        allSlides.forEach(slide => {
            totalSlidesWidth += slide.offsetWidth;
        });
        track.style.width = `${totalSlidesWidth}px`;
    }

    let position = 0;
    const speed = 1.0;

    function autoScroll() {
        position -= speed;
        if (position <= -track.scrollWidth / 2) {
            position = 0;
        }
        track.style.transform = `translateX(${position}px)`;
        requestAnimationFrame(autoScroll);
    }

    duplicateSlides();
    calculateTotalWidth();
    setTimeout(autoScroll, 500);

    window.addEventListener('resize', calculateTotalWidth);
    window.addEventListener('load', calculateTotalWidth);

    // ======================================================
    // Carrossel com navegação e paginação
    // ======================================================
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const dotsContainer = document.getElementById('pagination-dots');

    const logosPerView = 6;
    const logoItems = track.children;
    const totalLogos = logoItems.length;
    const totalPages = Math.ceil(totalLogos / logosPerView);
    let currentSlide = 0;

    const createDots = () => {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('button');
            dot.classList.add('w-3', 'h-3', 'rounded-full', 'transition-colors', 'duration-300');
            dot.setAttribute('data-index', i);
            dot.addEventListener('click', () => moveToSlide(i));
            dotsContainer.appendChild(dot);
        }
    };

    const updateCarousel = () => {
        const offset = (currentSlide * logosPerView * 100) / totalLogos;
        track.style.transform = `translateX(-${offset}%)`;

        Array.from(dotsContainer.children).forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add('bg-blue-950');
                dot.classList.remove('bg-gray-300');
            } else {
                dot.classList.add('bg-gray-300');
                dot.classList.remove('bg-blue-950');
            }
        });

        prevButton.disabled = currentSlide === 0;
        nextButton.disabled = currentSlide === totalPages - 1;

        if (currentSlide === 0) {
            prevButton.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            prevButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }

        if (currentSlide === totalPages - 1) {
            nextButton.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    };

    const moveToSlide = (index) => {
        currentSlide = index;
        updateCarousel();
    };

    prevButton.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateCarousel();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentSlide < totalPages - 1) {
            currentSlide++;
            updateCarousel();
        }
    });

    createDots();
    updateCarousel();

const form = document.getElementById('meu-formulario');
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // impede recarregamento

    const data = {
        name: form.name.value,
        email: form.email.value,
        confirm_email: form.confirm_email.value,
        phone: form.phone.value,
        message: form.message.value
    };

    try {
        const response = await fetch('https://formspree.io/f/SEU_ID_AQUI', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Mensagem enviada com sucesso!');
            form.reset();
        } else {
            alert('Erro ao enviar a mensagem. Verifique o ID do Formspree.');
        }
    } catch (err) {
        alert('Erro de conexão.');
    }
});    

});
