import { createFileRoute } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useProfileStore } from '@/features/profile/store/profile.store';
import { Briefcase, Github, Globe, Mail, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';

export const Route = createFileRoute('/profile')({
    component: RouteComponent,
});

type ProfileDraft = {
    name: string;
    headline: string;
    location: string;
    about: string;
    skillsCsv: string;
    email: string;
    website: string;
    github: string;
};

function normalizeUrl(value: string): string {
    const v = value.trim();
    if (!v) return '';
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    return `https://${v}`;
}

function RouteComponent() {
    const name = useProfileStore(state => state.name);
    const headline = useProfileStore(state => state.headline);
    const location = useProfileStore(state => state.location);
    const about = useProfileStore(state => state.about);
    const skills = useProfileStore(state => state.skills);
    const email = useProfileStore(state => state.email);
    const website = useProfileStore(state => state.website);
    const github = useProfileStore(state => state.github);

    const setName = useProfileStore(state => state.setName);
    const setHeadline = useProfileStore(state => state.setHeadline);
    const setLocation = useProfileStore(state => state.setLocation);
    const setAbout = useProfileStore(state => state.setAbout);
    const setSkillsFromCsv = useProfileStore(state => state.setSkillsFromCsv);
    const setEmail = useProfileStore(state => state.setEmail);
    const setWebsite = useProfileStore(state => state.setWebsite);
    const setGithub = useProfileStore(state => state.setGithub);
    const reset = useProfileStore(state => state.reset);

    const displayName = name.trim() || 'Your Name';
    const displayHeadline = headline.trim() || 'Add a short headline';
    const displayLocation = location.trim() || 'Location';

    const initials = useMemo(() => {
        const parts = displayName.split(' ').filter(Boolean).slice(0, 2);
        const letters = parts.map(part => part[0]?.toUpperCase()).filter(Boolean).join('');
        return letters || 'U';
    }, [displayName]);

    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState<ProfileDraft>({
        name,
        headline,
        location,
        about,
        skillsCsv: skills.join(', '),
        email,
        website,
        github,
    });

    const openEdit = () => {
        setDraft({
            name,
            headline,
            location,
            about,
            skillsCsv: skills.join(', '),
            email,
            website,
            github,
        });
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
    };

    const saveEdit = () => {
        setName(draft.name);
        setHeadline(draft.headline);
        setLocation(draft.location);
        setAbout(draft.about);
        setSkillsFromCsv(draft.skillsCsv);
        setEmail(draft.email);
        setWebsite(normalizeUrl(draft.website));
        setGithub(normalizeUrl(draft.github));
        setIsEditing(false);
    };

    return (
        <div className="flex h-dvh w-full flex-1 flex-col overflow-hidden">
            <header className="bg-background sticky top-0 z-10 border-b">
                <div className="flex h-12 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <span className="bg-muted flex size-8 items-center justify-center rounded-md border">
                            <Briefcase className="text-muted-foreground size-4" />
                        </span>
                        <div className="leading-tight">
                            <div className="text-sm font-semibold">Profile</div>
                            <div className="text-muted-foreground text-xs">Your professional snapshot</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" size="sm" className="h-8" onClick={cancelEdit}>
                                    Cancel
                                </Button>
                                <Button size="sm" className="h-8" onClick={saveEdit}>
                                    Save
                                </Button>
                            </>
                        ) : (
                            <>
                                {email.trim() ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8"
                                        asChild
                                        aria-label="Email"
                                        title="Email"
                                    >
                                        <a href={`mailto:${email.trim()}`}>
                                            <Mail className="size-4" />
                                            Email
                                        </a>
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" className="h-8" disabled>
                                        <Mail className="size-4" />
                                        Email
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" className="h-8" onClick={openEdit}>
                                    Edit
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="min-h-0 flex-1 overflow-auto">
                <div className="mx-auto w-full max-w-4xl px-4 py-4">
                    <Card>
                        <CardHeader className="gap-2">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-full border text-sm font-semibold">
                                        {initials}
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="truncate">{displayName}</CardTitle>
                                        <CardDescription className="mt-1">{displayHeadline}</CardDescription>
                                        <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-xs">
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin className="size-3.5" />
                                                {displayLocation}
                                            </span>
                                            <Badge variant="secondary">Saved locally</Badge>
                                        </div>
                                    </div>
                                </div>

                                {!isEditing ? (
                                    <div className="flex flex-wrap gap-2 sm:justify-end">
                                        {website.trim() ? (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={website.trim()} target="_blank" rel="noreferrer">
                                                    <Globe className="size-4" />
                                                    Website
                                                </a>
                                            </Button>
                                        ) : null}
                                        {github.trim() ? (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={github.trim()} target="_blank" rel="noreferrer">
                                                    <Github className="size-4" />
                                                    GitHub
                                                </a>
                                            </Button>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {isEditing ? (
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-semibold">Edit profile</div>
                                            <div className="text-muted-foreground text-xs">Saved locally in this browser</div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setDraft({
                                                    name: '',
                                                    headline: '',
                                                    location: '',
                                                    about: '',
                                                    skillsCsv: '',
                                                    email: '',
                                                    website: '',
                                                    github: '',
                                                })
                                            }
                                        >
                                            Clear
                                        </Button>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="profile-name">Name</Label>
                                            <Input
                                                id="profile-name"
                                                value={draft.name}
                                                placeholder="Jane Doe"
                                                onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="profile-headline">Headline</Label>
                                            <Input
                                                id="profile-headline"
                                                value={draft.headline}
                                                placeholder="Software Engineer"
                                                onChange={e => setDraft(d => ({ ...d, headline: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="profile-location">Location</Label>
                                            <Input
                                                id="profile-location"
                                                value={draft.location}
                                                placeholder="Remote / City"
                                                onChange={e => setDraft(d => ({ ...d, location: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="profile-email">Email</Label>
                                            <Input
                                                id="profile-email"
                                                value={draft.email}
                                                placeholder="you@example.com"
                                                inputMode="email"
                                                onChange={e => setDraft(d => ({ ...d, email: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="profile-website">Website</Label>
                                            <Input
                                                id="profile-website"
                                                value={draft.website}
                                                placeholder="example.com"
                                                inputMode="url"
                                                onChange={e => setDraft(d => ({ ...d, website: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="profile-github">GitHub</Label>
                                            <Input
                                                id="profile-github"
                                                value={draft.github}
                                                placeholder="github.com/your-handle"
                                                inputMode="url"
                                                onChange={e => setDraft(d => ({ ...d, github: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="profile-about">Bio</Label>
                                        <textarea
                                            id="profile-about"
                                            value={draft.about}
                                            placeholder="Write 1–2 sentences about what you do."
                                            onChange={e => setDraft(d => ({ ...d, about: e.target.value }))}
                                            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-24 w-full resize-y rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="profile-skills">Skills (comma-separated)</Label>
                                        <Input
                                            id="profile-skills"
                                            value={draft.skillsCsv}
                                            placeholder="Solidity, TypeScript, React"
                                            onChange={e => setDraft(d => ({ ...d, skillsCsv: e.target.value }))}
                                        />
                                        <div className="text-muted-foreground text-xs">
                                            Press <span className="font-medium">Save</span> when you’re done.
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                reset();
                                                setDraft({
                                                    name: '',
                                                    headline: '',
                                                    location: '',
                                                    about: '',
                                                    skillsCsv: '',
                                                    email: '',
                                                    website: '',
                                                    github: '',
                                                });
                                                setIsEditing(false);
                                            }}
                                        >
                                            Reset saved profile
                                        </Button>
                                    </div>
                                </section>
                            ) : (
                                <>
                                    <section className="space-y-2">
                                        <div className="text-sm font-semibold">About</div>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {about.trim() || 'No bio yet. Click Edit to add one.'}
                                        </p>
                                    </section>

                                    <Separator />

                                    <section className="space-y-2">
                                        <div className="text-sm font-semibold">Skills</div>
                                        {skills.length ? (
                                            <div className="flex flex-wrap gap-2">
                                                {skills.map(skill => (
                                                    <Badge key={skill} variant="outline">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-sm">No skills added yet.</p>
                                        )}
                                    </section>

                                    <Separator />

                                    <section className="space-y-2">
                                        <div className="text-sm font-semibold">Contact</div>
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <Card className="border-dashed">
                                                <CardHeader className="pb-2">
                                                    <CardDescription className="flex items-center gap-2">
                                                        <Mail className="size-4" />
                                                        Email
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    {email.trim() ? (
                                                        <Button variant="link" className="h-auto p-0" asChild>
                                                            <a href={`mailto:${email.trim()}`}>{email.trim()}</a>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">—</span>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            <Card className="border-dashed">
                                                <CardHeader className="pb-2">
                                                    <CardDescription className="flex items-center gap-2">
                                                        <Globe className="size-4" />
                                                        Website
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    {website.trim() ? (
                                                        <Button variant="link" className="h-auto p-0" asChild>
                                                            <a href={website.trim()} target="_blank" rel="noreferrer">
                                                                {website.trim().replace(/^https?:\/\//, '')}
                                                            </a>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">—</span>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            <Card className="border-dashed">
                                                <CardHeader className="pb-2">
                                                    <CardDescription className="flex items-center gap-2">
                                                        <Github className="size-4" />
                                                        GitHub
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    {github.trim() ? (
                                                        <Button variant="link" className="h-auto p-0" asChild>
                                                            <a href={github.trim()} target="_blank" rel="noreferrer">
                                                                {github.trim().replace(/^https?:\/\//, '')}
                                                            </a>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">—</span>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </section>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
