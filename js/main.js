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

const quoteForm = document.querySelector('[data-quote-form]');

if (quoteForm) {
  let quoteStep = 1;
  const steps = [...quoteForm.querySelectorAll('[data-quote-step]')];
  const progress = quoteForm.querySelector('[data-quote-progress]');
  const showStep = (step) => {
    quoteStep = step;
    steps.forEach((panel) => { panel.hidden = Number(panel.dataset.quoteStep) !== step; });
    progress.textContent = `Step ${step} of 3`;
  };
  quoteForm.querySelectorAll('[data-quote-choice]').forEach((choice) => choice.addEventListener('click', () => {
    const field = choice.dataset.quoteChoice;
    const value = choice.dataset.value;
    quoteForm.querySelector(`[data-quote-value="${field}"]`).value = value;
    quoteForm.querySelectorAll(`[data-quote-choice="${field}"]`).forEach((option) => option.classList.toggle('is-selected', option === choice));
  }));
  const validateStep = (step) => {
    const panel = quoteForm.querySelector(`[data-quote-step="${step}"]`);
    const choices = [...panel.querySelectorAll('[data-quote-value]')];
    const choicesValid = choices.every((field) => field.value !== '');
    const otherFieldsValid = [...panel.querySelectorAll('[required]:not([type="hidden"])')].every((field) => field.reportValidity());
    return choicesValid && otherFieldsValid;
  };
  quoteForm.querySelectorAll('[data-quote-next]').forEach((button) => button.addEventListener('click', () => {
    if (validateStep(quoteStep)) showStep(Math.min(quoteStep + 1, 3));
    else quoteForm.querySelector(`[data-quote-step="${quoteStep}"] .quote-choice, [data-quote-step="${quoteStep}"] [required]`)?.focus();
  }));
  quoteForm.querySelectorAll('[data-quote-back]').forEach((button) => button.addEventListener('click', () => showStep(Math.max(quoteStep - 1, 1))));
}

document.querySelector('[data-current-year]').textContent = new Date().getFullYear();
