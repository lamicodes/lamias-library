// Get all the scene divs
const scenes = document.querySelectorAll('.scene');

// Get all the lobby signs
const signs = document.querySelectorAll('.sign');

// Get all the back buttons
const backButtons = document.querySelectorAll('.back-button');

// Function to switch to a different scene
function goToScene(sceneId) {
  closeDetailPanel();
  const nextScene = document.getElementById(sceneId);
  // Only the lobby art loads at startup. Request the next room's artwork
  // when a visitor actually chooses it, avoiding multiple large downloads.
  if (nextScene) {
    const source = nextScene.querySelector('picture source[data-srcset]');
    const image = nextScene.querySelector('img.scene-image[data-src]');
    if (source) {
      source.srcset = source.dataset.srcset;
      source.removeAttribute('data-srcset');
    }
    if (image) {
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    }
  }
  scenes.forEach(scene => {
    if (scene.id === sceneId) {
      scene.classList.add('active');
      scene.removeAttribute('inert');
    } else {
      scene.classList.remove('active');
      scene.setAttribute('inert', '');
    }
  });
}

// Inactive scenes should not receive keyboard focus.
scenes.forEach(scene => {
  if (!scene.classList.contains('active')) scene.setAttribute('inert', '');
});

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

// Study and Atrium cards open one independent detail dialog on every screen.
// This avoids stacking and scrolling bugs caused by expanding cards in-place.
const studyCards = document.querySelectorAll('.study-card');
const detailPanel = document.querySelector('.mobile-panel');
const detailBackdrop = document.querySelector('.mobile-panel-backdrop');
const detailPanelContent = document.querySelector('.mobile-panel-content');
const detailPanelSection = document.querySelector('.mobile-panel-section');
const detailPanelClose = document.querySelector('.mobile-panel-close');
let panelTrigger = null;

function isMobileLayout() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function openDetailPanel(card) {
  const full = card.querySelector('.study-card-full');
  const section = card.closest('.scene');
  const sectionName = section.id === 'atrium' ? 'THE ATRIUM' : 'THE STUDY';
  const previewName = card.querySelector('.study-card-preview .card-title').textContent.trim();

  panelTrigger = card;
  detailPanelSection.textContent = `${sectionName} · ${previewName}`;
  detailPanelContent.innerHTML = full.innerHTML;
  // Repository links should be visible immediately, without another click.
  if (card.dataset.card === 'projects') {
    detailPanelContent.querySelectorAll('.project-item').forEach(item => { item.open = true; });
  }
  const heading = detailPanelContent.querySelector('.card-title');
  if (heading) heading.id = 'mobile-panel-title';
  detailPanel.hidden = false;
  detailBackdrop.hidden = false;
  document.body.classList.add('dialog-open');
  detailPanel.scrollTop = 0;
  detailPanel.focus();
}

function closeDetailPanel() {
  if (!detailPanel || detailPanel.hidden) return;
  detailPanel.hidden = true;
  detailBackdrop.hidden = true;
  document.body.classList.remove('dialog-open');
  detailPanelContent.innerHTML = '';
  if (panelTrigger && panelTrigger.closest('.scene.active')) panelTrigger.focus();
  panelTrigger = null;
}

detailPanelClose.addEventListener('click', closeDetailPanel);
detailBackdrop.addEventListener('click', closeDetailPanel);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeDetailPanel();
  }
  // The overlay is a dialog: keep keyboard focus inside it while open.
  if (event.key === 'Tab' && !detailPanel.hidden) {
    const focusable = Array.from(detailPanel.querySelectorAll('a[href], button:not([disabled]), summary, input, textarea')).filter(el => el.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === detailPanel)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }
});

studyCards.forEach(card => {
  // Existing div cards behave as accessible buttons on both layouts.
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Open ${card.querySelector('.study-card-preview .card-title').textContent.trim()}`);
  card.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target === card) {
      event.preventDefault(); card.click();
    }
  });
  card.addEventListener('click', (event) => {
    if (event.target.closest('a, button, summary')) return;
    openDetailPanel(card);
  });
});

let lastMobileLayout = isMobileLayout();
window.addEventListener('resize', () => {
  const nowMobile = isMobileLayout();
  if (nowMobile !== lastMobileLayout) {
    closeDetailPanel();
    lastMobileLayout = nowMobile;
  }
});


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

