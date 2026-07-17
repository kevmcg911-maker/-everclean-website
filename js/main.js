const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');

const setHeaderState = () => {
  header?.classList.toggle('is-stuck', window.scrollY > 24);
};

setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('menu-open', isOpen);
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');
  });
});

const quoteChat = document.querySelector('[data-quote-chat]');
const quoteOptions = document.querySelector('[data-quote-options]');
const quoteContinue = document.querySelector('[data-quote-continue]');

quoteOptions?.querySelectorAll('button').forEach((button) => {
  button.addEventListener('click', () => {
    const service = button.dataset.service;
    quoteChat.insertAdjacentHTML('beforeend', `<p class="chat-bubble chat-bubble-user">${service}</p><p class="chat-bubble chat-bubble-bot">Great. Select “Continue to enquiry” and tell us a little about the property. You can include photos when we reply.</p>`);
    quoteOptions.hidden = true;
    quoteContinue.hidden = false;
  });
});

document.querySelector('[data-contact-form]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const note = document.querySelector('[data-form-note]');
  note.textContent = 'Thanks — your enquiry is ready. We’ll connect this form to EverClean’s inbox before launch.';
  note.classList.add('is-success');
});

document.querySelector('[data-current-year]').textContent = new Date().getFullYear();
