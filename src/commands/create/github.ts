import { flags } from '@oclif/command'
import { BaseCreate } from '../../base-create'
import { ConfigurationType } from '../../utils/configuration/ConfigurationType'
import { RepositoryType } from '../../utils/repo/RepositoryType'

export default class Github extends BaseCreate {
  isDefaultPublic(): Boolean {
    return false;
  }

  getType: ConfigurationType = ConfigurationType.GITHUB
  static description = 'Create a new Github remote repository'

}
