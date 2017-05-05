import {injectable, inject} from 'inversify'
import {IHttpServer} from '../abstractions/http-server'
import {TYPES} from '../types'
import {IDatabaseProvider} from '../abstractions/database-provider'
import {WS_CLOSE_CODES} from '../constants'
import * as http from 'http'
import * as ws from 'ws'
import * as url from 'url'

@injectable()
export class HttpServer implements IHttpServer {
  private _httpServer: http.Server
  private _wsServer: ws.Server

  @inject(TYPES.DatabaseProvider)
  private _databaseProvider: IDatabaseProvider

  constructor () {
    this._httpServer = http.createServer()
    this._wsServer = new ws.Server({ server: this._httpServer })
    this._wsServer.on('connection', this._onWsConnection.bind(this))
  }

  listen (ip: string, port: number) {
    return new Promise<void>((resolve, reject) => {
      this._httpServer
        .listen(port, ip)
        .on('listening', resolve)
        .on('error', reject)
    })
  }

  private async _onWsConnection (ws: ws) {
    return
  }
}
