import { Injectable } from '@nestjs/common';

export interface Slot {
  id: string;
  doctorId: string;
  doctorName: string;
  start: string;
  end: string;
  available: boolean;
}

@Injectable()
export class BookingService {
  private slots: Slot[] = [
    {
      id: 's1',
      doctorId: 'd1',
      doctorName: 'Dr. Sarah Smith',
      start: new Date(Date.now() + 86400000).toISOString(),
      end: new Date(Date.now() + 86400000 + 3600000).toISOString(),
      available: true,
    },
    {
      id: 's2',
      doctorId: 'd1',
      doctorName: 'Dr. Sarah Smith',
      start: new Date(Date.now() + 2 * 86400000).toISOString(),
      end: new Date(Date.now() + 2 * 86400000 + 3600000).toISOString(),
      available: true,
    },
  ];

  listSlots(): Slot[] {
    return this.slots;
  }

  book(slotId: string, patientEmail: string) {
    const slot = this.slots.find((s) => s.id === slotId);
    if (!slot || !slot.available) {
      return { ok: false, error: 'Slot not available' };
    }
    slot.available = false;
    return {
      ok: true,
      confirmationId: `bk-${Date.now()}`,
      slot,
      patientEmail,
    };
  }
}
