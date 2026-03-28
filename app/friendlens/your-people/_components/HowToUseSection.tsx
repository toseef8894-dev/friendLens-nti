'use client'

import { useSearchParams } from 'next/navigation'
import { InstructionStep } from '../../your-sources/_components/YourSources'

export default function HowToUseSection() {
  const searchParams = useSearchParams()
  const step = searchParams.get('step') ?? 'add'

  return (
    <>
      {step === 'table' ? (
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-0">
          <div className="flex flex-col gap-4">
            <InstructionStep
              description="Each of the columns is sortable"
            />
            <InstructionStep
              description="Click on the column headers to group and view the table in different ways"
            />
          </div>
          <div className="flex flex-col gap-4">
            <InstructionStep
              description="Reflect on how many of each friend type you have, how close or far they are, how often you are seeing them, who carries the relationships and how you feel about them"
            />
            <div className="pt-6 border-t border-[#E2E8F0]/50">
              <p className="text-[#90A1B9] text-xs leading-4 italic">
                💡 Use sorting to spot patterns — who contacts you, who makes you happier, and who you miss most
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-0">
          <div className="flex flex-col gap-4">
            <InstructionStep
              description="Enter name"
            />
            <InstructionStep
              description="Select the friend type from the dropdown"
            />
          </div>
          <div className="flex flex-col gap-4">
            <InstructionStep
              description="Answer the four questions about the interaction"
            />
            <InstructionStep
              description="Do not list contacts and potential friends--just friends"
            />
            <div className="pt-6 border-t border-[#E2E8F0]/50">
              <p className="text-[#90A1B9] text-xs leading-4 italic">
                💡After you build the initial list, you can view it as a table by clicking on the icon to the right of Add Person
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
