import {injectable} from 'inversify'
import {IConfig} from '../abstractions/config'

import {DEFAULT_CONFIG} from '../default.config'

@injectable()
export class FileConfig implements IConfig {
  private _config: any

  async load () {
    this._config = DEFAULT_CONFIG
  }

  get () {
    return this._config
  }
}
