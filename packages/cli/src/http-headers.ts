import { Service } from '@n8n/di';
import { IncomingHttpHeaders } from 'http';

interface HttpHeaders {
	host?: string;
	protocol?: string;
	'x-forwarded-host'?: string;
	'x-forwarded-proto'?: string;
}

@Service()
class HttpHeadersService implements HttpHeaders {
	host?: string;
	protocol?: string;
	'x-forwarded-host'?: string;
	'x-forwarded-proto'?: string;

	constructor(headers: IncomingHttpHeaders) {
		this.host = headers.host;
		this.protocol = headers.protocol as string;
		this['x-forwarded-host'] = headers['x-forwarded-host'] as string;
		this['x-forwarded-proto'] = headers['x-forwarded-proto'] as string;
	}
}

export default HttpHeadersService;
