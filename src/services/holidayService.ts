import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Holiday } from '../types';
import { demoStore } from './demoStore';

const HOLIDAYS_COLLECTION = 'holidays';

export const INITIAL_COMPANY_HOLIDAYS: Omit<Holiday, 'id'>[] = [
  {
    title: "New Year's Day",
    date: '2026-01-01',
    dayOfWeek: 'Thursday',
    type: 'mandatory',
    description: 'First day of the new year holiday',
  },
  {
    title: 'Republic Day / Foundation Day',
    date: '2026-01-26',
    dayOfWeek: 'Monday',
    type: 'mandatory',
    description: 'National commemoration and official holiday',
  },
  {
    title: 'Good Friday',
    date: '2026-04-03',
    dayOfWeek: 'Friday',
    type: 'mandatory',
    description: 'Spring public holiday',
  },
  {
    title: 'International Workers’ Day',
    date: '2026-05-01',
    dayOfWeek: 'Friday',
    type: 'mandatory',
    description: 'Labor and workers rights day',
  },
  {
    title: 'Independence Day',
    date: '2026-08-15',
    dayOfWeek: 'Saturday',
    type: 'mandatory',
    description: 'National independence celebration',
  },
  {
    title: 'Autumn Festival / Dussehra',
    date: '2026-10-20',
    dayOfWeek: 'Tuesday',
    type: 'mandatory',
    description: 'Festival holiday',
  },
  {
    title: 'Festival of Lights / Diwali',
    date: '2026-11-08',
    dayOfWeek: 'Sunday',
    type: 'mandatory',
    description: 'Cultural lights holiday',
  },
  {
    title: 'Thanksgiving / Annual Day',
    date: '2026-11-26',
    dayOfWeek: 'Thursday',
    type: 'optional',
    description: 'Company optional gratitude day',
  },
  {
    title: 'Christmas Day',
    date: '2026-12-25',
    dayOfWeek: 'Friday',
    type: 'mandatory',
    description: 'Winter festive holiday',
  },
];

export async function getAllHolidays(): Promise<Holiday[]> {
  if (demoStore.isDemoActive()) {
    return demoStore.getHolidays();
  }

  const snap = await getDocs(collection(db, HOLIDAYS_COLLECTION));
  if (snap.empty) {
    return [];
  }
  const holidays = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Holiday, 'id'>),
  }));
  return holidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getUpcomingHolidays(): Promise<Holiday[]> {
  const all = await getAllHolidays();
  const todayStr = new Date().toISOString().split('T')[0];
  const upcoming = all.filter((h) => h.date >= todayStr);
  return upcoming.length > 0 ? upcoming : all.slice(0, 5);
}

export async function seedInitialHolidays(): Promise<Holiday[]> {
  const seeded: Holiday[] = [];
  for (const item of INITIAL_COMPANY_HOLIDAYS) {
    const docRef = await addDoc(collection(db, HOLIDAYS_COLLECTION), item);
    seeded.push({ id: docRef.id, ...item });
  }
  return seeded;
}

export async function addHoliday(holiday: Omit<Holiday, 'id'>): Promise<Holiday> {
  if (demoStore.isDemoActive()) {
    return demoStore.addHoliday(holiday);
  }

  const docRef = await addDoc(collection(db, HOLIDAYS_COLLECTION), holiday);
  return { id: docRef.id, ...holiday };
}

export async function deleteHoliday(holidayId: string): Promise<void> {
  if (demoStore.isDemoActive() || holidayId.startsWith('demo-hol-')) {
    demoStore.deleteHoliday(holidayId);
    return;
  }

  await deleteDoc(doc(db, HOLIDAYS_COLLECTION, holidayId));
}

export async function updateHoliday(holidayId: string, updates: Partial<Holiday>): Promise<void> {
  if (demoStore.isDemoActive() || holidayId.startsWith('demo-hol-')) {
    demoStore.updateHoliday(holidayId, updates);
    return;
  }

  await updateDoc(doc(db, HOLIDAYS_COLLECTION, holidayId), updates);
}
