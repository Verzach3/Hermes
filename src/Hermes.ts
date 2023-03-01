import EventEmitter from "events";
import HermesAdapter from "./HermesAdapter";
import HermesPlugin from "./HermesPlugin";
import { mkdir, readdir, stat } from "fs/promises";
import inquirer from "inquirer";
import path from "path";
import { cwd } from "process";

class Hermes {
  adapter: HermesAdapter;
  eventEmitter: EventEmitter;
  plugins: HermesPlugin[] = [];
  constructor(adapter: HermesAdapter) {
    this.adapter = adapter;
    this.eventEmitter = new EventEmitter();
    this.adapter.seteventEmitter(this.eventEmitter);
    console.log("Hermes constructor");
  }

  async start() {
    await this.adapter.start();
  }

  async pluginsHandler(args: string[]) {
    if (args[0] === "--create-folder") {
      try {
        const res = await stat("./plugins");
        console.log("Plugins folder already exists");
      } catch (error: any) {
        if (error.code === "ENOENT") {
          console.log("Plugins folder not found, creating");
          await mkdir("./plugins");
        }
      }
    }

    if (args[0] === "reload") {
      for (const plugin of this.plugins) {
        await plugin.unload();
      }
      this.plugins = [];
      await this.loadPlugins();
    }
  }

  async loadPlugins() {
    try {
      const stats = await stat("./plugins");
      if (!stats.isDirectory()) {
        console.log("Plugins folder not found, skipping plugin loading");
        return;
      }
      console.log("Plugins folder found, loading plugins");
      const pluginsPaths = (await readdir("./plugins")).filter((path) =>
        path.endsWith(".js")
      );
      for (const pluginPath of pluginsPaths) {
        try {
          const plugin = (await import(
            path.join(cwd(), `/plugins/${pluginPath}`)
          )).default.default;

          // check if plugin is a class
        const pluginInstance: HermesPlugin = new plugin();
        if (Object.keys(pluginInstance).includes("name") && Object.keys(pluginInstance).includes("version")) {
            this.plugins.push(pluginInstance);
            await pluginInstance.init();
            console.log(
              `Loaded plugin ${pluginInstance.name} version:${pluginInstance.version}`
            );
          } else {
            console.log(`Plugin ${pluginPath} is not a HermesPlugin, skipping`);
          }
        } catch (error) {
          console.log(`Error loading plugin ${pluginPath}, skipping`);
          console.log(error);
        }
      }
    } catch (error) {
      console.log("Plugins folder not found, skipping plugin loading");
      return;
    }
  }

  async handleMessages() {
    this.eventEmitter.on("message", (message:any) => {
        console.log(message)
    })
  }

  async consoleHandler() {
    for (;;) {
      const answer = await inquirer.prompt([
        {
          type: "input",
          name: "command",
          message: ">",
        },
      ]);

      this.commandHandler(answer.command);
    }
  }

  async commandHandler(command: string) {
    const args = command.split(" ");
    switch (args[0]) {
      case "plugins":
        await this.pluginsHandler(args.slice(1));
        break;
      default:
        this.eventEmitter.emit("command", {
          command: args[0],
          args: args.slice(1),
        });
        break;
    }
  }
}

export default Hermes;
