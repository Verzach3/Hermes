export default class HermesPlugin {
  name:string;
  version: string;
  constructor(name: string, version:string) {
    this.name = name;
    this.version = version;
  }
  /**
   * Called when the plugin is unloaded
   */
  async unload() {

  }

  /**
   * Called when the plugin is loaded
   */
  async init() {

  }
  
}
