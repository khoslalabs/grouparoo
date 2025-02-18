import { AuthenticatedAction } from "../classes/actions/authenticatedAction";
import { OptionallyAuthenticatedAction } from "../classes/actions/optionallyAuthenticatedAction";
import { Plugins } from "../modules/plugins";
import { api } from "actionhero";

export class PluginsInstalledList extends OptionallyAuthenticatedAction {
  constructor() {
    super();
    this.name = "plugins:installed:list";
    this.description =
      "I will return information about the active plugins on this server";
    this.permission = { topic: "system", mode: "read" };
    this.outputExample = {};
  }

  async runWithinTransaction() {
    const plugins = await Plugins.installedPluginVersions();
    return { plugins };
  }
}

export class PluginsAvailableList extends OptionallyAuthenticatedAction {
  constructor() {
    super();
    this.name = "plugins:available:list";
    this.description =
      "I will return a list of the available grouparoo plugins";
    this.permission = { topic: "system", mode: "read" };
    this.outputExample = {};
  }

  async runWithinTransaction() {
    let availablePlugins = await Plugins.availableGrouparooPlugins();
    const installedPlugins = await Plugins.installedPluginVersions();
    const installedPluginNames = installedPlugins.map((plugin) => plugin.name);
    availablePlugins = availablePlugins.map((plugin) => {
      return {
        ...plugin,
        installed: installedPluginNames.includes(plugin.packageName),
      };
    });
    return { plugins: availablePlugins };
  }
}

export class PluginInstall extends AuthenticatedAction {
  constructor() {
    super();
    this.name = "plugin:install";
    this.description = "I install a Grouparoo plugin";
    this.permission = { topic: "system", mode: "write" };
    this.inputs = {
      plugin: { required: true },
      restart: { required: false, default: "false" },
    };
    this.outputExample = {};
  }

  async runWithinTransaction({
    params,
  }): Promise<{ success: boolean; checkIn?: number }> {
    const response = await Plugins.install(params.plugin);

    if (!response.success) return { success: false };
    // Return if did not ask to restart
    if (!params.restart) return { success: response.success };
    // Otherwise, return, then restart the server.
    const sleepTime = 100;
    setTimeout(() => {
      api.process.restart();
    }, sleepTime);
    return { success: response.success, checkIn: sleepTime * 4 };
  }
}

export class PluginUninstall extends AuthenticatedAction {
  constructor() {
    super();
    this.name = "plugin:uninstall";
    this.description = "I uninstall a Grouparoo plugin";
    this.permission = { topic: "system", mode: "write" };
    this.inputs = {
      plugin: { required: true },
    };
    this.outputExample = {};
  }

  async runWithinTransaction({ params }) {
    const response = await Plugins.uninstall(params.plugin);
    return response;
  }
}
