import { getImage } from 'astro:assets';
import teamData, { type TeamMember } from '~/data/teams';

export type MemberProfile = TeamMember & {
  id: string;
  photoResolved?: ImageMetadata;
  photoUrl?: string;
};
export type PublicProfile = Omit<MemberProfile, 'photoResolved'>;

export interface TeamGroup {
  id: string;
  label: string;
  color: string;
  members: MemberProfile[];
}

export interface TeamDivision extends TeamGroup {
  lead?: MemberProfile;
  managers: MemberProfile[];
  roster: MemberProfile[];
}

export const teamColors = {
  leadership: '#e18a73',
  mentors: '#c7a780',
  computing: '#9ba68d',
  mechanical: '#b5705f',
  science: '#bdab77',
  electrical: '#9e8877',
  media: '#b49f9d',
};

const divisions = [
  { key: 'CS and AI', id: 'computer-science', label: 'CS & AI', lead: 'Chaturya', color: teamColors.computing },
  { key: 'Science', id: 'science', label: 'Science', lead: 'Lohitashwa Talamanchi', color: teamColors.science },
  { key: 'Electrical', id: 'electrical', label: 'EC & EE', lead: 'Prakhar', color: teamColors.electrical },
  { key: 'Mechanical', id: 'mechanical', label: 'Mechanical', lead: 'M Nikhil', color: teamColors.mechanical },
  { key: 'Media', id: 'media', label: 'Media', lead: 'Pragathi L', color: teamColors.media },
];

const images = import.meta.glob<{ default: ImageMetadata }>('/src/data/profilepic/*.{jpeg,jpg,png,gif,webp}');
const photoCache = new Map<string, Promise<{ photoResolved: ImageMetadata; photoUrl: string } | undefined>>();

function resolvePhoto(filename?: string | null) {
  if (!filename || filename === 'default.png') return Promise.resolve(undefined);
  if (!photoCache.has(filename)) {
    photoCache.set(
      filename,
      (async () => {
        const load = images[`/src/data/profilepic/${filename}`];
        if (!load) return undefined;
        const { default: photoResolved } = await load();
        const image = await getImage({ src: photoResolved, width: 640, format: 'webp' });
        return { photoResolved, photoUrl: image.src };
      })()
    );
  }
  return photoCache.get(filename)!;
}

const uniqueMembers = (members: MemberProfile[]) => [
  ...new Map(members.map((member) => [member.name, member])).values(),
];

export async function getTeamDirectory() {
  const entries = await Promise.all(
    Object.entries(teamData).map(
      async ([key, members]) =>
        [
          key,
          await Promise.all(
            members.map(
              async (member, index): Promise<MemberProfile> => ({
                ...member,
                id: `${key}-${index}`,
                ...(await resolvePhoto(member.photo)),
              })
            )
          ),
        ] as const
    )
  );
  const resolved = Object.fromEntries(entries);
  const mentors = resolved.Mentors ?? [];
  const leadership = resolved.TeamLead ?? [];
  const managers = resolved['Project Manager'] ?? [];
  const teams: TeamDivision[] = divisions.map(({ key, lead: leadName, ...group }) => {
    const lead = leadership.find((member) => member.name === leadName);
    const projectManagers = managers.filter((member) => member.subdivision === group.label);
    const roster = resolved[key] ?? [];
    return {
      ...group,
      lead,
      managers: projectManagers,
      roster,
      members: uniqueMembers([...(lead ? [lead] : []), ...projectManagers, ...roster]),
    };
  });
  const teamLeadIds = new Set(teams.map((team) => team.lead?.id));
  const journalGroups: TeamGroup[] = [
    { id: 'mentors', label: 'Faculty mentors', color: teamColors.mentors, members: mentors },
    {
      id: 'leadership',
      label: 'Leadership',
      color: teamColors.leadership,
      members: leadership.filter((member) => !teamLeadIds.has(member.id)),
    },
    ...teams,
  ].filter((group) => group.members.length > 0);
  const legacyGroups: TeamGroup[] = [
    { id: 'mentors', label: 'Faculty Mentors', color: teamColors.mentors, members: mentors },
    { id: 'leadership', label: 'Leadership', color: teamColors.leadership, members: leadership },
    ...teams.map((team) => ({ ...team, members: [...team.managers, ...team.roster] })),
  ].filter((group) => group.members.length > 0);

  const profiles: Record<string, PublicProfile> = Object.fromEntries(
    entries.flatMap(([, members]) => members.map(({ photoResolved: _photo, ...member }) => [member.id, member]))
  );
  return {
    mentors,
    teams,
    journalGroups,
    legacyGroups,
    technicalLead: leadership.find((member) => member.role === 'Technical Lead'),
    administrativeLead: leadership.find((member) => member.role === 'Administrative Lead'),
    profiles,
  };
}

export type TeamDirectory = Awaited<ReturnType<typeof getTeamDirectory>>;

export const initials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
export const avatarGradient = (color: string, strength = 65) =>
  `linear-gradient(135deg, color-mix(in srgb, ${color} ${strength}%, #222123), ${color})`;
export function photoPosition(member: MemberProfile) {
  if (member.name === 'Chaturya') return 'center center';
  return member.photoResolved && member.photoResolved.height > member.photoResolved.width * 1.15
    ? 'center 24%'
    : 'center center';
}
