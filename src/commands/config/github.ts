import {BaseHub} from "../../base-config"
import { ConfigurationType } from "../../utils/configuration/ConfigurationType"
interface PromptResponse {
  apiKey: string;
  username: string;
}

export default class Github extends BaseHub {
  getType(): ConfigurationType {
    return ConfigurationType.GITHUB;
  }

  static description = 'Setup a github account'
}
