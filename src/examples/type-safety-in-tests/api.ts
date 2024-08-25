export class Api {
  baseUrl: string;

  constructor() {
    this.baseUrl = 'hello';
  }

  async getHello() {
    return Promise.resolve('hello');
  }
}
