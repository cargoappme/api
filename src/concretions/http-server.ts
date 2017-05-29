import {injectable, inject} from 'inversify'
import {IHttpServer} from '../abstractions/http-server'
import {TYPES} from '../types'
import {IDatabaseProvider} from '../abstractions/database-provider'
import {Journey} from '../entities/journey'
import {Position} from '../entities/position'
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

  private _authenticatedClients: Map<string, Set<ws>>

  @inject(TYPES.DatabaseProvider)
  private _databaseProvider: IDatabaseProvider

  constructor () {
    this._app = express()
    this._httpServer = http.createServer(this._app)
    this._wsServer = new ws.Server({ server: this._httpServer })
    this._wsServer.on('connection', this._onWsConnection.bind(this))
    this._authenticatedClients = new Map<string, Set<ws>>()

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
      const journeyToken = req.params.token
      const journeySecret = req.query.secret

      if (!journeySecret) return res.sendStatus(400)
      if (!req.body.longitude || !req.body.latitude) return res.sendStatus(400)

      const database = await this._databaseProvider()

      const journey = await database.entityManager.findOne(Journey, { token: journeyToken })

      if (!journey) return res.sendStatus(404)
      if (journey.secret !== journeySecret) return res.sendStatus(401)

      const position = new Position()
      position.journey = journey
      position.date = new Date()
      position.lat = req.body.latitude
      position.long = req.body.longitude

      await database.entityManager.persist(position)

      res.sendStatus(204)

      // send update to all related clients

      if (!this._authenticatedClients.has(journeyToken)) return

      const journeyClients = this._authenticatedClients.get(journeyToken)
      journeyClients.forEach(ws => {
        ws.send(JSON.stringify(['position', {
          date: position.date,
          geo: {
            lat: position.lat,
            long: position.long
          }
        }]))
      })
    })

    this._app.delete('/journeys/:token', async (req, res) => {
      const journeyToken = req.params.token
      const journeySecret = req.query.secret

      if (!journeySecret) return res.sendStatus(400)

      const database = await this._databaseProvider()

      const journey = await database.entityManager.findOne(Journey, { token: journeyToken })

      if (!journey) return res.sendStatus(404)
      if (journey.secret !== journeySecret) return res.sendStatus(401)

      journey.endDate = new Date()
      journey.isFinished = true

      await database.entityManager.persist(journey)

      res.sendStatus(204)

      // send update to all related clients

      if (!this._authenticatedClients.has(journeyToken)) return

      const journeyClients = this._authenticatedClients.get(journeyToken)
      journeyClients.forEach(ws => {
        ws.send(JSON.stringify(['finished', null]))
      })
    })

    this._app.use((req, res) => res.status(404).send("This is not what you're looking for"))
  }

  private async _onWsConnection (ws: ws) {
    const location = url.parse(ws.upgradeReq.url, true)
    const journeyToken = location.query.token

    if (!journeyToken) {
      return ws.close(WS_CLOSE_CODES.NO_TOKEN)
    }

    const database = await this._databaseProvider()

    const journey = await database.entityManager.findOne(Journey, { token: journeyToken })

    if (!journey) return ws.close(WS_CLOSE_CODES.NON_EXISTENT_TOKEN)

    const journeyPositions = await journey.positions
    const positions = journeyPositions.map(position => {
      return {
        date: position.date,
        geo: {
          lat: position.lat,
          long: position.long
        }
      }
    })
    const initialPayload = {
      isFinished: journey.isFinished,
      start: {
        date: journey.startDate,
        geo: {
          lat: journey.startLat,
          long: journey.startLong
        }
      },
      end: {
        date: journey.endDate,
        geo: {
          lat: journey.endLat,
          long: journey.endLong
        }
      },
      positions
    }

    ws.send(JSON.stringify(['initial', initialPayload]))

    if (!this._authenticatedClients.has(journeyToken)) {
      this._authenticatedClients.set(journeyToken, new Set<ws>())
    }

    const journeyClients = this._authenticatedClients.get(journeyToken)
    journeyClients.add(ws)
    ws.on('close', () => {
      journeyClients.delete(ws)
      if (journeyClients.size === 0) this._authenticatedClients.delete(journeyToken)
      ws = null
    })
  }
}
