import { APP_NAME_CAPITALIZED } from "@clinai/shared";
import { useEffect } from "react";

interface SEOProps {
	title: string;
	description?: string;
	keywords?: string;
	author?: string;
	robots?: string;
}

const useSEO = ({ title }: SEOProps) => {
	useEffect(() => {
		document.title = `${title} | ${APP_NAME_CAPITALIZED}`;
	}, [title]);
};

export default useSEO;
