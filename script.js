// Get all the scene divs
const scenes = document.querySelectorAll('.scene');

// Get all the lobby signs
const signs = document.querySelectorAll('.sign');

// Get all the back buttons
const backButtons = document.querySelectorAll('.back-button');

// Function to switch to a different scene
function goToScene(sceneId) {
  scenes.forEach(scene => {
    if (scene.id === sceneId) {
      scene.classList.add('active');
    } else {
      scene.classList.remove('active');
    }
  });
}

// When a sign is clicked, go to that room
signs.forEach(sign => {
  sign.addEventListener('click', () => {
    const room = sign.dataset.room;
    goToScene(room);
  });
});

// When a back button is clicked, return to the lobby
backButtons.forEach(button => {
  button.addEventListener('click', () => {
    goToScene('lobby');
  });
});

// STUDY CARDS — expand on click, close on backdrop click
const studyCards = document.querySelectorAll('.study-card');
const studyBackdrop = document.querySelector('.study-backdrop');

studyCards.forEach(card => {
  card.addEventListener('click', () => {
    // If already expanded, do nothing (close button handles it)
    if (card.classList.contains('expanded')) return;

    // Add close button if it doesn't exist
    if (!card.querySelector('.card-close')) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'card-close';
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeCard(card);
      });
      card.appendChild(closeBtn);
    }

    card.classList.add('expanded');
    studyBackdrop.classList.add('active');
  });
});

studyBackdrop.addEventListener('click', () => {
  const expandedCard = document.querySelector('.study-card.expanded');
  if (expandedCard) closeCard(expandedCard);
});

function closeCard(card) {
  card.classList.remove('expanded');
  studyBackdrop.classList.remove('active');
}


// LETTERS FORM — submit via fetch so we don't leave the page
const letterForm = document.querySelector('.letter');
const letterStatus = document.querySelector('.letter-status');
const letterButton = document.querySelector('.letter-send');

if (letterForm) {
  letterForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    letterButton.disabled = true;
    letterButton.textContent = 'Sending…';
    letterStatus.textContent = '';
    letterStatus.className = 'letter-status';

    try {
      const response = await fetch(letterForm.action, {
        method: 'POST',
        body: new FormData(letterForm),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        letterForm.reset();
        letterStatus.textContent = 'Your letter has been sealed and sent. Thank you. ✦';
        letterStatus.classList.add('success');
        letterButton.textContent = 'Seal & Send →';
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      letterStatus.textContent = 'Something went wrong. Please try again or email me directly.';
      letterStatus.classList.add('error');
      letterButton.textContent = 'Seal & Send →';
    } finally {
      letterButton.disabled = false;
    }
  });
}

// MOBILE LOBBY CAROUSEL
const carouselTrack = document.querySelector('.carousel-track');
const dots = document.querySelectorAll('.carousel-dots .dot');
const carouselSlides = document.querySelectorAll('.carousel-slide');

let currentSlide = 0;
let touchStartX = 0;
let touchEndX = 0;

function goToSlide(index) {
  if (!carouselTrack) return;
  currentSlide = Math.max(0, Math.min(2, index));
  carouselTrack.style.transform = `translateX(-${currentSlide * 33.333}%)`;
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

// Dot click navigation
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => goToSlide(i));
});

// Swipe detection on the carousel
if (carouselTrack) {
  carouselTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carouselTrack.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToSlide(currentSlide + 1); // swipe left → next
      else goToSlide(currentSlide - 1); // swipe right → previous
    }
  }, { passive: true });
}

// Mobile signs trigger same room navigation as desktop signs
document.querySelectorAll('.mobile-sign').forEach(sign => {
  sign.addEventListener('click', () => {
    const room = sign.dataset.room;
    goToScene(room);
  });
});