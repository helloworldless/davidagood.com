/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Image from "gatsby-image";

import { rhythm } from "../utils/typography";

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/David_Good_Headshot.jpg/" }) {
        childImageSharp {
          fixed(width: 50, height: 50) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
          }
        }
      }
    }
  `);

  const { author } = data.site.siteMetadata;
  const helpBioAppearCenteredUnderSiteTitle = '1rem';
  return (
    <div
      style={{
        display: `flex`,
        marginBottom: rhythm(1.5),
        marginLeft: helpBioAppearCenteredUnderSiteTitle,
      }}
    >
      <Image
        fixed={data.avatar.childImageSharp.fixed}
        alt={author.name}
        style={{
          marginRight: rhythm(1 / 2),
          marginBottom: 0,
          minWidth: 50,
          borderRadius: `100%`,
        }}
        imgStyle={{
          borderRadius: `50%`,
        }}
      />
      <p>
        {author.summary}
        {` `}
        <a href="https://github.com/helloworldless">GitHub</a> | <a href="https://www.linkedin.com/in/david-good-5b652a1a/">LinkedIn</a> | <a href="https://twitter.com/helloworldless">Twitter</a>
      </p>
    </div>
  );
};

export default Bio;
