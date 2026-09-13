import '@testing-library/jest-dom';

class MockWebSocket {
  constructor() {
    this.close = () => {};
  }
}

globalThis.WebSocket = MockWebSocket;
