import rss from "@astrojs/rss";

import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import { getPosts, urlOf } from "../lib/brain";

export async function GET(context) {
  const posts = await getPosts();
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: urlOf(p),
    })),
  });
}
