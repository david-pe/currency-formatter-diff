const eventSource = new EventSource('/api/stream');

eventSource.addEventListener('message', event => {
    self.postMessage(JSON.parse(event.data));
});

eventSource.addEventListener('end', () => {
    self.postMessage({ type: 'end' });
    eventSource.close();
    self.close();
});

eventSource.onerror = (err) => {
    console.error('EventSource failed:', err);
    self.postMessage({ type: 'error' });
    eventSource.close();
    self.close();
}; 