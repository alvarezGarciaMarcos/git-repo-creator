import { BaseCreate } from '../../base-create'
import { ConfigurationType } from '../../utils/configuration/config'

export default class Gitlab extends BaseCreate {
  isDefaultPublic(): Boolean {
    return false;
  }

  getType: ConfigurationType = "Gitlab" 

  static description = 'Create a new Gitlab remote repository'
  
}
