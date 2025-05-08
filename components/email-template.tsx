import moment from "moment";
import type * as React from "react";

interface EmailTemplateProps {
  name: string;
  location: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  location,
}) => (
  // Hallo, ${name}! Sie haben Tickets für das Event ${event.name} am ${event.start_time} in ${event.location} gekauft.
  <div>
    <h1>Hallo, {name}!</h1>
    <p>
      Sie haben Tickets für die Red Sparrows erworben.
    </p>
    <p>Ort: {location}</p>
    <p>Wir freuen uns darauf, Sie dort zu sehen!</p>
    <p>
      Bitte beachten Sie, dass das Ticket in Form eines QR Codes vorliegt.
      Diesen können Sie an der Veranstaltung vorzeigen.
    </p>
    <p>
      Zudem benötigen Sie einen gültigen Lichtbildausweis, ihre Dauerkarte oder je nach Kategorie eine Identifikationsform.
    </p>
  </div>
);
