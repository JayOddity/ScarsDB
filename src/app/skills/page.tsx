import type { Metadata } from 'next';
import ComingSoon from '@/components/ComingSoon';

export const metadata: Metadata = {
  title: 'Skills & Abilities - ScarsHQ',
  description: 'A full database of class skills and abilities for Scars of Honor.',
};

export default function SkillsPage() {
  return (
    <ComingSoon
      title="Skills & Abilities"
      description="Will contain a full database of class skills and abilities once available. Browse every active, passive, and ultimate ability across all classes in Scars of Honor."
    />
  );
}
