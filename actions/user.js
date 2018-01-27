// @flow
import { createAction } from 'redux-actions'
import type { Dispatch } from 'redux'
import queryString from 'query-string'
import axios from 'axios'
import * as Auth from 'devise-token-client'
import ActionsType from '../constants/Actions'

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

export const omniauthSignIn = (params: Object) => {
  if (Auth.isSignedIn()) {
    return fetchAutheticatedUser({ headers: Auth.requestHeaders() })
      .then(res => res.data.data, err => Promise.reject(err))
  }
  const popup = openAuthPopup(params.provider)
  const checkDidUserAuthenticated = setInterval(() => {
    const authHeaders = requestHeadersFromQuery(popup.location.search)

    if (authHeaders.uid) {
      popup.close()
      clearInterval(checkDidUserAuthenticated)
      return fetchAutheticatedUser({ headers: authHeaders })
        .then((res) => {
          Auth.persistToken(new Headers(res.headers))
          if (res.data.success) {
            // Dispatch SignInSuccess action or return Resolve
            return res.data.data
          }
          console.log('Error had occured in token verification')
          // Dispatch SignInFailure action or return Reject
          return Promise.reject(new Error('Error has occured in fetching User'))
        })
    } else if (popup.closed) {
      clearInterval(checkDidUserAuthenticated)
      // Dispatch SignInFailure action or return Reject
      return Promise.reject(new Error('Error has occured in User Authentication with the provider'))
    }
  }, 500)
}

export const userSignIn = createAction(ActionsType.User.signIn, omniauthSignIn)
