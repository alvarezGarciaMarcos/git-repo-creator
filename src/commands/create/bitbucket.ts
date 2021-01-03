import { BaseCreate } from '../../base-create'
import { ConfigurationType } from '../../utils/configuration/ConfigurationType';
import { RepositoryType } from '../../utils/repo/RepositoryType';
export default class Bitbucket extends BaseCreate {
    isDefaultPublic(): Boolean {
        return false;
    }
    getType: ConfigurationType = ConfigurationType.BITBUCKET

   static description = 'Create a new Bitbucket remote repository'

}