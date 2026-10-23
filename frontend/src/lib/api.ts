import type { HomeData } from '@shared/types';

export async function fetchHomeData(): Promise<HomeData> {
  const res = await fetch('/api/home');
  if (!res.ok) {
    throw new Error(`Server responded with ${res.status}`);
  }
  return (await res.json()) as HomeData;
}
