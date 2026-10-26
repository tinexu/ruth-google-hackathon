import type { ReactNode } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AppOutletContext } from '../lib/outlet';
import { getUnlockedSkillCount } from '../lib/derive';
import { usePreferences, setPreference } from '../lib/settings';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Button } from '../components/Button';
import { Toggle } from '../components/Toggle';
import { PipMascot } from '../components/PipMascot';
import { MailIcon, BellIcon, SpeakerIcon } from '../components/icons';

export function SettingsPage() {
  const data = useOutletContext<AppOutletContext>();
  const { kid, pet, weekly, skills, totalSkills, logOut } = data;
  const prefs = usePreferences();

  const unlockedCount = getUnlockedSkillCount(skills);

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
          <Button variant="white" onClick={logOut} className="mt-3">
            Log out
          </Button>
        </Card>

        {/* parent reports — the essential safety feature */}
        <Card border="solid" rounded="rounded-[28px]" className="flex flex-col gap-5 bg-white p-7">
          <div>
            <p className="text-xs font-bold tracking-wide text-muted">PARENT REPORTS</p>
            <h2 className="mt-1 font-heading text-2xl font-extrabold text-ink">
              Keeping a parent in the loop
            </h2>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-ground px-5 py-4">
            <MailIcon size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-heading text-base font-bold text-ink">Email reports are coming soon</p>
              <p className="mt-1 text-sm text-muted">
                Accounts don't collect any email addresses yet. Soon a parent will be able to add
                theirs and get a weekly summary like the one below.
              </p>
            </div>
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
              description="A gentle nudge if you haven't fed Pip today."
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
