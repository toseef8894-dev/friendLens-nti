import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Friend } from './types'
import HeroSection from './_components/HeroSection'
import AddFriendsContent from './_components/AddFriendsScreen'
import FriendsListContent from './_components/FriendsListScreen'
import FriendsTableContent from './_components/FriendsTableScreen'

type Step = 'add' | 'list' | 'table'

interface PageProps {
  searchParams: { step?: string }
}

export default async function YourPeoplePage({ searchParams }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: friends } = await supabase
    .from('friends')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const friendsList: Friend[] = friends ?? []
  const hasFriends = friendsList.length > 0

  // Resolve the current step
  const raw = searchParams.step
  let step: Step

  if (raw === 'add' || raw === 'list' || raw === 'table') {
    step = raw
  } else {
    step = hasFriends ? 'list' : 'add'
  }

  if ((step === 'list' || step === 'table') && !hasFriends) {
    redirect('/friendlens/your-people?step=add')
  }

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bgImage.png')" }}
    >
      <main className="flex flex-col items-center pt-[40px] px-4 pb-20">
        <HeroSection />
        {step === 'add' && <AddFriendsContent />}
        {step === 'list' && <FriendsListContent friends={friendsList} />}
        {step === 'table' && <FriendsTableContent friends={friendsList} />}
      </main>
    </div>
  );
}
