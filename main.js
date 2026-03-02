document.getElementById('add-hello-btn').addEventListener('click', () => {
  const container = document.getElementById('hello-container');
  const newHello = document.createElement('p');
  newHello.textContent = 'Hello, world!';
  container.appendChild(newHello);
});
