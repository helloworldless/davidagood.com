import React from "react";
import { graphql, Link } from "gatsby";

import Bio from "../components/bio";
import Layout from "../components/layout";
import SEO from "../components/seo";
import { rhythm, scale } from "../utils/typography";
import { MdLaunch } from "react-icons/md";

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.markdownRemark;
  const siteTitle = data.site.siteMetadata.title;
  const { previous, next } = pageContext;

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
        imageSrc={post.frontmatter.image?.childImageSharp?.fixed?.src}
        imageAlt={post.frontmatter.imageAlt}
      />
      <article>
        <header>
          <h1
            style={{
              marginTop: rhythm(1),
              marginBottom: 0,
            }}
          >
            {post.frontmatter.title}
          </h1>
          <p
            style={{
              ...scale(-1 / 5),
              display: `block`,
              marginBottom: rhythm(1),
            }}
          >
            {post.frontmatter.date}
          </p>
        </header>
        {post.frontmatter.isExternal
          ? <section>
            <div style={{ marginBottom: rhythm(0.5) }}>
              <a style={{ boxShadow: `none` }} href={post.frontmatter.externalUrl}>
                <span>{post.frontmatter.title} <MdLaunch/></span>
              </a>
            </div>
            <p>{post.frontmatter.description}</p>
          </section>
          : <section dangerouslySetInnerHTML={{ __html: post.html }}/>
        }
        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />
        <footer>
          <Bio/>
        </footer>
      </article>

      <nav>
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  );
};

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        isExternal
        externalUrl
        image {
          childImageSharp {
            # Dimensions based on specifications mentioned here under 'twitter:image': 
            # https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/summary-card-with-large-image
            fixed(height: 600, width: 1200) {
              ...GatsbyImageSharpFixed
            }
          }
        }
        imageAlt
      }
    }
  }
`;