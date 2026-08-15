export function renderNotFound() {
  const fragment = document.createDocumentFragment();
  
  const card = document.createElement('section');
  card.className = 'card not-found-card';
  
  card.innerHTML = `
    <div class="not-found-content">
      <div class="not-found-code">404</div>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved. Let's get you back to the music.</p>
      <button class="btn btn-primary" onclick="window.location.hash='/home'">
        Go Home
      </button>
    </div>
  `;
  
  fragment.appendChild(card);
  return fragment;
}