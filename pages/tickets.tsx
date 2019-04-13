import Error from 'next/error'
import React from 'react'
import FaqList from '../components/faqList'
import withPageMetadata, { WithPageMetadataProps } from '../components/global/withPageMetadata'
import dateTimeProvider from '../components/utils/dateTimeProvider'
import Conference from '../config/conference'
import getConferenceDates from '../config/dates'
import getFaqs from '../config/faqs'
import { TicketsProvider } from '../config/types'
import Page from '../layouts/main'

class TicketPage extends React.Component<WithPageMetadataProps> {
  static getInitialProps({ res }) {
    if (!getConferenceDates(Conference, dateTimeProvider.now()).RegistrationOpen && res) {
      res.statusCode = 404
    }
    return {}
  }

  componentDidMount() {
    const conference = this.props.pageMetadata.conference
    if (conference.TicketsProviderId === TicketsProvider.Tito) {
      // need to include this script <script src='https://js.tito.io/v1' async></script>
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = 'https://js.tito.io/v1'
      script.async = true
      document.body.appendChild(script)
    }
  }

  render() {
    const conference = this.props.pageMetadata.conference
    const dates = this.props.pageMetadata.dates
    const faqs = getFaqs(dates)
    if (!dates.RegistrationOpen) {
      return <Error statusCode={404} />
    }

    let ticketFrame: any

    if (conference.TicketsProviderId === TicketsProvider.Eventbrite) {
      ticketFrame = (
        <iframe
          src={'//eventbrite.com.au/tickets-external?ref=etckt&eid=' + conference.EventId}
          style={{ border: 0 }}
          height="650"
          width="100%"
          scrolling="auto"
        />
      )
    } else if (conference.TicketsProviderId === TicketsProvider.Tito) {
      // <tito-widget event="dddperth/{conference.EventId}"></tito-widget>
      ticketFrame = (
        <div style={{ border: 0 }}>
          <div
            id="tito-frame"
            dangerouslySetInnerHTML={{ __html: `<tito-widget event="dddperth/${conference.EventId}" />` }}
          />
        </div>
      )
    }

    return (
      <Page
        pageMetadata={this.props.pageMetadata}
        title="Tickets"
        description={'Purchase tickets for ' + conference.Name}
      >
        <div className="container">
          <h1>Tickets</h1>
          <FaqList faqs={faqs.filter(f => f.Category === 'tickets')} />
          {ticketFrame}
        </div>
      </Page>
    )
  }
}

export default withPageMetadata(TicketPage)
