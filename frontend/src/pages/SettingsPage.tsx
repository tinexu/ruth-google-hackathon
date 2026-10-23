import { useState, type ReactNode } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { HomeData } from '@shared/types';
import { getUnlockedSkillCount } from '../lib/derive';
import { usePreferences, setPreference } from '../lib/settings';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Button } from '../components/Button';
import { Toggle } from '../components/Toggle';
import { PipMascot } from '../components/PipMascot';
import { MailIcon, BellIcon, SpeakerIcon, CheckIcon } from '../components/icons';

// Fixed for this demo — in a real account this would come from the
// parent's own signup, not be hardcoded on the client.
const PARENT_EMAIL = 'devstar2613@gcplab.me';

type SendState = 'idle' | 'sending' | 'sent';

export function SettingsPage() {
  const data = useOutletContext<HomeData>();
  const { kid, pet, weekly, skills, totalSkills } = data;
  const prefs = usePreferences();
  const [sendState, setSendState] = useState<SendState>('idle');

  const unlockedCount = getUnlockedSkillCount(skills);

  // Simulated for this demo — there's no email-sending backend yet, so this
  // just mimics the request/response timing a real export would have.
  function sendReportNow() {
    if (sendState === 'sending') return;
    setSendState('sending');
    setTimeout(() => setSendState('sent'), 900);
  }

  return (
    <main className="mx-auto max-w-[1360px] px-6 py-10">
      <h1 className="font-heading text-[40px] font-extrabold leading-tight text-ink">Settings</h1>
      <p className="mt-1 text-lg text-muted">Your profile, parent reports, and preferences.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* profile */}
        <Card border="solid" rounded="rounded-[28px]" className="flex flex-col items-center gap-3 bg-pip-blue-light p-7 text-center">
          <PipMascot mood="happy" size={110} waving={false} />
          <h2 className="font-heading text-2xl font-extrabold text-ink">{kid.name}</h2>
          <p className="text-sm font-semibold text-muted">
            Raising {pet.name} · Level {pet.level}
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            <Pill tone="sun">{kid.streakDays} day streak</Pill>
            <Pill tone="blueTint">{kid.xp} XP</Pill>
            <Pill tone="mint">{unlockedCount}/{totalSkills} skills</Pill>
          </div>
        </Card>

        {/* parent reports — the essential safety feature */}
        <Card border="solid" rounded="rounded-[28px]" className="flex flex-col gap-5 bg-white p-7">
          <div>
            <p className="text-xs font-bold tracking-wide text-muted">PARENT REPORTS</p>
            <h2 className="mt-1 font-heading text-2xl font-extrabold text-ink">
              Keeping a parent in the loop
            </h2>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-2xl bg-ground px-5 py-4">
            <div>
              <p className="font-heading text-base font-bold text-ink">Share my progress with a parent</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <MailIcon size={16} />
                Weekly summaries go to <span className="font-semibold text-ink">{PARENT_EMAIL}</span>
              </p>
              <p className="mt-2 text-xs font-semibold text-coral">
                🔒 Only a parent can turn this off — not from this device.
              </p>
            </div>
            <Toggle checked locked label="Share my progress with a parent (locked on)" />
          </div>

          <div className="rounded-2xl border-2 border-dashed border-ink/30 px-5 py-4">
            <p className="text-sm font-semibold text-ink">What's included in a report:</p>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted">
              <li>Streak: {kid.streakDays} days</li>
              <li>XP earned: {kid.xp}</li>
              <li>Cards this week: {weekly.cardsThisWeek}</li>
              <li>Skills unlocked: {unlockedCount}/{totalSkills}</li>
            </ul>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="sun"
              icon={sendState === 'sent' ? <CheckIcon size={18} className="stroke-ink" /> : <MailIcon size={18} className="stroke-ink" />}
              onClick={sendReportNow}
              disabled={sendState === 'sending'}
            >
              {sendState === 'sending' ? 'Sending…' : sendState === 'sent' ? 'Sent!' : 'Send report now'}
            </Button>
            {sendState === 'sent' && (
              <p className="text-sm font-semibold text-mint">Sent to {PARENT_EMAIL} just now.</p>
            )}
          </div>
        </Card>
      </div>

      {/* preferences */}
      <section className="mt-6">
        <Card border="solid" rounded="rounded-[28px]" className="flex flex-col gap-1 bg-white p-7">
          <p className="text-xs font-bold tracking-wide text-muted">PREFERENCES</p>
          <h2 className="mt-1 font-heading text-2xl font-extrabold text-ink">On this device</h2>

          <div className="mt-4 flex flex-col divide-y divide-border">
            <PreferenceRow
              icon={<SpeakerIcon size={20} />}
              title="Sound effects"
              description="Dings and cheers when you answer a card."
              checked={prefs.soundEffects}
              onChange={(next) => setPreference('soundEffects', next)}
            />
            <PreferenceRow
              icon={<BellIcon size={20} />}
              title="Reminders"
              description="A gentle nudge if you haven't fed Ada today."
              checked={prefs.notifications}
              onChange={(next) => setPreference('notifications', next)}
            />
          </div>
        </Card>
      </section>
    </main>
  );
}

function PreferenceRow({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-ink">{icon}</span>
        <div>
          <p className="font-heading text-base font-bold text-ink">{title}</p>
          <p className="text-sm text-muted">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}
