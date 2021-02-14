import { BaseCreate } from '../../base-create'
import { ConfigurationType } from '../../utils/configuration/config'

export default class Github extends BaseCreate {
  isDefaultPublic(): Boolean {
    return false;
  }

  getType: ConfigurationType = "Github" 
  static description = 'Create a new Github remote repository'

}
