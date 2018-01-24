// @flow
import React from 'react'
import withRedux from 'next-redux-wrapper'
import createStore from '../../store'
import { createEvent } from '../../actions/event'
import { omniauthSignIn } from '../../actions/user'
import { getEventErrorsArray } from '../../selectors/event'
import EventFormComponent from '../../components/EventForm'

type EventFormProps = {
  createEvent: Function,
  omniauthSignIn: Function,
  errors: ?string[]
}

export const NewEvent = (props: EventFormProps) => (
  <div>
    <h3>This is the event form page!</h3>
    { props.errors &&
      <ul>
        { props.errors.map(error =>
          <li>{ error }</li>)}
      </ul>
    }
    <EventFormComponent onSubmit={props.createEvent} onSignIn={props.omniauthSignIn} />
  </div>
)

const mapDispatchToProps = { createEvent, omniauthSignIn }
const mapStateToProps = state => (
  { errors: getEventErrorsArray(state) }
)

const connectProps = {
  createStore,
  mapStateToProps,
  mapDispatchToProps,
}

export default withRedux(connectProps)(NewEvent)
