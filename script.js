const menuButton = document.querySelector('.menu-button');
const siteNav = document.querySelector('.site-nav');

if (menuButton && siteNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

function handleBetaSignup(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.email.value.trim();
  const message = document.getElementById('form-message');

  if (!email) {
    message.textContent = 'Please enter your email address.';
    return false;
  }

  message.textContent = 'Thanks — this prototype form is ready to connect to your email platform.';
  form.reset();
  return false;
}
