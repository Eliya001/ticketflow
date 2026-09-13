import '@testing-library/jest-dom';

class MockWebSocket {
  constructor() {
    this.close = () => {};
  }
}

global.WebSocket = MockWebSocket;
