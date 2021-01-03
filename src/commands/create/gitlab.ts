import { BaseCreate } from '../../base-create'
import { ConfigurationType } from '../../utils/configuration/ConfigurationType'

export default class Gitlab extends BaseCreate {
  isDefaultPublic(): Boolean {
    return false;
  }

  getType: ConfigurationType = ConfigurationType.GITLAB

  static description = 'Create a new Gitlab remote repository'
  
}
