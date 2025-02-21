import { GlobalConfig } from '@n8n/config';
import { Service, Container } from 'typedi';

interface HttpHeaders {
	host?: string;
	protocol?: string;
	'x-forwarded-host'?: string;
	'x-forwarded-proto'?: string;
}

@Service()
export class UrlService {
	/** Returns the base URL n8n is reachable from */
	baseUrl: string;

	constructor(private readonly globalConfig: GlobalConfig) {
		// Initialize with config-only URL first
		this.baseUrl = this.generateBaseUrlFromConfig();
	}

	private generateBaseUrlFromConfig(): string {
		const { path, port, host, protocol } = this.globalConfig;
		if ((protocol === 'http' && port === 80) || (protocol === 'https' && port === 443)) {
			return `${protocol}://${host}${path}`;
		}
		return `${protocol}://${host}:${port}${path}`;
	}

	private generateBaseUrl(): string {
		try {
			const headers: HttpHeaders = Container.get('httpRequestHeaders') ?? {};
			const forwardedHost = headers['x-forwarded-host'];
			const host = headers.host;

			if (forwardedHost ?? host) {
				const protocol =
					headers.protocol ?? headers['x-forwarded-proto'] ?? this.globalConfig.protocol;
				const finalHost = forwardedHost ?? host;
				return `${protocol}://${finalHost}${this.globalConfig.path}`;
			}
		} catch {
			// Ignore error when headers are not available
		}

		return this.generateBaseUrlFromConfig();
	}

	/** Return the n8n instance base URL without trailing slash */
	getInstanceBaseUrl(): string {
		// Get fresh URL in case headers are now available
		this.baseUrl = this.generateBaseUrl();
		return this.baseUrl.replace(/\/$/, '');
	}

	/** Returns the base URL of the webhooks */
	getWebhookBaseUrl() {
		// Get fresh URL in case headers are now available
		this.baseUrl = this.generateBaseUrl();
		return this.baseUrl;
	}

	/** Remove leading and trailing double quotes from a URL. */
	private trimQuotes(url?: string) {
		return url?.replace(/^["]+|["]+$/g, '') ?? '';
	}
}
