import { BaseHub } from '../../base-config'
import { ConfigurationType } from '../../utils/configuration/ConfigurationType'

export default class Bitbucket extends BaseHub {
  getType(): ConfigurationType {
    return ConfigurationType.BITBUCKET
  }

  static description = 'Setup a Bitbucket account'
}
