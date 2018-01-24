// @flow
import Event from './Event'
import Participant from './Participant'
import User from './User'
import * as endpoints from '../constants/endpoints'

export const event = new Event(endpoints.event)
export const participant = new Participant(endpoints.participant)
export const user = new User(endpoints.user)
