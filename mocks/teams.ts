import { Team } from '@/types';

export const mockTeams: Team[] = [
  {
    id: 'marketing',
    name: 'Marketing and Fan Experience',
    description: 'DePaul Blue Demons Marketing Team',
    managerId: '1',
    subManagerIds: ['3'],
    memberIds: ['4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
    color: '#1e3a8a',
  },
  {
    id: 'ticketing',
    name: 'Ticketing and Gameday Crew',
    description: 'DePaul Blue Demons Gameday Crew',
    managerId: '14',
    subManagerIds: ['15'],
    memberIds: ['16', '17', '18', '19', '20'],
    color: '#dc2626',
  },
];
