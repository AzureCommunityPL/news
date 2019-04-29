import {Environment} from './environment.d';

export const environment: Environment = {
  production: true,
  local: false,
  fbAppId: '#{Facebook.AppId}#',
  fbApiVersion: '#{Facebook.ApiVersion}#',
  apiAddress: '#{Api.Address}#',
  apiKey: '#{Api.Key}#'
};
