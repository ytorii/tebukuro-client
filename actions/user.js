// @flow
import { createAction } from 'redux-actions'
import queryString from 'query-string'
import axios from 'axios'
import * as Auth from 'devise-token-client'
import ActionsType from '../constants/Actions'

const baseAuthUrl = `${process.env.BASE_URL}auth`

const validateTokenUrl = `${baseAuthUrl}/validate_token`
const fetchAutheticatedUser = config => axios.get(validateTokenUrl, config)

const openAuthPopup = (provider) => {
  const authQuery = `auth_origin_url=${encodeURIComponent(window.location.href)}`
  const omniauthUrl = `${baseAuthUrl}/${provider}?${authQuery}`
  const settings = 'scrollbars=no,toolbar=no,location=no,titlebar=no,directories=no,status=no,menubar=no,width=800,height=600'

  return window.open(omniauthUrl, provider, settings)
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

const checkDidUserAuthenticated = (popup, resolve, reject) => {
  // In order to check authentication in popup window has completed,
  // we need to fetch search queries of popup windows address.
  // But in authenticating in provider's domain, this check causes cors exception
  // for secutity reason.
  // To handle this, catch exception and throw away...
  let authHeaders = {}
  try {
    authHeaders = requestHeadersFromQuery(popup.location.search)
  } catch (err) { }

  if (authHeaders.uid) {
    popup.close()
    return fetchAutheticatedUser({ headers: authHeaders })
      .then((res) => {
        Auth.persistToken(new Headers(res.headers))
        if (res.data.success) {
          return resolve(res.data.data)
        }
        return reject(new Error('Error has occured in fetching User'))
      })
  } else if (popup.closed) {
    return reject(new Error('Error has occured in User Authentication with the provider'))
  }
  return setTimeout(() => checkDidUserAuthenticated(popup, resolve, reject), 100)
}

const omniauthSignIn = (params: Object) => {
  if (Auth.isSignedIn()) {
    return fetchAutheticatedUser({ headers: Auth.requestHeaders() })
      .then((res) => {
        Auth.persistToken(new Headers(res.headers))
        return res.data.data
      }, err => Promise.reject(err))
  }
  const popup = openAuthPopup(params.provider)

  return new Promise((resolve, reject) => checkDidUserAuthenticated(popup, resolve, reject))
}

export const userSignIn = createAction(ActionsType.User.signIn, omniauthSignIn)
