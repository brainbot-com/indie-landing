Files for the indie.solutions launch. The deploy folder is not published.
At launch: replace /llms.txt and /sitemap.xml with these, build the homepage at /en/ and /de/ (INDIE_HOME_EN=en/ INDIE_HOME_DE=de/ bash scripts/site-builder/rebuild.sh, as the staging deploy does),
and remove the "noindex" robots tag from the new pages.
