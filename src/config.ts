import {DriverOptions} from 'typeorm'

const server = {
  ip: '127.0.0.1',
  port: 2000
}

let database: DriverOptions = {
  type: 'sqlite',
  storage: 'data.db'
}

if (process.env.NODE_ENV === 'production') {
  server.ip = '0.0.0.0'
  server.port = process.env.PORT
  database = {
    type: 'postgres',
    url: process.env.DATABASE_URL
  }
}

export const config = {
  server,
  database
}
