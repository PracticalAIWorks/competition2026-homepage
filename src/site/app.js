const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.primary-nav');
const navLinks = [...document.querySelectorAll('.primary-nav a')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navigation.classList.toggle('is-open', !open);
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

const revealElements = document.querySelectorAll('.reveal');
const isFigmaCapture = new URLSearchParams(window.location.hash.slice(1)).has('figmacapture')
  || window.location.hash.includes('figmacapture');
if (isFigmaCapture || reduceMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => revealObserver.observe(element));
}

const counters = document.querySelectorAll('[data-count]');
const animateCounter = (counter) => {
  const total = Number(counter.dataset.count);
  if (reduceMotion) {
    counter.textContent = String(total);
    return;
  }
  const start = performance.now();
  const duration = 900;
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = String(Math.round(total * eased));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

if (isFigmaCapture || reduceMotion) {
  counters.forEach((counter) => {
    counter.textContent = counter.dataset.count;
  });
} else if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.7 });
  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach(animateCounter);
}

if ('IntersectionObserver' in window) {
  const sections = [...document.querySelectorAll('main section[id]')];
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('is-active', link.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: '-35% 0px -55%', threshold: 0 });
  sections.forEach((section) => navObserver.observe(section));
}

/* 整页轮播：自动向下滚动依次展示各区块，每段停留 5 秒，到底后回到顶部继续循环。 */
const carouselToggle = document.querySelector('.carousel-toggle');
if (carouselToggle) {
  const carouselSections = [...document.querySelectorAll('main > section')];
  const carouselDwellMs = 5000;
  let carouselRunning = false;
  let carouselTimer = 0;
  let carouselIndex = 0;

  const carouselTargetTop = (index) => Math.max(0,
    carouselSections[index].getBoundingClientRect().top + window.scrollY - document.querySelector('.site-header').offsetHeight);

  const detectCarouselIndex = () => {
    let index = 0;
    carouselSections.forEach((section, order) => {
      if (carouselTargetTop(order) <= window.scrollY + 4) index = order;
    });
    return index;
  };

  const settleCarouselScroll = () => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.removeEventListener('scrollend', finish);
      startCarouselDwell();
    };
    window.addEventListener('scrollend', finish);
    setTimeout(finish, 1600);
  };

  const startCarouselDwell = () => {
    if (!carouselRunning) return;
    clearTimeout(carouselTimer);
    carouselTimer = setTimeout(() => {
      carouselIndex = (carouselIndex + 1) % carouselSections.length;
      if (carouselIndex === 0) {
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo({ top: 0 });
        document.documentElement.style.scrollBehavior = '';
      } else {
        window.scrollTo({ top: carouselTargetTop(carouselIndex), behavior: 'smooth' });
      }
      settleCarouselScroll();
    }, carouselDwellMs);
  };

  const setCarousel = (running) => {
    carouselRunning = running;
    clearTimeout(carouselTimer);
    carouselToggle.setAttribute('aria-pressed', String(running));
    carouselToggle.querySelector('.carousel-state').textContent = running ? '轮播中' : '已暂停';
    if (running) {
      carouselIndex = detectCarouselIndex();
      startCarouselDwell();
    }
  };

  carouselToggle.addEventListener('click', () => setCarousel(!carouselRunning));

  const stopCarousel = () => {
    if (carouselRunning) setCarousel(false);
  };
  window.addEventListener('wheel', stopCarousel, { passive: true });
  window.addEventListener('touchmove', stopCarousel, { passive: true });
  window.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) stopCarousel();
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('.carousel-toggle')) return;
    if (event.target.closest('a, button')) stopCarousel();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(carouselTimer);
    else if (carouselRunning) startCarouselDwell();
  });

  const carouselParam = new URLSearchParams(window.location.search).get('carousel');
  setCarousel(!isFigmaCapture && !['0', 'off'].includes(carouselParam));
}
