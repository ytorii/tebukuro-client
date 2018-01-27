// @flow
import { createAction } from 'redux-actions'
import type { Dispatch } from 'redux'
import queryString from 'query-string'
import axios from 'axios'
import * as Auth from 'devise-token-client'
import ActionsType from '../constants/Actions'
import { user } from '../api'

export const signIn =
  createAction(ActionsType.User.signIn, user.signIn)

const baseAuthUrl = `${process.env.BASE_URL}auth`

const validateTokenUrl = `${baseAuthUrl}/validate_token`
const fetchAutheticatedUser = config => axios.get(validateTokenUrl, config)

const openAuthPopup = (provider) => {
  const authOriginUrl = encodeURIComponent(`http://${window.location.host}/blank`)
  const authQuery = `auth_origin_url=${authOriginUrl}`
  const omniauthUrl = `${baseAuthUrl}/${provider}?${authQuery}`

  return window.open(omniauthUrl, null, 'width=800, height=600')
}

const requestHeadersFromQuery = (query) => {
  const queries = queryString.parse(query)
  return {
    'access-token': queries.auth_token,
    client: queries.client_id,
    expiry: queries.expiry,
    'token-type': 'Bearer',
    uid: queries.uid,
  }
}

export const omniauthSignIn = (params: Object) => (dispatch: Dispatch) => {
  if (Auth.isSignedIn()) {
    fetchAutheticatedUser({ headers: Auth.requestHeaders() })
      .then((res) => { console.log(res.data) })
  } else {
    const popup = openAuthPopup(params.provider)
    const checkDidUserAuthenticated = setInterval(() => {
      const authHeaders = requestHeadersFromQuery(popup.location.search)
      if (authHeaders.uid) {
        popup.close()
        clearInterval(checkDidUserAuthenticated)
        fetchAutheticatedUser({ headers: authHeaders })
          .then((res) => {
            console.log(res.data)
            Auth.persistToken(new Headers(res.headers))
            if (res.date.success){
            // Dispatch SignInSuccess action or return Resolve
            } else {
            // Dispatch SignInFailure action or return Reject
            }
          })
      } else if (popup.closed) {
        clearInterval(checkDidUserAuthenticated)
        // Dispatch SignInFailure action
      }
    }, 1000)
  }
}
