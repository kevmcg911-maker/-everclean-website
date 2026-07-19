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
  const addOnOption = quoteForm.querySelector('[data-add-on-option]');
  const addOn = quoteForm.querySelector('[data-add-on-input]');
  const addOnLabel = quoteForm.querySelector('[data-add-on-label]');
  const addOnNote = quoteForm.querySelector('[data-add-on-note]');
  const estimatePanel = quoteForm.querySelector('[data-estimate-panel]');
  const estimateLabel = quoteForm.querySelector('[data-estimate-label]');
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
  const gutterSideOptions = [
    ['One side', '1 side'],
    ['Two sides', '2 sides'],
    ['Three sides', '3 sides'],
    ['Four sides', '4 sides'],
    ['Other / larger property', 'Other property'],
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

  const getEstimate = () => {
    const service = quoteForm.querySelector('[data-quote-value="service"]').value;
    if (service === 'Gutter cleaning') {
      const sides = { '1 side': 1, '2 sides': 2, '3 sides': 3, '4 sides': 4 }[propertyInput.value];
      if (!sides) return { price: '', label: '' };
      const price = sides * 35 + (addOn.checked ? sides * 20 : 0);
      return { price: `From \u00A3${price}`, label: 'Starting gutter-cleaning price' };
    }
    if (service !== 'Window cleaning') return { price: '', label: '' };
    const prices = {
      'Front only': [10, 10],
      '2-bedroom house': [16, 18],
      '3-bedroom house': [16, 18],
      '4-bedroom house': [25, 25],
      Townhouse: [25, 25],
    };
    const base = prices[propertyInput.value];
    if (!base) return { price: '', label: '' };
    const extra = addOn.checked ? [5, 8] : [0, 0];
    const low = base[0] + extra[0];
    const high = base[1] + extra[1];
    return {
      price: low === high ? `\u00A3${low}` : `\u00A3${low}\u2013\u00A3${high}`,
      label: 'Estimated regular window-cleaning price',
    };
  };

  const showStep = (step) => {
    quoteStep = step;
    steps.forEach((panel) => { panel.hidden = Number(panel.dataset.quoteStep) !== step; });
    progress.textContent = `Step ${step} of 3`;
    if (step === 3) {
      const estimate = getEstimate();
      estimatePanel.hidden = estimate.price === '';
      estimateLabel.textContent = estimate.label;
      estimatePrice.textContent = estimate.price;
      estimateValue.value = estimate.price;
    }
  };
  quoteForm.querySelectorAll('[data-quote-choice]').forEach((choice) => choice.addEventListener('click', () => {
    const field = choice.dataset.quoteChoice;
    const value = choice.dataset.value;
    quoteForm.querySelector(`[data-quote-value="${field}"]`).value = value;
    quoteForm.querySelectorAll(`[data-quote-choice="${field}"]`).forEach((option) => option.classList.toggle('is-selected', option === choice));
    if (field === 'service') {
      const isWindowCleaning = value === 'Window cleaning';
      const isGutterCleaning = value === 'Gutter cleaning';
      addOnOption.hidden = !isWindowCleaning && !isGutterCleaning;
      addOn.checked = false;

      if (isWindowCleaning) {
        propertyQuestion.textContent = 'What size is the property?';
        propertyHelper.textContent = 'Choose the closest match to receive an estimated regular window-cleaning price.';
        addOnLabel.textContent = 'Include a conservatory';
        addOnNote.textContent = 'Usually an additional \u00A35\u2013\u00A38';
        setPropertyOptions(windowPropertyOptions);
      } else if (isGutterCleaning) {
        propertyQuestion.textContent = 'How many sides need cleaning?';
        propertyHelper.textContent = 'Exterior gutter cleaning starts from \u00A335 per side. Gutter clearance is \u00A320 per side extra.';
        addOnLabel.textContent = 'Include clearing out the gutters';
        addOnNote.textContent = 'Additional \u00A320 per side';
        setPropertyOptions(gutterSideOptions);
      } else {
        propertyQuestion.textContent = 'Tell us about the property.';
        propertyHelper.textContent = 'Choose the closest match. We’ll use this to prepare the right quote.';
        setPropertyOptions(generalPropertyOptions);
      }
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
