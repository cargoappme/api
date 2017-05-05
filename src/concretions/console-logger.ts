import {injectable} from 'inversify'
import {ILogger} from '../abstractions/logger'

import * as clor from 'clor'

@injectable()
export class ConsoleLogger implements ILogger {
  log (text: string) {
    console.log(`${clor.white.bold('log  :')} ${text}`)
  }

  info (text: string) {
    console.log(`${clor.cyan.bold('info :')} ${text}`)
  }

  warn (text: string) {
    console.log(`${clor.yellow.bold('warn :')} ${text}`)
  }

  error (text: string) {
    console.log(`${clor.red.bold('error:')} ${text}`)
  }
}
