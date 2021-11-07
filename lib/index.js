import { AdapterService } from "@feathersjs/adapter-commons";
import { uuid } from "@cfworker/uuid";

export class Adapter extends AdapterService {
  constructor(options = {}) {
    super(Object.assign({ id: "_id" }, options));
    this.kv_namespace = options.kv_namespace;
  }

  // get url() {
  //   return `https://dummy/${this.serviceName}/`;
  // }

  async _find(params = {}) {
    const res = await this.store.list();
    return res.keys.map((e) => e.metadata);
  }

  async _get(id, params = {}) {
    const res = await this.store.getWithMetadata(id);
    return res.metadata;
  }

  async _create(data, params = {}) {
    const exist = await this.store.get(data[this.id]);
    if (exist) {
      throw new Error("Record already exists");
    }
    const res = await this.store.put(data[this.id], JSON.stringify(data), {
      metadata: JSON.parse(JSON.stringify(data)),
    });
    // const current = Object.assign({}, data, { [this.id]: uuid() });

    // if (params.provider == 'rest') {
    //   await this.ws.fetch('https://dummy/dispatch', {
    //     method: 'POST',
    //     body: JSON.stringify([this.serviceName, 'created', body]),
    //   })
    // }

    return data;
  }

  async _remove(id, params) {
    try {
      await this.store.delete(id);
      return true;
    } catch (e) {
      return false;
    }
    // if (params.provider == 'rest') {
    //   await this.ws.fetch('https://dummy/dispatch', {
    //     method: 'POST',
    //     body: JSON.stringify([this.serviceName, 'removed', id]),
    //   })
    // }
  }

  async setup(app, path) {
    this.serviceName = path;
    const env = app.get("env");
    this.store = env[this.kv_namespace];
  }
}
