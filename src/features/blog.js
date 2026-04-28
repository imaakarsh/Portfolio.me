import { byId, query, queryAll } from '../utils/dom.js';

export function initBlogFiltering() {
  const buttons = queryAll('.blog-tag[data-blog-tag]');
  const cards = queryAll('.blog-card');

  if (buttons.length === 0 || cards.length === 0) {
    console.debug('Blog filtering elements not found');
    return;
  }

  const applyFilter = (button, tag) => {
    buttons.forEach((otherButton) => otherButton.classList.remove('active'));
    button.classList.add('active');

    cards.forEach((card) => {
      if (tag === 'all') {
        card.classList.remove('hidden');
        return;
      }

      const tags = (card.getAttribute('data-tags') ?? '').trim();
      const visible = tags.split(/\s+/).includes(tag);
      card.classList.toggle('hidden', !visible);
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      applyFilter(button, button.dataset.blogTag ?? 'all');
    });
  });
}

export function initBlogShowMore() {
  const button = byId('blog-show-more-btn');
  const countEl = byId('blog-more-count');
  const labelEl = query('.blog-show-more-label');
  const chevron = byId('blog-chevron');
  const collapsedCards = queryAll('.blog-card--collapsed');

  if (!button || !countEl || !labelEl || !chevron || collapsedCards.length === 0) {
    console.debug('Blog show more elements not found');
    return;
  }

  const setExpanded = (expanded) => {
    if (expanded) {
      collapsedCards.forEach((card) => {
        card.style.display = 'flex';
      });
      button.classList.add('expanded');
      chevron.style.transform = 'rotate(180deg)';
      countEl.textContent = '';
      labelEl.textContent = 'Show Less';
      button.setAttribute('aria-expanded', 'true');
      return;
    }

    collapsedCards.forEach((card) => {
      card.style.display = '';
    });
    button.classList.remove('expanded');
    chevron.style.transform = '';
    countEl.textContent = collapsedCards.length > 0 ? `(${collapsedCards.length} more)` : '';
    labelEl.textContent = 'Show More';
    button.setAttribute('aria-expanded', 'false');
  };

  setExpanded(false);
  button.addEventListener('click', () => {
    setExpanded(!button.classList.contains('expanded'));
  });
}
