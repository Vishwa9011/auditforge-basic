import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ProfileState = {
    name: string;
    headline: string;
    location: string;
    about: string;
    skills: string[];
    email: string;
    website: string;
    github: string;

    setName: (value: string) => void;
    setHeadline: (value: string) => void;
    setLocation: (value: string) => void;
    setAbout: (value: string) => void;
    setSkillsFromCsv: (value: string) => void;
    setEmail: (value: string) => void;
    setWebsite: (value: string) => void;
    setGithub: (value: string) => void;
    reset: () => void;
};

const DEFAULTS: Pick<
    ProfileState,
    'name' | 'headline' | 'location' | 'about' | 'skills' | 'email' | 'website' | 'github'
> = {
    name: '',
    headline: '',
    location: '',
    about: '',
    skills: [],
    email: '',
    website: '',
    github: '',
};

function normalizeSkills(value: string): string[] {
    return value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .slice(0, 24);
}

export const useProfileStore = create<ProfileState>()(
    persist(
        immer(set => ({
            ...DEFAULTS,

            setName: value => {
                set(state => {
                    state.name = value;
                });
            },

            setHeadline: value => {
                set(state => {
                    state.headline = value;
                });
            },

            setLocation: value => {
                set(state => {
                    state.location = value;
                });
            },

            setAbout: value => {
                set(state => {
                    state.about = value;
                });
            },

            setSkillsFromCsv: value => {
                set(state => {
                    state.skills = normalizeSkills(value);
                });
            },

            setEmail: value => {
                set(state => {
                    state.email = value;
                });
            },

            setWebsite: value => {
                set(state => {
                    state.website = value;
                });
            },

            setGithub: value => {
                set(state => {
                    state.github = value;
                });
            },

            reset: () => {
                set(state => {
                    state.name = DEFAULTS.name;
                    state.headline = DEFAULTS.headline;
                    state.location = DEFAULTS.location;
                    state.about = DEFAULTS.about;
                    state.skills = DEFAULTS.skills;
                    state.email = DEFAULTS.email;
                    state.website = DEFAULTS.website;
                    state.github = DEFAULTS.github;
                });
            },
        })),
        {
            name: 'profile',
            version: 1,
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

