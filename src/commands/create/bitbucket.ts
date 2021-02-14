import { BaseCreate } from '../../base-create'
import { ConfigurationType } from '../../utils/configuration/config';

export default class Bitbucket extends BaseCreate {
    isDefaultPublic(): Boolean {
        return false;
    }
    getType: ConfigurationType = "Bitbucket"

   static description = 'Create a new Bitbucket remote repository'

}