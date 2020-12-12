/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import { graphql, useStaticQuery } from "gatsby";
import { constructAssetUrl } from "../utils/assetUrl";

const SEO = ({ description, lang, meta, title, imageSrc, imageAlt }) => {
  const { site, ogImageDefault } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            social {
              twitter
            }
            siteUrl
          }
        }
        ogImageDefault: file(relativePath: {eq: "icon.png"}) {
          childImageSharp {
            # These are the dimensions of the default file: content/assets/icon.png
            fixed(height: 260, width: 260) {
              src
            }
          }
        }
      }
    `,
  );

  const metaDescription = description || site.siteMetadata.description;
  const ogImage = imageSrc || constructAssetUrl(site.siteMetadata.siteUrl, ogImageDefault?.childImageSharp?.fixed?.src);

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={`%s | ${site.siteMetadata.title}`}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          name: "og:image",
          content: ogImage,
        },
        {
          name: `twitter:card`,
          // If image prop is passed use the larger card; Otherwise the default
          // og image is just a little icon so use the smaller card
          // More about cards here: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
          content: imageSrc ? `summary_large_image` : `summary`,
        },
        {
          name: `twitter:creator`,
          content: site.siteMetadata.social.twitter,
        },
        {
          name: `twitter:title`,
          content: title,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
        {
          name: "twitter:image",
          content: ogImage,
        },
        {
          name: "twitter:image:alt",
          content: imageAlt || "davidagood.com logo",
        },
      ].concat(meta)}
    />
  );
};

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  description: ``,
};

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string.isRequired,
};

export default SEO;
