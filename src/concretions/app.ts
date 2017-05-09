import {injectable, inject} from 'inversify'
import {IApp} from '../abstractions/app'
import {TYPES} from '../types'
import {IConfig} from '../abstractions/config'
import {ILogger} from '../abstractions/logger'
import {IHttpServer} from '../abstractions/http-server'
import {IDatabaseProvider} from '../abstractions/database-provider'

@injectable()
export class App implements IApp {
  @inject(TYPES.Logger)
  private _logger: ILogger

  @inject(TYPES.Config)
  private _config: IConfig

  @inject(TYPES.HttpServer)
  private _httpServer: IHttpServer

  @inject(TYPES.DatabaseProvider)
  private _databaseProvider: IDatabaseProvider

  async start () {
    await this._config.load()
    this._logger.log('configuration loaded')
    await this._databaseProvider()
    this._logger.log('database opened')
    await this._httpServer.listen(this._config.get().server.ip, this._config.get().server.port)
    this._logger.info(`listening on ${this._config.get().server.ip}:${this._config.get().server.port}`)
  }
}
