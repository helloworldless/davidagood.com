import React from "react";
import { graphql, Link } from "gatsby";

import Bio from "../components/bio";
import Layout from "../components/layout";
import SEO from "../components/seo";
import { rhythm, scale } from "../utils/typography";
import { MdLaunch } from "react-icons/md";
import Image from "gatsby-image";
import { constructUrl } from "../utils/urlUtil";

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.markdownRemark;
  const { siteMetadata } = data.site;
  const { previous, next } = pageContext;

  return (
    <Layout location={location} title={siteMetadata.title}>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
        imageUrl={constructUrl(siteMetadata.siteUrl, post.frontmatter.image?.childImageSharp?.fixed?.src)}
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
          : <>
            {post.frontmatter.image?.childImageSharp?.fluid &&
            <>
              <Image
                fluid={post.frontmatter.image.childImageSharp.fluid}
                alt={post.frontmatter.imageAlt}
              />
              <div
                style={{
                  textAlign: "center",
                  fontSize: "14px",
                  lineHeight: "28px",
                }}
                dangerouslySetInnerHTML={{ __html: post.frontmatter.imageTitleHtml }} />
              <br />
              <br />
            </>}
            <section dangerouslySetInnerHTML={{ __html: post.html }} />
          </>
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
        siteUrl
      }
    }
    markdownRemark(fields: {slug: {eq: $slug}}) {
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
        imageTitleHtml
        imageAlt
      }
    }
  }
`;