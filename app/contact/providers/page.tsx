export const dynamic = "force-static"; // or remove `dynamic = 'error'` if present
export const fetchCache = "force-cache"; // if you use fetch() here and want it cached

import ProvidersClient from "./ProvidersClient";

export default function ProvidersPage() {
	return <ProvidersClient />;
}
