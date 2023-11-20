const hideDOMElements = (elements) => {
  elements.forEach(element => {
    if(element instanceof HTMLElement) {
      element.classList.add('hidden');
    } else throw new Error('hideDOMElements function should accept only HTMLElements ');
  });
}

const showDOMElements = (elements) => {
  elements.forEach(element => {
    if(element instanceof HTMLElement) {
      element.classList.remove('hidden');
    } else throw new Error('showDOMElements function should accept only HTMLElements ');
  });
}

const generateValue = (maxValue) => {
  const numbers = Array.from({length: maxValue}, (_, index) => index);
  return [...numbers, ...numbers].sort(() => Math.random() - 0.5);
}
