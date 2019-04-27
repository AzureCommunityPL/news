import {Environment} from './environment.d';

export const environment: Environment = {
  production: true,
  fbAppId: '#{Facebook.AppId}#',
  fbApiVersion: '#{Facebook.ApiVersion}#',
  sasApiAddress: '#{Sas.Api.Address}#',
  sasApiKey: '#{Sas.Api.Key}#'
};
