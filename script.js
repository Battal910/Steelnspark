const tabs = document.querySelectorAll('.shop-tab');
const products = document.querySelectorAll('.product-card');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const filter = tab.dataset.filter;
    tabs.forEach((item) => {
      item.classList.toggle('active', item === tab);
      item.setAttribute('aria-selected', item === tab ? 'true' : 'false');
    });
    products.forEach((product) => {
      product.hidden = filter !== 'all' && product.dataset.category !== filter;
    });
  });
});
