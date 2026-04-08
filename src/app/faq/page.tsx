import { Metadata } from 'next';
import FaqContent from './FaqContent';

export const metadata: Metadata = {
  title: 'FAQ - ScarsHQ',
  description: 'Frequently asked questions about Scars of Honor - free to play, classes, races, PvP, PvE, and more.',
};

export default function FaqPage() {
  return <FaqContent />;
}
