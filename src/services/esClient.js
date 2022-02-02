import { Client } from "@elastic/elasticsearch";
import { esHost, esUser, esPass } from "../config/vars";

class EsInstance {
  constructor() {
    if (!this.instance) {
      let configs = { node: esHost };
      if (esUser && esPass) {
        configs.auth = {
          password: esPass,
          username: esUser,
        };
      }

      this.instance = new Client(configs);
    }
  }

  getInstance() {
    return this.instance;
  }
}

const singletonEsInstance = new EsInstance();

Object.freeze(singletonEsInstance);

export default singletonEsInstance;
