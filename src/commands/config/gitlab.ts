import { BaseHub } from '../../base-config'
import { ConfigurationType } from '../../utils/configuration/ConfigurationType'

export default class Gitlab extends BaseHub {
  getType(): ConfigurationType {
    return ConfigurationType.GITLAB
  }
  static description = 'Setup a Gitlab account'

}
