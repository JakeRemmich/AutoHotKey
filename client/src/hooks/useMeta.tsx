import { Helmet } from "react-helmet-async";

interface MetaProps {
    title?: string;
    description?: string;
    canonical?: string;
    image?: string;
}

export function useMeta({ title, description, canonical, image = "https://www.autohotkeygenerator.com/logo.png" }: MetaProps) {
    return (
        <Helmet>
            {title && <title>{title} </title>}
            {description && <meta name="description" content={description} />}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Open Graph */}
            {title && <meta property="og:title" content={title} />}
            {description && <meta property="og:description" content={description} />}
            {image && <meta property="og:image" content={image} />}
            {canonical && <meta property="og:url" content={canonical} />}

            {/* Twitter */}
            {title && <meta name="twitter:title" content={title} />}
            {description && <meta name="twitter:description" content={description} />}
            {image && <meta name="twitter:image" content={image} />}
            <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
    );
}
