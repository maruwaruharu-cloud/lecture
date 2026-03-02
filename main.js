document.getElementById('add-hello-btn').addEventListener('click', () => {
  const container = document.getElementById('hello-container');
  const newHello = document.createElement('p');
  newHello.textContent = 'Hello, world!';
  container.appendChild(newHello);
});

document.getElementById('toggle-dark-mode').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  document.getElementById('toggle-dark-mode').textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
});
