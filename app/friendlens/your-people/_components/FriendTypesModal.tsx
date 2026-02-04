import { X } from 'lucide-react';

interface FriendTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
  selectedType?: string;
}

const FRIEND_TYPES = [
  {
    id: 'Best Friend',
    label: 'Best Friend',
    description: 'Someone with deep history who meaningfully affects your life and well-being.',
    icon: (<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 22C0 9.84974 9.84974 0 22 0C34.1503 0 44 9.84974 44 22C44 34.1503 34.1503 44 22 44C9.84974 44 0 34.1503 0 22Z" fill="#FEF9C2" />
      <path d="M21.604 13.9118C21.6406 13.838 21.697 13.7759 21.7669 13.7324C21.8369 13.689 21.9175 13.666 21.9999 13.666C22.0822 13.666 22.1629 13.689 22.2328 13.7324C22.3028 13.7759 22.3592 13.838 22.3957 13.9118L24.3207 17.8109C24.4475 18.0676 24.6347 18.2896 24.8662 18.458C25.0977 18.6263 25.3666 18.736 25.6499 18.7776L29.9549 19.4076C30.0364 19.4194 30.1131 19.4538 30.1761 19.5069C30.2391 19.56 30.2861 19.6297 30.3116 19.7081C30.337 19.7865 30.3401 19.8704 30.3204 19.9505C30.3006 20.0305 30.2589 20.1034 30.1999 20.1609L27.0865 23.1926C26.8812 23.3927 26.7276 23.6397 26.6389 23.9123C26.5502 24.1849 26.5291 24.475 26.5774 24.7576L27.3124 29.0409C27.3268 29.1225 27.318 29.2064 27.287 29.2832C27.2559 29.3599 27.204 29.4264 27.137 29.4751C27.07 29.5237 26.9907 29.5526 26.9081 29.5583C26.8255 29.5641 26.743 29.5465 26.6699 29.5076L22.8215 27.4843C22.568 27.3511 22.2859 27.2816 21.9995 27.2816C21.7131 27.2816 21.4309 27.3511 21.1774 27.4843L17.3299 29.5076C17.2568 29.5463 17.1744 29.5637 17.0919 29.5578C17.0095 29.5519 16.9303 29.5231 16.8635 29.4744C16.7966 29.4258 16.7447 29.3594 16.7138 29.2828C16.6828 29.2061 16.6739 29.1223 16.6882 29.0409L17.4224 24.7584C17.4709 24.4757 17.4499 24.1854 17.3612 23.9126C17.2724 23.6398 17.1187 23.3927 16.9132 23.1926L13.7999 20.1618C13.7404 20.1043 13.6982 20.0313 13.6782 19.951C13.6581 19.8707 13.6611 19.7864 13.6866 19.7078C13.7121 19.6291 13.7593 19.5591 13.8226 19.5059C13.8859 19.4527 13.963 19.4183 14.0449 19.4068L18.349 18.7776C18.6326 18.7363 18.9019 18.6268 19.1337 18.4584C19.3655 18.29 19.553 18.0678 19.6799 17.8109L21.604 13.9118Z" stroke="#A65F00" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
    </svg>)
  },
  {
    id: 'Close Friend',
    label: 'Close Friend',
    description: 'You trust them, miss them when you don\'t see them, and stay in regular touch.',
    icon: (<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 22C0 9.84974 9.84974 0 22 0C34.1503 0 44 9.84974 44 22C44 34.1503 34.1503 44 22 44C9.84974 44 0 34.1503 0 22Z" fill="#C70036" fill-opacity="0.1" />
      <path d="M27.8337 23.6667C29.0753 22.45 30.3337 20.9917 30.3337 19.0833C30.3337 17.8678 29.8508 16.702 28.9912 15.8424C28.1317 14.9829 26.9659 14.5 25.7503 14.5C24.2837 14.5 23.2503 14.9167 22.0003 16.1667C20.7503 14.9167 19.717 14.5 18.2503 14.5C17.0347 14.5 15.869 14.9829 15.0094 15.8424C14.1499 16.702 13.667 17.8678 13.667 19.0833C13.667 21 14.917 22.4583 16.167 23.6667L22.0003 29.5L27.8337 23.6667Z" stroke="#C70036" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    )
  },
  {
    id: 'Friend',
    label: 'Friend',
    description: 'A mutual, two-way relationship that\'s still developing.',
    icon: (<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 22C0 9.84974 9.84974 0 22 0C34.1503 0 44 9.84974 44 22C44 34.1503 34.1503 44 22 44C9.84974 44 0 34.1503 0 22Z" fill="#E6F0FF" />
      <path d="M27.8337 29.5V27.8333C27.8337 26.9493 27.4825 26.1014 26.8573 25.4763C26.2322 24.8512 25.3844 24.5 24.5003 24.5H19.5003C18.6163 24.5 17.7684 24.8512 17.1433 25.4763C16.5182 26.1014 16.167 26.9493 16.167 27.8333V29.5" stroke="#1447E6" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M22.0003 21.1667C23.8413 21.1667 25.3337 19.6743 25.3337 17.8333C25.3337 15.9924 23.8413 14.5 22.0003 14.5C20.1594 14.5 18.667 15.9924 18.667 17.8333C18.667 19.6743 20.1594 21.1667 22.0003 21.1667Z" stroke="#1447E6" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    )
  },
  {
    id: 'Buddy',
    label: 'Buddy',
    description: 'Someone you enjoy spending time with, usually around a shared place or setting.',
    icon: (<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 22C0 9.84974 9.84974 0 22 0C34.1503 0 44 9.84974 44 22C44 34.1503 34.1503 44 22 44C9.84974 44 0 34.1503 0 22Z" fill="#CA3500" fill-opacity="0.1" />
      <path d="M25.3337 29.5V27.8333C25.3337 26.9493 24.9825 26.1014 24.3573 25.4763C23.7322 24.8512 22.8844 24.5 22.0003 24.5H17.0003C16.1163 24.5 15.2684 24.8512 14.6433 25.4763C14.0182 26.1014 13.667 26.9493 13.667 27.8333V29.5" stroke="#CA3500" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M19.5003 21.1667C21.3413 21.1667 22.8337 19.6743 22.8337 17.8333C22.8337 15.9924 21.3413 14.5 19.5003 14.5C17.6594 14.5 16.167 15.9924 16.167 17.8333C16.167 19.6743 17.6594 21.1667 19.5003 21.1667Z" stroke="#CA3500" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M30.333 29.501V27.8344C30.3325 27.0958 30.0866 26.3784 29.6341 25.7946C29.1817 25.2109 28.5481 24.794 27.833 24.6094" stroke="#CA3500" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M25.333 14.6094C26.05 14.793 26.6855 15.21 27.1394 15.7946C27.5932 16.3793 27.8395 17.0984 27.8395 17.8385C27.8395 18.5787 27.5932 19.2978 27.1394 19.8824C26.6855 20.4671 26.05 20.8841 25.333 21.0677" stroke="#CA3500" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    )
  },
  {
    id: 'Emerging Friend',
    label: 'Emerging Friend',
    description: 'A newer local connection that feels promising and easy to grow.',
    icon: (<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 22C0 9.84974 9.84974 0 22 0C34.1503 0 44 9.84974 44 22C44 34.1503 34.1503 44 22 44C9.84974 44 0 34.1503 0 22Z" fill="#008236" fill-opacity="0.1" />
      <path d="M17.833 28.666H26.1663" stroke="#008236" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M20.333 28.6673C24.9163 26.584 20.9997 23.334 22.833 20.334" stroke="#008236" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M19.9163 19.8335C20.833 20.5002 21.4163 21.6668 21.833 22.9168C20.1663 23.2502 18.9163 23.2502 17.833 22.6668C16.833 22.1668 15.9163 21.0835 15.333 19.1668C17.6663 18.7502 18.9997 19.1668 19.9163 19.8335Z" stroke="#008236" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M23.7498 17.0007C23.1145 17.9936 22.7949 19.1558 22.8332 20.334C24.4165 20.2507 25.5832 19.834 26.4165 19.1673C27.2498 18.334 27.7498 17.2507 27.8332 15.334C25.5832 15.4173 24.4998 16.1673 23.7498 17.0007Z" stroke="#008236" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    )
  },
  {
    id: 'Old Friend',
    label: 'Old Friend',
    description: 'Someone you\'ve known a long time, even if you don\'t talk as often now.',
    icon: (<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 22C0 9.84974 9.84974 0 22 0C34.1503 0 44 9.84974 44 22C44 34.1503 34.1503 44 22 44C9.84974 44 0 34.1503 0 22Z" fill="#314158" fill-opacity="0.1" />
      <path d="M14.5 22C14.5 23.4834 14.9399 24.9334 15.764 26.1668C16.5881 27.4001 17.7594 28.3614 19.1299 28.9291C20.5003 29.4968 22.0083 29.6453 23.4632 29.3559C24.918 29.0665 26.2544 28.3522 27.3033 27.3033C28.3522 26.2544 29.0665 24.918 29.3559 23.4632C29.6453 22.0083 29.4968 20.5003 28.9291 19.1299C28.3614 17.7594 27.4001 16.5881 26.1668 15.764C24.9334 14.9399 23.4834 14.5 22 14.5C19.9033 14.5079 17.8908 15.326 16.3833 16.7833L14.5 18.6667" stroke="#314158" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M14.5 14.5V18.6667H18.6667" stroke="#314158" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M22 17.834V22.0007L25.3333 23.6673" stroke="#314158" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    )
  },
  {
    id: 'Remote Friend',
    label: 'Remote Friend',
    description: 'Someone who lives far away but still feels present in your life.',
    icon: (<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 22C0 9.84974 9.84974 0 22 0C34.1503 0 44 9.84974 44 22C44 34.1503 34.1503 44 22 44C9.84974 44 0 34.1503 0 22Z" fill="#314158" fill-opacity="0.1" />
      <path d="M14.5 22C14.5 23.4834 14.9399 24.9334 15.764 26.1668C16.5881 27.4001 17.7594 28.3614 19.1299 28.9291C20.5003 29.4968 22.0083 29.6453 23.4632 29.3559C24.918 29.0665 26.2544 28.3522 27.3033 27.3033C28.3522 26.2544 29.0665 24.918 29.3559 23.4632C29.6453 22.0083 29.4968 20.5003 28.9291 19.1299C28.3614 17.7594 27.4001 16.5881 26.1668 15.764C24.9334 14.9399 23.4834 14.5 22 14.5C19.9033 14.5079 17.8908 15.326 16.3833 16.7833L14.5 18.6667" stroke="#314158" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M14.5 14.5V18.6667H18.6667" stroke="#314158" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M22 17.834V22.0007L25.3333 23.6673" stroke="#314158" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    )
  },
  {
    id: 'Activity Friend',
    label: 'Activity Friend',
    description: 'Someone you mainly see around a specific activity or hobby.',
    icon: (<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 22C0 9.84974 9.84974 0 22 0C34.1503 0 44 9.84974 44 22C44 34.1503 34.1503 44 22 44C9.84974 44 0 34.1503 0 22Z" fill="#8200DB" fill-opacity="0.1" />
      <path d="M15.3332 23.6662C15.1755 23.6668 15.0209 23.6226 14.8874 23.5387C14.7538 23.4549 14.6468 23.3349 14.5787 23.1926C14.5106 23.0504 14.4843 22.8917 14.5028 22.7351C14.5213 22.5785 14.5839 22.4304 14.6832 22.3079L22.9332 13.8079C22.9951 13.7365 23.0795 13.6882 23.1724 13.671C23.2653 13.6538 23.3613 13.6687 23.4447 13.7133C23.528 13.7579 23.5937 13.8295 23.631 13.9163C23.6683 14.0032 23.675 14.1001 23.6499 14.1912L22.0499 19.2079C22.0027 19.3342 21.9869 19.47 22.0037 19.6037C22.0206 19.7375 22.0696 19.8651 22.1467 19.9758C22.2237 20.0864 22.3264 20.1767 22.446 20.2389C22.5656 20.3011 22.6984 20.3333 22.8332 20.3329H28.6666C28.8243 20.3324 28.9789 20.3766 29.1124 20.4604C29.246 20.5443 29.3531 20.6643 29.4211 20.8065C29.4892 20.9488 29.5155 21.1074 29.497 21.264C29.4785 21.4206 29.4159 21.5688 29.3166 21.6912L21.0666 30.1912C21.0047 30.2627 20.9204 30.3109 20.8274 30.3281C20.7345 30.3453 20.6385 30.3304 20.5551 30.2858C20.4718 30.2412 20.4061 30.1697 20.3688 30.0828C20.3315 29.996 20.3248 29.899 20.3499 29.8079L21.9499 24.7912C21.9971 24.665 22.0129 24.5291 21.9961 24.3954C21.9792 24.2617 21.9302 24.134 21.8532 24.0234C21.7761 23.9128 21.6734 23.8225 21.5538 23.7603C21.4343 23.6981 21.3014 23.6658 21.1666 23.6662H15.3332Z" stroke="#8200DB" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    )
  },
  {
    id: 'Work Friend',
    label: 'Work Friend',
    description: 'Someone you know through work and generally get along with or rely on.',
    icon: (<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 22C0 9.84974 9.84974 0 22 0C34.1503 0 44 9.84974 44 22C44 34.1503 34.1503 44 22 44C9.84974 44 0 34.1503 0 22Z" fill="#007595" fill-opacity="0.1" />
      <path d="M25.3337 28.666V15.3327C25.3337 14.8907 25.1581 14.4667 24.8455 14.1542C24.5329 13.8416 24.109 13.666 23.667 13.666H20.3337C19.8916 13.666 19.4677 13.8416 19.1551 14.1542C18.8426 14.4667 18.667 14.8907 18.667 15.3327V28.666" stroke="#007595" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M28.667 17H15.3337C14.4132 17 13.667 17.7462 13.667 18.6667V27C13.667 27.9205 14.4132 28.6667 15.3337 28.6667H28.667C29.5875 28.6667 30.3337 27.9205 30.3337 27V18.6667C30.3337 17.7462 29.5875 17 28.667 17Z" stroke="#007595" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    )
  },
];

export default function FriendTypesModal({ isOpen, onClose, onSelect, selectedType }: FriendTypesModalProps) {
  if (!isOpen) return null;

  const handleSelect = (typeId: string) => {
    onSelect(typeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-gradient-to-r from-[#FEF7FF] to-[#FCF7FF] rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className='flex justify-end p-3'>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-bg-muted flex items-center justify-center transition-colors flex-shrink-0 ml-4"
          >
            <X className="w-5 h-5 text-text-muted" strokeWidth={1.67} />
          </button>
        </div>
        <div className="flex items-center justify-between p-8 pb-6 ">
          <div className="flex-1">
            <h2 className="text-6xl font-semibold text-text-primary mb-6 text-center" style={{ letterSpacing: '-0.848px' }}>
              Friend Types
            </h2>
            <p className="text-2xl text-center font-medium text-text-secondary" style={{ letterSpacing: '0.07px' }}>
              Select the category that best fits this relationship right now.
            </p>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 py-8 px-16">
          <div className="grid justify-center gap-6 [grid-template-columns:repeat(auto-fill,minmax(350px,350px))]">
            {FRIEND_TYPES.map((type) => {
              const isSelected = selectedType === type.id

              return (
                <button
                  key={type.id}
                  onClick={() => handleSelect(type.id)}
                  className="group w-[350px] p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg hover:border-opacity-60 bg-white"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-11 h-11 flex-shrink-0">
                      {type.icon}
                    </div>

                    <h3
                      className={`text-base font-semibold leading-5 ${isSelected ? 'text-brand-purple' : 'text-text-primary'
                        }`}
                      style={{ letterSpacing: '0.08px' }}
                    >
                      {type.label}
                    </h3>
                  </div>

                  <p
                    className="text-xs font-medium leading-[18px] text-text-secondary"
                    style={{ letterSpacing: '0.06px' }}
                  >
                    {type.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
