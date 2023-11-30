import { getCollection } from "astro:content";
import { isBefore } from "date-fns";

async function getPosts() {
    const posts = (await getCollection("blog"))
        .filter((p) => !!p.data.publish)
        .sort((a, b) => (isBefore(a.data.date, b.data.date) ? 1 : -1));

    // return posts;
    return posts.map(({ slug, data }) => ({
        slug: slug,
        title: data.title,
        description: data.description,
        date: data.pubDate,
    }));
}

export async function get({ }) {
    return new Response(JSON.stringify(await getPosts()), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}