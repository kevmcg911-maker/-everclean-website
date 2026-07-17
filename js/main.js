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
  const validateStep = (step) => {
    const fields = [...quoteForm.querySelectorAll(`[data-quote-step="${step}"] [required]`)];
    const radioNames = [...new Set(fields.filter((field) => field.type === 'radio').map((field) => field.name))];
    const radiosValid = radioNames.every((name) => quoteForm.querySelector(`input[name="${name}"]:checked`));
    const otherFieldsValid = fields.filter((field) => field.type !== 'radio').every((field) => field.reportValidity());
    return radiosValid && otherFieldsValid;
  };
  quoteForm.querySelectorAll('[data-quote-next]').forEach((button) => button.addEventListener('click', () => {
    if (validateStep(quoteStep)) showStep(Math.min(quoteStep + 1, 3));
    else quoteForm.querySelector(`[data-quote-step="${quoteStep}"] [required]`)?.focus();
  }));
  quoteForm.querySelectorAll('[data-quote-back]').forEach((button) => button.addEventListener('click', () => showStep(Math.max(quoteStep - 1, 1))));
}

document.querySelectorAll('.ajax-form').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const note = form.querySelector('[data-form-note]');
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    note.textContent = 'Sending your enquiry…';
    note.classList.remove('is-success');
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'We could not send your enquiry.');
      form.reset();
      if (form === quoteForm) showStep(1);
      note.textContent = 'Thank you — we’ve received your enquiry and will be in touch shortly.';
      note.classList.add('is-success');
    } catch (error) {
      note.textContent = 'Sorry, the form could not send. Please call 07730 875 107 or email kevin@evercleanwcs.co.uk.';
    } finally {
      submit.disabled = false;
    }
  });
});

document.querySelector('[data-current-year]').textContent = new Date().getFullYear();
