// @flow
import { createAction } from 'redux-actions'
import type { Dispatch } from 'redux'
import queryString from 'query-string'
import axios from 'axios'
import ActionsType from '../constants/Actions'
import { user } from '../api'

export const signIn =
  createAction(ActionsType.User.signIn, user.signIn)

export const omniauthSignIn = (params: Object) => (dispatch: Dispatch) => {
  const baseUrl = process.env.BASE_URL
  const authUrl = `${baseUrl}auth/${params.provider}?auth_origin_url=${encodeURIComponent('http://localhost:4000/blank')}`
  const openAuthPopup = () => window.open(authUrl, null, 'width=800, height=600')
  const popup = openAuthPopup()
  setTimeout(() => {
    const queries = queryString.parse(popup.location.search)
    console.log(queries)
    const callbackUrl = `${baseUrl}auth/validate_token`
    // const callbackUrl = `${baseUrl}auth/${params.provider}/callback?resource_class=User`

    axios.get(
      callbackUrl,
      {
        headers: {
          'access-token': queries.auth_token,
          expiry: queries.expiry,
          'token-type': 'Bearer',
          uid: queries.uid,
          client: queries.client_id,
        },
      },
    ).then(res => console.log(res.data))
  }, 6000)
  // user.signIn(params).then((res) => {
  //  console.log(res)
  // })
}
