import { BaseHub } from '../../base-config'
import { ConfigurationType } from '../../utils/configuration/config'

export default class Bitbucket extends BaseHub {
  getType(): ConfigurationType {
    return "Bitbucket"
  }

  static description = 'Setup a Bitbucket account'
}
