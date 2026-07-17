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
  const propertyQuestion = quoteForm.querySelector('[data-property-question]');
  const propertyHelper = quoteForm.querySelector('[data-property-helper]');
  const conservatoryOption = quoteForm.querySelector('[data-conservatory-option]');
  const conservatory = quoteForm.querySelector('[name="conservatory"]');
  const estimatePanel = quoteForm.querySelector('[data-estimate-panel]');
  const estimatePrice = quoteForm.querySelector('[data-estimate-price]');
  const estimateValue = quoteForm.querySelector('[data-estimate-value]');
  const propertyInput = quoteForm.querySelector('[data-quote-value="property_type"]');
  const propertyChoices = [...quoteForm.querySelectorAll('[data-property-slot]')];

  const windowPropertyOptions = [
    ['Front only', 'Front only'],
    ['2-bedroom house', '2-bedroom house'],
    ['3-bedroom house', '3-bedroom house'],
    ['4-bedroom house', '4-bedroom house'],
    ['Townhouse', 'Townhouse'],
    ['Other property', 'Other property'],
  ];
  const generalPropertyOptions = [
    ['Detached house', 'Detached house'],
    ['Semi-detached house', 'Semi-detached house'],
    ['Terrace / townhouse', 'Terrace or townhouse'],
    ['Bungalow', 'Bungalow'],
    ['Flat / apartment', 'Flat or apartment'],
    ['Commercial property', 'Commercial property'],
  ];

  const setPropertyOptions = (options) => {
    propertyInput.value = '';
    propertyChoices.forEach((choice, index) => {
      choice.textContent = options[index][0];
      choice.dataset.value = options[index][1];
      choice.classList.remove('is-selected');
    });
  };

  const getWindowCleaningEstimate = () => {
    if (quoteForm.querySelector('[data-quote-value="service"]').value !== 'Window cleaning') return '';
    const prices = {
      'Front only': [10, 10],
      '2-bedroom house': [16, 18],
      '3-bedroom house': [16, 18],
      '4-bedroom house': [25, 25],
      Townhouse: [25, 25],
    };
    const base = prices[propertyInput.value];
    if (!base) return '';
    const extra = conservatory.checked ? [5, 8] : [0, 0];
    const low = base[0] + extra[0];
    const high = base[1] + extra[1];
    return low === high ? `£${low}` : `£${low}–£${high}`;
  };

  const showStep = (step) => {
    quoteStep = step;
    steps.forEach((panel) => { panel.hidden = Number(panel.dataset.quoteStep) !== step; });
    progress.textContent = `Step ${step} of 3`;
    if (step === 3) {
      const estimate = getWindowCleaningEstimate();
      estimatePanel.hidden = estimate === '';
      estimatePrice.textContent = estimate;
      estimateValue.value = estimate;
    }
  };
  quoteForm.querySelectorAll('[data-quote-choice]').forEach((choice) => choice.addEventListener('click', () => {
    const field = choice.dataset.quoteChoice;
    const value = choice.dataset.value;
    quoteForm.querySelector(`[data-quote-value="${field}"]`).value = value;
    quoteForm.querySelectorAll(`[data-quote-choice="${field}"]`).forEach((option) => option.classList.toggle('is-selected', option === choice));
    if (field === 'service') {
      const isWindowCleaning = value === 'Window cleaning';
      propertyQuestion.textContent = isWindowCleaning ? 'What size is the property?' : 'Tell us about the property.';
      propertyHelper.textContent = isWindowCleaning
        ? 'Choose the closest match to receive an estimated regular window-cleaning price.'
        : 'Choose the closest match. We’ll use this to prepare the right quote.';
      conservatoryOption.hidden = !isWindowCleaning;
      conservatory.checked = false;
      setPropertyOptions(isWindowCleaning ? windowPropertyOptions : generalPropertyOptions);
    }
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
