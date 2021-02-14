import {BaseHub} from "../../base-config"
import { ConfigurationType } from "../../utils/configuration/config"
interface PromptResponse {
  apiKey: string;
  username: string;
}

export default class Github extends BaseHub {
  getType(): ConfigurationType {
    return "Github"
  }

  static description = 'Setup a github account'
}
