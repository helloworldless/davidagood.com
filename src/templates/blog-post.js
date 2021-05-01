import React from "react";
import { graphql, Link } from "gatsby";
import Disqus from "gatsby-plugin-disqus";

import Bio from "../components/bio";
import Layout from "../components/layout";
import SEO from "../components/seo";
import { rhythm, scale } from "../utils/typography";
import { MdLaunch } from "react-icons/md";
import Image from "gatsby-image";

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.markdownRemark;
  const { siteMetadata } = data.site;
  const { previous, next } = pageContext;

  const disqusConfig = {
    url: `${siteMetadata.siteUrl + location.pathname}`,
    identifier: post.id,
    title: post.frontmatter.title,
  };

  return (
    <Layout location={location} title={siteMetadata.title}>
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
        {post.frontmatter.isExternal ? (
          <section>
            <div style={{ marginBottom: rhythm(0.5) }}>
              <a
                style={{ boxShadow: `none` }}
                href={post.frontmatter.externalUrl}
              >
                <span>
                  {post.frontmatter.title} <MdLaunch />
                </span>
              </a>
            </div>
            <p>{post.frontmatter.description}</p>
          </section>
        ) : (
          <>
            {post.frontmatter.image?.childImageSharp?.fluid && (
              <>
                <figure>
                  <Image
                    fluid={post.frontmatter.image.childImageSharp.fluid}
                    alt={post.frontmatter.imageAlt}
                  />
                  <figcaption
                    style={{
                      textAlign: "center",
                      fontSize: "14px",
                      paddingTop: "8px",
                    }}
                  >
                    <cite
                      dangerouslySetInnerHTML={{
                        __html: post.frontmatter.imageCaption,
                      }}
                    />
                  </figcaption>
                </figure>
              </>
            )}
            <section dangerouslySetInnerHTML={{ __html: post.html }} />
          </>
        )}
        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />
        <Disqus config={disqusConfig} />
        <footer>
          <Bio />
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
        siteUrl
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
            fixed(height: 600, width: 1200) {
              src
            }
            fluid(maxWidth: 700, maxHeight: 500) {
              ...GatsbyImageSharpFluid
            }
          }
        }
        imageCaption
        imageAlt
      }
    }
  }
`;
