import * as React from "react";
import moment from "moment";

interface EmailTemplateProps {
  name: string;
  event_name: string;
  location: string;
  start_time: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  event_name,
  location,
  start_time,
}) => (
  // Hallo, ${name}! Sie haben Tickets für das Event ${event.name} am ${event.start_time} in ${event.location} gekauft.
  <div>
    <h1>Hallo, {name}!</h1>
    <p>
      Sie haben Tickets für das Event {event_name} am{" "}
      {moment(start_time).local().format("DD.MM.YYYY")} gekauft.
    </p>
    <p>Ort: {location}</p>
    <p>Wir freuen uns darauf, Sie dort zu sehen!</p>
    <p>
      Bitte beachten Sie, dass das Ticket in Form eines QR Codes vorliegt.
      Diesen können Sie an der Veranstaltung vorzeigen.
    </p>
    <p>
      Zudem benötigen Sie einen gültigen Lichtbildausweis für ermäßigte Tickets.
    </p>
  </div>
);
