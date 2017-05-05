import {injectable, inject} from 'inversify'
import {IApp} from '../abstractions/app'
import {TYPES} from '../types'
import {IConfig} from '../abstractions/config'
import {ILogger} from '../abstractions/logger'
import {IHttpServer} from '../abstractions/http-server'
import {IDatabaseProvider} from '../abstractions/database-provider'
import {IScout} from '../abstractions/scout'
import {IPluginManager} from '../abstractions/plugin-manager'

@injectable()
export class App implements IApp {
  @inject(TYPES.Logger)
  private _logger: ILogger

  @inject(TYPES.Config)
  private _config: IConfig

  @inject(TYPES.HttpServer)
  private _httpServer: IHttpServer

  @inject(TYPES.PluginManager)
  private _pluginManager: IPluginManager

  @inject(TYPES.DatabaseProvider)
  private _databaseProvider: IDatabaseProvider

  use (scout: IScout) {
    this._pluginManager.addPlugin(scout)
    this._logger.log(`plugin ${scout.name} added`)

    return this
  }

  async start () {
    await this._config.load()
    this._logger.log('configuration loaded')
    await this._databaseProvider()
    this._logger.log('database opened')
    await this._httpServer.listen(this._config.get().ip, this._config.get().port)
    this._logger.info(`listening on ${this._config.get().ip}:${this._config.get().port}`)
    this._pluginManager.start()
  }
}
