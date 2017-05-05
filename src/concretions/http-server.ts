import {injectable, inject} from 'inversify'
import {IHttpServer} from '../abstractions/http-server'
import {TYPES} from '../types'
import {IDatabaseProvider} from '../abstractions/database-provider'
import {Journey} from '../entities/journey'
import {WS_CLOSE_CODES} from '../constants'
import * as http from 'http'
import * as ws from 'ws'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as url from 'url'
import * as uuid from 'uuid'

@injectable()
export class HttpServer implements IHttpServer {
  private _app: express.Express
  private _httpServer: http.Server
  private _wsServer: ws.Server

  @inject(TYPES.DatabaseProvider)
  private _databaseProvider: IDatabaseProvider

  constructor () {
    this._app = express()
    this._httpServer = http.createServer(this._app)
    this._wsServer = new ws.Server({ server: this._httpServer })
    this._wsServer.on('connection', this._onWsConnection.bind(this))

    this._setupRouter()
  }

  listen (ip: string, port: number) {
    return new Promise<void>((resolve, reject) => {
      this._httpServer
        .listen(port, ip)
        .on('listening', resolve)
        .on('error', reject)
    })
  }

  private _setupRouter () {
    this._app.use(bodyParser.json())

    this._app.post('/journeys', async (req, res) => {
      if (!req.body.start || !req.body.start.latitude || !req.body.start.longitude) return res.sendStatus(400)
      if (!req.body.end || !req.body.end.latitude || !req.body.end.longitude) return res.sendStatus(400)

      const database = await this._databaseProvider()

      const journey = new Journey()
      journey.token = uuid()
      journey.secret = uuid()
      journey.startDate = new Date()
      journey.startLat = req.body.start.latitude
      journey.startLong = req.body.start.longitude
      journey.endLat = req.body.end.latitude
      journey.endLong = req.body.end.longitude

      await database.entityManager.persist(journey)

      return res.json({
        token: journey.token,
        secret: journey.secret
      })
    })

    this._app.post('/journeys/:token', async (req, res) => {
      const journeyToken = req.params.id
      const journeySecret = req.query.secret

      if (!journeySecret) return res.sendStatus(400)
      if (!req.body.longitude || !req.body.latitude) return res.sendStatus(400)

      const database = await this._databaseProvider()

      const journey = await database.entityManager.findOne(Journey, { token: journeyToken })

      if (journey.secret !== journeySecret) return res.sendStatus(401)
    })
  }

  private async _onWsConnection (ws: ws) {
    return
  }
}
