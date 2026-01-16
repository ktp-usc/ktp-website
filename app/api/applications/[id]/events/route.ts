// app/api/applications/[id]/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
// adapt these imports to your project
import { prisma } from '@/lib/prisma'; // <-- your prisma client
import { getServerSession } from 'next-auth'; // <-- or your auth method

const RESPONSE_KEYS = ['eventsAttended', 'rush_events', 'rush', 'rushEvents'];

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // auth - adapt to your auth
  // const session = await getServerSession();
  // if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const appId = params.id;
  if (!appId) return NextResponse.json({ message: 'Missing id' }, { status: 400 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const events = Array.isArray(body?.events) ? body.events.map(String) : null;
  if (!events) return NextResponse.json({ message: 'events must be an array' }, { status: 400 });

  try {
    // Load current app
    const app = await prisma.applications.findUnique({ where: { id: appId } });

    if (!app) return NextResponse.json({ message: 'Application not found' }, { status: 404 });

    // Determine where events are stored
    // 1) top-level string/array field: rushEvents or eventsAttended
    if (typeof (app as any).rushEvents !== 'undefined' || typeof (app as any).eventsAttended !== 'undefined') {
      // prefer rushEvents if present, else eventsAttended
      const fieldName = typeof (app as any).rushEvents !== 'undefined' ? 'rushEvents' : 'eventsAttended';

      // If DB column type is string (CSV) convert to string, else save as JSON array
      // Adjust depending on your Prisma schema: string vs string[] vs Json
      const isJsonColumn = true; // set to false if your column is plain string
      if (isJsonColumn) {
        const updated = await prisma.applications.update({
          where: { id: appId },
          data: { [fieldName]: events },
        });
        return NextResponse.json({ success: true, data: updated });
      } else {
        // save as CSV string
        const updated = await prisma.applications.update({
          where: { id: appId },
          data: { [fieldName]: events.join(', ') },
        });
        return NextResponse.json({ success: true, data: updated });
      }
    }

    // 2) responses array (common shape: [{ question, answer }, ... ])
    if (Array.isArray((app as any).responses)) {
      const responses: any[] = Array.from((app as any).responses || []);
      // try to find a response item where question matches any known keys
      let foundIndex = -1;
      for (let i = 0; i < responses.length; i++) {
        const q = responses[i]?.question;
        if (!q) continue;
        const qStr = String(q).toLowerCase();
        if (RESPONSE_KEYS.some((k) => qStr.includes(k.toLowerCase()))) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex >= 0) {
        // update that answer with the events array (or CSV string if you prefer)
        responses[foundIndex].answer = events;
      } else {
        // no matching question found — append a new response entry
        responses.push({ question: 'rush_events', answer: events });
      }

      // persist
      const updated = await prisma.applications.update({
        where: { id: appId },
        data: { responses }, // assumes responses column accepts JSON
      });

      return NextResponse.json({ success: true, data: updated });
    }

    // 3) fallback: write to a generic json column called `meta` or `data`
    if (typeof (app as any).meta !== 'undefined') {
      const meta = { ...(app as any).meta, rushEvents: events };
      const updated = await prisma.applications.update({
        where: { id: appId },
        data: { meta },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    // If none matched, just attach a new `rushEvents` JSON field if your DB supports it
    const updated = await prisma.applications.update({
      where: { id: appId },
      data: { rushEvents: events as any }, // adjust type if necessary
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('Server error saving events', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

