import gravatar from "gravatar";
import { differenceInYears } from "date-fns";

import MdiGithub from "~icons/mdi/github";
import MdiTwitter from "~icons/mdi/twitter";
import MdiLinkedin from "~icons/mdi/linkedin";
import MdiInstagram from "~icons/mdi/instagram";
import MdiGmail from '~icons/mdi/gmail';

import DeviconRedis from '~icons/devicon/redis';
import DeviconSvelte from '~icons/devicon/svelte';
import DeviconClojure from '~icons/devicon/clojure';
import DeviconPostgresql from '~icons/devicon/postgresql';
import DeviconGoWordmark from '~icons/devicon/go-wordmark'
import DeviconApachekafka from '~icons/devicon/apachekafka';
import DeviconSupabase from '~icons/devicon/supabase'

import aarityaLogo from "./assets/company.png";
import gojekLogo from "./assets/gojek.svg";
import docutalkLogo from "./assets/docutalk.png";
import directiLogo from "./assets/directi.png";

export const SITE_TITLE = 'spy16.in';
export const SITE_DESCRIPTION = 'Welcome!';
export const TWITTER_HANDLE = '@spy16x';

export const AVATAR = gravatar.url("shiv.ylp@gmail.com", {
    size: "512",
});

export const EXPERIENCE = differenceInYears(new Date(), new Date(2016, 6, 16));

export const SOCIALS = [
    {
        css: "hover:text-gmail",
        url: "mailto:shiv.ylp@gmail.com",
        Icon: MdiGmail,
    },
    {
        css: "",
        url: "https://github.com/spy16",
        Icon: MdiGithub,
    },
    {
        css: "hover:text-twitter",
        url: "https://twitter.com/spy16x",
        Icon: MdiTwitter,
    },
    {
        css: "hover:text-linkedin",
        url: "https://linkedin.com/in/shivaprasadbhat",
        Icon: MdiLinkedin,
    },
    {
        css: "hover:text-instagram",
        url: "https://instagram.com/spy16x",
        Icon: MdiInstagram,
    },
];

export const WORK = [
    {
        company: 'Aaritya',
        role: 'Software Engineer',
        duration: 'Nov 2023 - Present',
        logo: aarityaLogo,
        href: 'https://aaritya.com',
        external: true
    },
    {
        company: 'GoJek',
        role: 'Product Engineer',
        duration: 'Jul 2018 - Nov 2023',
        logo: gojekLogo,
        href: 'https://gojek.com',
        external: true
    },
    {
        company: 'DocuTalk (Acquired)',
        role: 'Founder',
        duration: 'Feb 2023 - Aug 2023',
        logo: docutalkLogo,
        href: '/projects/docutalk'
    },
    {
        company: 'Directi',
        role: 'Software Engineer',
        duration: 'Jul 2016 - Jul 2018',
        logo: directiLogo,
        href: 'https://directi.com',
        external: true
    }
];

type TechDef = {
    name: string;
    href: string;
    external: boolean;
    Icon: astroHTML.JSX.Element;
}

export const SKILLS: Record<string, TechDef> = {
    Go: {
        name: 'Go',
        Icon: DeviconGoWordmark,
        href: 'https://golang.org',
        external: true
    },
    Clojure: {
        name: 'Clojure',
        Icon: DeviconClojure,
        href: 'https://clojure.org',
        external: true
    },
    Kafka: {
        name: 'Kafka',
        Icon: DeviconApachekafka,
        href: 'https://kafka.apache.org',
        external: true
    },
    Redis: {
        name: 'Redis',
        Icon: DeviconRedis,
        href: 'https://redis.io',
        external: true
    },
    Postgres: {
        name: 'Postgres',
        Icon: DeviconPostgresql,
        href: 'https://postgresql.org',
        external: true
    },
    SvelteKit: {
        name: 'SvelteKit',
        Icon: DeviconSvelte,
        href: 'https://kit.svelte.dev',
        external: true
    },
    Supabase: {
        name: "Supabase",
        Icon: DeviconSupabase,
        href: "https://supabase.io",
        external: true
    }
}
