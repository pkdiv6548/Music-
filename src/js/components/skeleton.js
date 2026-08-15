export function createSkeletonGrid(count = 8) {
  const grid = document.createElement('div');
  grid.className = 'card-grid skeleton-grid';
  grid.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < count; i += 1) {
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    card.innerHTML = `
      <div class="skeleton skeleton-cover"></div>
      <div class="skeleton skeleton-line short"></div>
      <div class="skeleton skeleton-line"></div>
    `;
    grid.appendChild(card);
  }
  return grid;
}

export function createSkeletonList(count = 6) {
  const list = document.createElement('div');
  list.className = 'song-list skeleton-list';
  list.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < count; i += 1) {
    const item = document.createElement('div');
    item.className = 'skeleton-list-item';
    item.innerHTML = `
      <div class="skeleton skeleton-cover small"></div>
      <div class="skeleton-list-content">
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line short"></div>
      </div>
    `;
    list.appendChild(item);
  }
  return list;
}