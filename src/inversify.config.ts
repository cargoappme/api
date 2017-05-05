import {Container} from 'inversify'
import {TYPES} from './types'

import {createConnection} from 'typeorm'

import {IHttpServer} from './abstractions/http-server'
import {HttpServer} from './concretions/http-server'
import {IApp} from './abstractions/app'
import {App} from './concretions/app'
import {ILogger} from './abstractions/logger'
import {ConsoleLogger} from './concretions/console-logger'
import {IConfig} from './abstractions/config'
import {FileConfig} from './concretions/file-config'
import {IDatabaseProvider} from './abstractions/database-provider'
import {IDatabase} from './abstractions/database'

export const container = new Container()
container.bind<IApp>(TYPES.App).to(App).inSingletonScope()
container.bind<ILogger>(TYPES.Logger).to(ConsoleLogger).inSingletonScope()
container.bind<IConfig>(TYPES.Config).to(FileConfig).inSingletonScope()
container.bind<IHttpServer>(TYPES.HttpServer).to(HttpServer).inSingletonScope()
let db // singleton hack
container.bind<IDatabaseProvider>(TYPES.DatabaseProvider).toProvider<IDatabase>((context) => {
  return async () => {
    if (db) return db

    const conn = await createConnection({
      driver: {
        type: 'sqlite',
        storage: 'data.db'
      },
      entities: [
        __dirname + '/entities/*.js',
        __dirname + '/entities/*.ts'
      ],
      migrations: [
        __dirname + '/migrations/*.js',
        __dirname + '/migrations/*.ts'
      ],
      autoSchemaSync: true
    })
    db = conn

    return db
  }
})
