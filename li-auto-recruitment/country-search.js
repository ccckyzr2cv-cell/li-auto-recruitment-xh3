/* ============================================================
   Country of Residence — searchable country / region menu
   ============================================================ */
(() => {
  const picker = document.getElementById('countryPicker');
  const select = document.getElementById('country');
  const input = document.getElementById('countrySearch');
  const menu = document.getElementById('countryOptions');
  const label = document.getElementById('countryLabel');
  if (!picker || !select || !input || !menu) return;

  const normalize = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
  let chineseNames;
  try {
    chineseNames = new Intl.DisplayNames(['zh-Hans'], { type: 'region' });
  } catch {
    // The English names and ISO codes still work on older browsers.
  }
  const aliases = {
    GB: ['UK', 'Britain', 'Great Britain', '英国'],
    US: ['USA', 'United States of America', '美国'],
    AE: ['UAE', '阿联酋'],
    KR: ['South Korea', '韩国'],
    KP: ['North Korea', '朝鲜'],
    CN: ['China', '中国'],
    TR: ['Turkey'],
    CZ: ['Czech Republic'],
    CI: ['Ivory Coast'],
    CV: ['Cape Verde'],
    SZ: ['Swaziland'],
    TW: ['Taiwan', '台湾', '中国台湾'],
    HK: ['Hong Kong', '香港', '中国香港'],
    MO: ['Macao', 'Macau', '澳门', '中国澳门']
  };
  const countries = Array.from(select.options).filter(option => option.value).map(option => ({
    value: option.value,
    code: option.dataset.code,
    terms: [option.value, option.dataset.code, chineseNames?.of(option.dataset.code) || '', ...(aliases[option.dataset.code] || [])].map(normalize)
  }));
  let results = [];
  let activeIndex = -1;

  function closeMenu() {
    menu.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    activeIndex = -1;
  }

  function setActive(index) {
    activeIndex = index;
    Array.from(menu.children).forEach((option, i) => {
      option.classList.toggle('is-active', i === index);
    });
    const option = menu.children[index];
    if (option && results.length) {
      input.setAttribute('aria-activedescendant', option.id);
      option.scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  }

  function render(query = '') {
    const term = normalize(query);
    results = countries.filter(country => country.terms.some(name => name.includes(term)));
    menu.replaceChildren();
    results.forEach((country, index) => {
      const option = document.createElement('div');
      option.id = `country-option-${country.code}`;
      option.className = 'country-search__option';
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', String(country.value === select.value));
      option.dataset.index = String(index);
      option.textContent = country.value;
      menu.append(option);
    });
    if (!results.length) {
      const empty = document.createElement('div');
      empty.className = 'country-search__empty';
      empty.setAttribute('role', 'status');
      empty.textContent = 'No matching countries / regions. Try another name or code.';
      menu.append(empty);
    }
    menu.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    setActive(-1);
  }

  function validateSelection() {
    const term = normalize(input.value);
    const country = term ? countries.find(item => item.terms.includes(term)) : null;
    select.value = country?.value || '';
    input.setCustomValidity(country || !term ? '' : 'Please select a country / region from the list.');
    return country;
  }

  function choose(country) {
    select.value = country.value;
    input.value = country.value;
    input.setCustomValidity('');
    closeMenu();
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function syncSelection() {
    input.value = select.value;
    input.setCustomValidity('');
    closeMenu();
  }

  input.addEventListener('focus', () => {
    render();
    input.select();
  });
  input.addEventListener('click', () => {
    if (menu.hidden) render();
  });
  input.addEventListener('input', () => {
    validateSelection();
    render(input.value);
  });
  input.addEventListener('blur', () => {
    const country = validateSelection();
    if (country) input.value = country.value;
    closeMenu();
  });
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (menu.hidden) render(input.value === select.value ? '' : input.value);
      if (!results.length) return;
      const next = event.key === 'ArrowDown'
        ? (activeIndex + 1) % results.length
        : (activeIndex < 0 ? results.length - 1 : (activeIndex - 1 + results.length) % results.length);
      setActive(next);
    } else if (event.key === 'Enter' && !menu.hidden) {
      event.preventDefault();
      if (activeIndex >= 0) choose(results[activeIndex]);
      else {
        const country = validateSelection();
        if (country) choose(country);
        else if (results.length === 1) choose(results[0]);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
    }
  });
  menu.addEventListener('pointerdown', event => {
    if (event.target.closest('[role="option"]')) event.preventDefault();
  });
  menu.addEventListener('click', event => {
    const option = event.target.closest('[role="option"]');
    if (option) choose(results[Number(option.dataset.index)]);
  });
  document.addEventListener('pointerdown', event => {
    if (!picker.contains(event.target)) closeMenu();
  });
  select.addEventListener('change', syncSelection);
  select.form.addEventListener('reset', () => setTimeout(syncSelection, 0));
  window.addEventListener('pageshow', syncSelection);

  select.required = false;
  select.hidden = true;
  input.hidden = false;
  input.required = true;
  label.htmlFor = input.id;
  syncSelection();
})();
