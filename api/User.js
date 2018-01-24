// @flow
import pathToRegexp from 'path-to-regexp'
import Base from './Base'

export default class User extends Base {
  signIn = (params: Object) => {
    const url = pathToRegexp.compile(this.endpoints.omniauth)(params)
    return this.client.get(url).then(this.onSuccess, this.onFailure)
  }
}
