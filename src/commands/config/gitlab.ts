import { BaseHub } from '../../base-config'
import { ConfigurationType } from '../../utils/configuration/config'

export default class Gitlab extends BaseHub {
  getType(): ConfigurationType {
    return  "Gitlab"
   }
  static description = 'Setup a Gitlab account'

}
