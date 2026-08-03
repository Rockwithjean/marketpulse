document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      window.location.href = 'dashboard.html';
    });
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (event) => {
      event.preventDefault();
      window.location.href = 'dashboard.html';
    });
  }

  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const button = settingsForm.querySelector('button[type="submit"]');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Saved';
        button.disabled = true;
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 1400);
      }
    });
  }

  const dateText = document.getElementById('dashboardDate');
  if (dateText) {
    const now = new Date();
    dateText.textContent = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  const tabButtons = document.querySelectorAll('[data-tab]');
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const tabName = button.dataset.tab;
      const target = document.getElementById(tabName);

      document.querySelectorAll('.tab-button').forEach((item) => item.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));

      button.classList.add('active');
      if (target) {
        target.classList.add('active');
      }
    });
  });

  const sidebarToggle = document.querySelector('.mobile-menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  const sidebarNavItems = document.querySelectorAll('.nav-item');
  sidebarNavItems.forEach((item) => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 760) {
        sidebar.classList.remove('open');
      }
    });
  });

  const dashboardLinks = document.querySelectorAll('.nav-item[data-target]');
  dashboardLinks.forEach((item) => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.target;
      const tabButton = document.querySelector(`.tab-button[data-tab="${targetId}"]`);
      if (tabButton) {
        tabButton.click();
      }
    });
  });
});
