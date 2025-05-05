'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CalendarDays, Users, QrCode } from "lucide-react"
import Link from "next/link"


export type AdminEventSelectionComponentProps = {
  events: { id: number, name: string, start_time: string }[]
}

export function AdminEventSelectionComponent({ events }: AdminEventSelectionComponentProps) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Wähle ein Event aus</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup onValueChange={setSelectedEvent} className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-center space-x-2 space-y-0">
                <RadioGroupItem value={event.id.toString()} id={`event-${event.id}`} />
                <Label
                  htmlFor={`event-${event.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between w-full p-4 cursor-pointer hover:bg-gray-100 rounded-lg"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{event.name}</span>
                    <span className="text-sm text-gray-500 flex items-center mt-1">
                      <CalendarDays className="w-4 h-4 mr-1" />
                      {new Date(event.start_time).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} Uhr
                    </span>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
          <div className="mt-6 flex justify-end">
            <Button
              asChild
              disabled={!selectedEvent}
              className={`flex items-center ${!selectedEvent ? 'pointer-events-none opacity-50' : ''
                }`}
            >
              <Link href={selectedEvent ? `/admin/scan/${selectedEvent}` : '#'}>
                <QrCode className="mr-2 h-4 w-4" />
                Scanne Tickets
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}