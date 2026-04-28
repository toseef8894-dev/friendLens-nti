import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Friend } from './types'

/** Per-request friends fetch so new rows show after onboarding without a manual reload. */
export const dynamic = 'force-dynamic'
import HeroSection from './_components/HeroSection'
import AddFriendsContent from './_components/AddFriendsScreen'
import FriendsListContent from './_components/FriendsListScreen'
import FriendsTableContent from './_components/FriendsTableScreen'
import HowToUseSection from './_components/HowToUseSection'

type Step = 'add' | 'list' | 'table'

interface PageProps {
  searchParams: { step?: string; single?: string }
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
      <main className="max-w-[1053px] mx-auto py-6 sm:py-12 flex  flex-col items-center pt-[40px] px-4 pb-20">
        <HeroSection />
        <div
          className="w-full rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 shadow-sm mb-8"
          style={{
            background: "linear-gradient(180deg, #FAF5FF 0%, #F8FAFC 100%)"
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(180deg, #9810FA 0%, #C800DE 100%)"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2.5V5.83333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.99996 13.3326C11.8409 13.3326 13.3333 11.8403 13.3333 9.99935C13.3333 8.1584 11.8409 6.66602 9.99996 6.66602C8.15901 6.66602 6.66663 8.1584 6.66663 9.99935C6.66663 11.8403 8.15901 13.3326 9.99996 13.3326Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7.5 15.834H12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.33337 17.5H11.6667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14.3333 4.16602L13.75 4.74935" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.66663 4.16602L6.24996 4.74935" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-[#0F172B] text-xl font-semibold leading-7">
              How to use this tool
            </h2>
          </div>

          <HowToUseSection />

        </div>

        {step === 'add' && <AddFriendsContent single={searchParams.single === 'true'} />}
        {step === 'list' && <FriendsListContent friends={friendsList} />}
        {step === 'table' && <FriendsTableContent friends={friendsList} />}
      </main>
    </div>
  );
}
