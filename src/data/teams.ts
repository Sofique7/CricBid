import { Player } from './players';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string; // primary neon/branding color
  secondaryColor: string;
  purse: number; // in Crores, starts at 120.0
  logoUrl: string; // URL to team logo image
  players: Player[];
}

export const initialTeams: Team[] = [
  {
    id: 'team_csk',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    color: '#FFCB05',
    secondaryColor: '#005CA5',
    purse: 120.0,
    logoUrl: '/logos/csk.png',
    players: []
  },
  {
    id: 'team_mi',
    name: 'Mumbai Indians',
    shortName: 'MI',
    color: '#004BA0',
    secondaryColor: '#D1AB3A',
    purse: 120.0,
    logoUrl: '/logos/mi.png',
    players: []
  },
  {
    id: 'team_rcb',
    name: 'Royal Challengers Bengaluru',
    shortName: 'RCB',
    color: '#EC1C24',
    secondaryColor: '#BCA570',
    purse: 120.0,
    logoUrl: '/logos/rcb.png',
    players: []
  },
  {
    id: 'team_kkr',
    name: 'Kolkata Knight Riders',
    shortName: 'KKR',
    color: '#3A225D',
    secondaryColor: '#F1C40F',
    purse: 120.0,
    logoUrl: '/logos/kkr.png',
    players: []
  },
  {
    id: 'team_dc',
    name: 'Delhi Capitals',
    shortName: 'DC',
    color: '#0078BC',
    secondaryColor: '#EF4123',
    purse: 120.0,
    logoUrl: '/logos/dc.png',
    players: []
  },
  {
    id: 'team_rr',
    name: 'Rajasthan Royals',
    shortName: 'RR',
    color: '#E73895',
    secondaryColor: '#004B87',
    purse: 120.0,
    logoUrl: '/logos/rr.png',
    players: []
  },
  {
    id: 'team_srh',
    name: 'Sunrisers Hyderabad',
    shortName: 'SRH',
    color: '#F26522',
    secondaryColor: '#000000',
    purse: 120.0,
    logoUrl: '/logos/srh.png',
    players: []
  },
  {
    id: 'team_pbks',
    name: 'Punjab Kings',
    shortName: 'PBKS',
    color: '#DD1D21',
    secondaryColor: '#D2D3D5',
    purse: 120.0,
    logoUrl: '/logos/punjab.png',
    players: []
  },
  {
    id: 'team_gt',
    name: 'Gujarat Titans',
    shortName: 'GT',
    color: '#1B2133',
    secondaryColor: '#E5B80B',
    purse: 120.0,
    logoUrl: '/logos/gt.png',
    players: []
  },
  {
    id: 'team_lsg',
    name: 'Lucknow Super Giants',
    shortName: 'LSG',
    color: '#0C2340',
    secondaryColor: '#13A499',
    purse: 120.0,
    logoUrl: '/logos/lsg.svg',
    players: []
  }
];
