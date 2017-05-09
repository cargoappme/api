import {injectable} from 'inversify'
import {IConfig} from '../abstractions/config'

import {config} from '../config'

@injectable()
export class FileConfig implements IConfig {
  private _config: any

  async load () {
    this._config = config
  }

  get () {
    return this._config
  }
}
